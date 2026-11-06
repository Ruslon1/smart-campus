// Reconstructed single-room prototype, not the original Assignment 03 submission.
export const room = {
  id: 'A101', name: 'Quiet Study', capacity: 8,
  equipment: ['Whiteboard'], blocked: false,
  bookings: [{ start: '10:00', end: '11:00' }],
};
export const now = '09:00';

function minutes(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

export function preview(start, end) {
  const duration = minutes(end) - minutes(start);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 120) {
    return 'Choose a valid interval of up to 120 minutes.';
  }
  return `${duration} minute request`;
}

export function check(start, end, selectedRoom = room) {
  const from = minutes(start);
  const to = minutes(end);
  const duration = to - from;
  if (!Number.isFinite(duration) || duration <= 0 || duration > 120) {
    return { available: false, message: 'Choose a valid interval of up to 120 minutes.' };
  }
  if (from < minutes(now)) return { available: false, message: 'Start time is in the past.' };
  if (selectedRoom.blocked) return { available: false, message: 'Room is blocked.' };
  if (selectedRoom.bookings.some(b => from < minutes(b.end) && to > minutes(b.start))) {
    return { available: false, message: 'Room is already booked.' };
  }
  return { available: true, message: 'Room is available.' };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('form');
  const result = document.querySelector('#result');
  form.addEventListener('input', () => {
    result.textContent = preview(form.elements.start.value, form.elements.end.value);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    result.textContent = check(form.elements.start.value, form.elements.end.value).message;
  });
}
