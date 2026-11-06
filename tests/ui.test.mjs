import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright';

let server;
let browser;
let page;
const errors = [];
before(async () => {
  server = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '4174' } });
  await once(server.stdout, 'data');
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); server?.kill(); });
beforeEach(async () => {
  errors.length = 0;
  page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4174');
  await page.locator('.room-card').first().waitFor();
});
afterEach(async () => { await page.close(); assert.deepEqual(errors, []); });

async function status() { return page.locator('#availability').textContent(); }
async function choose(id) { await page.locator(`[data-room-id="${id}"]`).click(); }

test('UI AC6 initial screen is labelled and shows four rooms', async () => {
  assert.equal(await page.getByRole('heading', { name: 'Find your space.' }).count(), 1);
  assert.equal(await page.locator('.room-card').count(), 4);
  assert.match(await status(), /Quiet Study is available/);
  assert.equal(await page.locator('#availability').getAttribute('aria-live'), 'polite');
  await page.screenshot({ path: 'evidence/desktop.png', fullPage: true });
});
test('UI F1 exact capacity includes room and one extra attendee excludes it', async () => {
  await page.getByLabel('How many people?').fill('8');
  assert.equal(await page.locator('[data-room-id="A101"]').count(), 1);
  await page.getByLabel('How many people?').fill('9');
  assert.equal(await page.locator('[data-room-id="A101"]').count(), 0);
  assert.match(await status(), /Collaboration Lab is available/);
});
test('UI F2 requires all selected equipment', async () => {
  await page.getByLabel('Projector', { exact: true }).check();
  await page.getByLabel('Whiteboard', { exact: true }).check();
  assert.deepEqual(await page.locator('.room-card').evaluateAll(cards => cards.map(card => card.dataset.roomId)), ['B204', 'D105']);
  await page.screenshot({ path: 'evidence/filtered.png', fullPage: true });
});
test('UI F3 blocked room displays maintenance and never available', async () => {
  await choose('D105');
  assert.match(await status(), /closed for maintenance/);
  assert.equal(await page.locator('#availability').getAttribute('class'), 'availability blocked');
  await page.screenshot({ path: 'evidence/blocked.png', fullPage: true });
});
test('UI F4 impossible equipment shows clear empty state and clears stale result', async () => {
  await page.getByLabel('Computers', { exact: true }).check();
  await page.getByLabel('Microphone', { exact: true }).check();
  assert.equal(await page.locator('.room-card').count(), 0);
  assert.equal(await page.locator('#empty-state').isVisible(), true);
  assert.match(await status(), /No rooms match/);
  await page.screenshot({ path: 'evidence/empty.png', fullPage: true });
});
test('UI F5 switching rooms refreshes bookings and availability immediately', async () => {
  await choose('C310');
  assert.match(await status(), /already booked/);
  assert.match(await page.locator('#selected-detail').textContent(), /11:00–12:30/);
  await choose('B204');
  assert.match(await status(), /Collaboration Lab is available/);
  assert.match(await page.locator('#selected-detail').textContent(), /13:00–14:00/);
  await page.screenshot({ path: 'evidence/switched.png', fullPage: true });
});
test('UI AC1 changing time rejects past time and reversed interval', async () => {
  await page.getByLabel('From', { exact: true }).fill('08:00');
  assert.match(await status(), /at or after 09:00/);
  await page.getByLabel('From', { exact: true }).fill('13:00');
  assert.match(await status(), /End time must be later/);
});
test('UI AC2 exactly 120 minutes passes and 121 fails', async () => {
  await page.getByLabel('Until', { exact: true }).fill('13:00');
  assert.match(await status(), /is available/);
  await page.getByLabel('Until', { exact: true }).fill('13:01');
  assert.match(await status(), /120 minutes or less/);
});
test('UI AC4 touching booking works and overlap fails', async () => {
  await page.getByLabel('From', { exact: true }).fill('09:00');
  await page.getByLabel('Until', { exact: true }).fill('10:00');
  assert.match(await status(), /is available/);
  await page.getByLabel('Until', { exact: true }).fill('10:01');
  assert.match(await status(), /already booked/);
});
test('UI invalid attendees give explicit error', async () => {
  await page.getByLabel('How many people?').fill('0');
  assert.equal(await page.locator('#attendees-error').isVisible(), true);
  assert.equal(await page.getByLabel('How many people?').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('.room-card').count(), 0);
});
test('UI reset restores default selection and filters', async () => {
  await page.getByLabel('Computers', { exact: true }).check();
  await page.getByLabel('Until', { exact: true }).fill('13:01');
  await page.getByRole('button', { name: 'Reset requirements' }).click();
  assert.equal(await page.locator('.room-card').count(), 4);
  assert.equal(await page.getByLabel('Until', { exact: true }).inputValue(), '12:00');
  assert.match(await status(), /Quiet Study is available/);
});
test('UI AC5 submitting checks does not mutate booking data', async () => {
  const snapshot = () => page.evaluate(async () => JSON.stringify((await import('/src/data.js')).rooms));
  const before = await snapshot();
  await page.getByRole('button', { name: 'Check availability' }).click();
  await choose('C310');
  await page.getByRole('button', { name: 'Check availability' }).click();
  assert.equal(await snapshot(), before);
});
test('UI AC6 keyboard selection preserves focus after rerender', async () => {
  const room = page.locator('[data-room-id="B204"]');
  await room.focus(); await page.keyboard.press('Enter');
  assert.equal(await room.getAttribute('aria-pressed'), 'true');
  assert.equal(await room.evaluate(element => element === document.activeElement), true);
});
test('UI AC6 mobile layout at 390px has no horizontal overflow', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await choose('C310');
  assert.match(await status(), /already booked/);
  await page.screenshot({ path: 'evidence/mobile.png', fullPage: true });
});
