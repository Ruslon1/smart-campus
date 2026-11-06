import { rooms, equipmentOptions, FIXED_DATE } from './data.js';
import { minutes, validateInterval } from './availability.js';
import { deriveState } from './state.js';

const form = document.querySelector('#requirements');
const roomList = document.querySelector('#room-list');
const availability = document.querySelector('#availability');
let selectedId = rooms[0].id;

document.querySelector('#fixed-date').textContent = FIXED_DATE;
document.querySelector('#equipment-options').innerHTML = equipmentOptions.map(item =>
  `<label class="checkbox"><input type="checkbox" name="equipment" value="${item}"><span>${item}</span></label>`).join('');

function render() {
  const attendees = Number(form.elements.attendees.value);
  const equipment = [...form.querySelectorAll('[name="equipment"]:checked')].map(input => input.value);
  const start = form.elements.start.value;
  const end = form.elements.end.value;
  const { matchingRooms, selectedRoom, result } = deriveState({ attendees, equipment, selectedId, start, end });
  selectedId = selectedRoom?.id;
  const invalidAttendees = !Number.isInteger(attendees) || attendees < 1;
  document.querySelector('#attendees-error').hidden = !invalidAttendees;
  form.elements.attendees.setAttribute('aria-invalid', String(invalidAttendees));
  const timeError = validateInterval(start, end);
  document.querySelector('#time-error').textContent = timeError;
  document.querySelector('#time-error').hidden = !timeError;
  for (const field of [form.elements.start, form.elements.end]) field.setAttribute('aria-invalid', String(Boolean(timeError)));
  document.querySelector('#room-count').textContent = `(${matchingRooms.length})`;
  document.querySelector('#empty-state').hidden = matchingRooms.length > 0;
  roomList.innerHTML = matchingRooms.map(room => `<button type="button" class="room-card ${room.id === selectedId ? 'selected' : ''}" data-room-id="${room.id}" aria-pressed="${room.id === selectedId}">
    <div class="card-top"><span class="room-id">${room.id}</span><span class="room-badge ${room.blocked ? 'closed' : ''}">${room.blocked ? 'Maintenance' : 'Open for checks'}</span></div>
    <h3>${room.name}</h3><p class="location">${room.location}</p><p class="description">${room.description}</p>
    <div class="card-bottom"><span>Up to <strong>${room.capacity}</strong> people</span><span class="select-indicator" aria-hidden="true">${room.id === selectedId ? '✓' : '↗'}</span></div>
    <div class="tags">${room.equipment.map(item => `<span>${item}</span>`).join('')}</div></button>`).join('');
  document.querySelector('#selected-detail').innerHTML = selectedRoom
    ? `<div class="selected-summary"><div><h3>${selectedRoom.name} <span>${selectedRoom.id}</span></h3><p class="muted small">Today’s bookings: ${selectedRoom.bookings.length ? selectedRoom.bookings.map(booking => `${booking.start}–${booking.end}`).join(', ') : 'None'}</p></div><span class="duration">${timeError ? 'Check time' : `${minutes(end) - minutes(start)} min`}</span></div>`
    : '<p class="muted">Choose different requirements to find a room.</p>';
  availability.className = `availability ${result.status}`;
  availability.textContent = result.message;
}

form.addEventListener('input', render);
form.addEventListener('submit', event => { event.preventDefault(); render(); });
roomList.addEventListener('click', event => {
  const button = event.target.closest('[data-room-id]');
  if (!button) return;
  selectedId = button.dataset.roomId;
  render();
  roomList.querySelector(`[data-room-id="${selectedId}"]`).focus();
});
document.querySelector('#reset').addEventListener('click', () => { form.reset(); selectedId = rooms[0].id; render(); });
render();
