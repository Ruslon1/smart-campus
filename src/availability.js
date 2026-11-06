import { FIXED_NOW } from './data.js';

export function minutes(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

export function validateInterval(start, end) {
  const from = minutes(start);
  const to = minutes(end);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 'Enter valid start and end times.';
  if (to <= from) return 'End time must be later than start time on the same day.';
  if (from < minutes(FIXED_NOW)) return 'Start time must be at or after 09:00.';
  if (to - from > 120) return 'Choose an interval of 120 minutes or less.';
  return '';
}

export function checkAvailability(room, start, end) {
  const error = validateInterval(start, end);
  if (error) return { available: false, status: 'invalid', message: error };
  if (room.blocked) return { available: false, status: 'blocked', message: `${room.name} is closed for maintenance.` };
  const overlap = room.bookings.some(booking =>
    minutes(start) < minutes(booking.end) && minutes(end) > minutes(booking.start));
  return overlap
    ? { available: false, status: 'booked', message: `${room.name} is already booked during this interval.` }
    : { available: true, status: 'available', message: `${room.name} is available from ${start} to ${end}.` };
}
