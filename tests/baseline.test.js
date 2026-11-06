import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, room, preview } from '../baseline/app.js';

test('baseline AC1 rejects invalid and past time', () => {
  assert.equal(check('25:00', '26:00').available, false);
  assert.equal(check('08:00', '09:00').available, false);
  assert.equal(check('11:00', '11:00').available, false);
});
test('baseline AC2 permits exactly 120 minutes', () => assert.equal(check('11:00', '13:00').available, true));
test('baseline AC2 rejects 121 minutes', () => assert.equal(check('11:00', '13:01').available, false));
test('baseline AC3 rejects a blocked room', () => assert.equal(check('11:00', '12:00', {...room, blocked: true}).available, false));
test('baseline AC4 permits touching intervals', () => {
  assert.equal(check('09:00', '10:00').available, true);
  assert.equal(check('11:00', '12:00').available, true);
});
test('baseline AC4 rejects overlap', () => assert.equal(check('10:30', '11:30').available, false));
test('baseline AC5 does not mutate booking data', () => {
  const before = JSON.stringify(room);
  check('10:00', '11:00'); check('11:00', '12:00');
  assert.equal(JSON.stringify(room), before);
});
test('baseline preview validates duration', () => {
  assert.equal(preview('11:00', '12:00'), '60 minute request');
  assert.match(preview('11:00', '13:01'), /valid interval/);
});
