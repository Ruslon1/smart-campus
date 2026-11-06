export function filterRooms(rooms, attendees, requiredEquipment) {
  if (!Number.isInteger(attendees) || attendees < 1) return [];
  return rooms.filter(room => room.capacity >= attendees &&
    requiredEquipment.every(item => room.equipment.includes(item)));
}
