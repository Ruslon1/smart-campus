import { rooms } from './data.js';
import { filterRooms } from './filtering.js';
import { checkAvailability } from './availability.js';

// Recompute all derived state in one place so no stale availability survives a change.
export function deriveState({ attendees, equipment, selectedId, start, end }) {
  const matchingRooms = filterRooms(rooms, attendees, equipment);
  const selectedRoom = matchingRooms.find(room => room.id === selectedId) ?? matchingRooms[0];
  const result = selectedRoom
    ? checkAvailability(selectedRoom, start, end)
    : { available: false, status: 'empty', message: 'No rooms match your requirements. Try fewer attendees or less equipment.' };
  return { matchingRooms, selectedRoom, result };
}
