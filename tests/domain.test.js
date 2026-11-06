import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rooms } from '../src/data.js';
import { minutes, validateInterval, checkAvailability } from '../src/availability.js';
import { filterRooms } from '../src/filtering.js';
import { deriveState } from '../src/state.js';
import { check as baselineCheck } from '../baseline/app.js';

const quiet = rooms[0];
const lab = rooms[1];
const studio = rooms[2];
const hall = rooms[3];
const criteria = { attendees: 6, equipment: [], selectedId: quiet.id, start: '11:00', end: '12:00' };

test('data has four rooms with distinct IDs and complete fields', () => {
  assert.equal(rooms.length, 4);
  assert.equal(new Set(rooms.map(r => r.id)).size, 4);
  for (const room of rooms) {
    assert.ok(room.name && room.id);
    assert.ok(Number.isInteger(room.capacity));
    assert.ok(Array.isArray(room.equipment) && Array.isArray(room.bookings));
    assert.equal(typeof room.blocked, 'boolean');
  }
});
test('AC1 strict HH:mm parsing rejects malformed times', () => {
  for (const value of ['', '9:00', '24:00', '12:60', 'abc']) assert.ok(Number.isNaN(minutes(value)));
  assert.equal(minutes('23:59'), 1439);
});
test('AC1 rejects past start', () => assert.match(validateInterval('08:59', '09:30'), /at or after/));
test('AC1 permits start exactly at fixed current time', () => assert.equal(checkAvailability(quiet, '09:00', '09:30').available, true));
test('AC1 rejects equal endpoints', () => assert.match(validateInterval('11:00', '11:00'), /later/));
test('AC1 rejects reverse and overnight intervals', () => assert.match(validateInterval('23:00', '01:00'), /same day/));
test('AC1 rejects empty time input', () => assert.equal(checkAvailability(quiet, '', '12:00').status, 'invalid'));
test('AC2 permits exactly 120 minutes', () => assert.equal(checkAvailability(quiet, '11:00', '13:00').available, true));
test('AC2 rejects 121 minutes', () => assert.match(validateInterval('11:00', '13:01'), /120/));
test('AC2 permits one minute', () => assert.equal(checkAvailability(quiet, '11:00', '11:01').available, true));
test('AC3 and F3 blocked room never available', () => assert.equal(checkAvailability(hall, '11:00', '12:00').status, 'blocked'));
test('AC4 touching previous booking end is allowed', () => assert.equal(checkAvailability(quiet, '11:00', '12:00').available, true));
test('AC4 touching next booking start is allowed', () => assert.equal(checkAvailability(quiet, '09:00', '10:00').available, true));
test('AC4 overlapping one minute is rejected', () => assert.equal(checkAvailability(quiet, '09:59', '10:01').status, 'booked'));
test('AC4 interval contained in booking is rejected', () => assert.equal(checkAvailability(quiet, '10:15', '10:30').status, 'booked'));
test('AC4 interval containing booking is rejected', () => assert.equal(checkAvailability(quiet, '09:30', '11:30').status, 'booked'));
test('AC4 identical interval is rejected', () => assert.equal(checkAvailability(quiet, '10:00', '11:00').status, 'booked'));
test('AC5 checks and filters leave fixtures unchanged', () => {
  const before = JSON.stringify(rooms);
  checkAvailability(quiet, '10:00', '11:00'); checkAvailability(lab, '11:00', '12:00');
  filterRooms(rooms, 10, ['Projector']); deriveState(criteria);
  assert.equal(JSON.stringify(rooms), before);
});
test('AC5 nested booking fixtures are frozen', () => assert.throws(() => { quiet.bookings[0].start = '00:00'; }, TypeError));
test('F1 exact capacity is included', () => assert.ok(filterRooms(rooms, 8, []).includes(quiet)));
test('F1 insufficient capacity is excluded', () => assert.ok(!filterRooms(rooms, 9, []).includes(quiet)));
test('F1 invalid attendee counts produce no matches', () => {
  for (const value of [0, -1, 1.5, NaN]) assert.deepEqual(filterRooms(rooms, value, []), []);
});
test('F2 all required equipment must be present', () => assert.deepEqual(filterRooms(rooms, 1, ['Projector', 'Whiteboard']).map(r => r.id), ['B204', 'D105']));
test('F2 single equipment match', () => assert.deepEqual(filterRooms(rooms, 1, ['Computers']), [studio]));
test('F2 no equipment requirement returns all capacity matches', () => assert.equal(filterRooms(rooms, 1, []).length, 4));
test('F2 capacity and equipment combine', () => assert.deepEqual(filterRooms(rooms, 21, ['Whiteboard']), [hall]));
test('F3 blocked room stays visible but result is blocked', () => {
  const state = deriveState({ ...criteria, selectedId: hall.id });
  assert.ok(state.matchingRooms.includes(hall));
  assert.equal(state.result.available, false);
});
test('F4 empty catalog yields clear empty result', () => {
  const state = deriveState({ ...criteria, attendees: 100 });
  assert.equal(state.matchingRooms.length, 0);
  assert.equal(state.selectedRoom, undefined);
  assert.match(state.result.message, /No rooms match/);
});
test('F4 impossible equipment combination yields no rooms', () => assert.deepEqual(filterRooms(rooms, 1, ['Computers', 'Microphone']), []));
test('F5 room switching recomputes availability using own bookings', () => {
  assert.equal(deriveState(criteria).result.status, 'available');
  assert.equal(deriveState({ ...criteria, selectedId: studio.id }).result.status, 'booked');
  assert.equal(deriveState({ ...criteria, selectedId: lab.id }).result.status, 'available');
});
test('F5 filtering away selection selects first matching room', () => {
  const state = deriveState({ ...criteria, attendees: 10 });
  assert.equal(state.selectedRoom.id, lab.id);
  assert.match(state.result.message, /Collaboration Lab/);
});
test('F5 time changes recompute selected room availability', () => {
  assert.equal(deriveState(criteria).result.available, true);
  assert.equal(deriveState({ ...criteria, start: '10:00', end: '11:00' }).result.status, 'booked');
});
test('regression same single-room outcomes before and after refactoring', () => {
  for (const [start, end] of [['08:00','09:00'], ['09:00','10:00'], ['10:00','11:00'], ['11:00','12:00'], ['11:00','13:00'], ['11:00','13:01'], ['12:00','12:00'], ['bad','13:00']]) {
    assert.equal(checkAvailability(quiet, start, end).available, baselineCheck(start, end).available, `${start}-${end}`);
  }
});
