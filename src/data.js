export const FIXED_NOW = '09:00';
export const FIXED_DATE = '6 November 2026';
export const rooms = Object.freeze([
  { id: 'A101', name: 'Quiet Study', capacity: 8, equipment: ['Whiteboard'], blocked: false,
    bookings: [{ start: '10:00', end: '11:00' }], location: 'North wing · Floor 1', description: 'A quiet space for focused work and small study groups.' },
  { id: 'B204', name: 'Collaboration Lab', capacity: 20, equipment: ['Whiteboard', 'Projector'], blocked: false,
    bookings: [{ start: '13:00', end: '14:00' }], location: 'East wing · Floor 2', description: 'Bring the team together for workshops and presentations.' },
  { id: 'C310', name: 'Computer Studio', capacity: 30, equipment: ['Projector', 'Computers'], blocked: false,
    bookings: [{ start: '11:00', end: '12:30' }], location: 'Technology building · Floor 3', description: 'A practical lab for coding sessions and digital projects.' },
  { id: 'D105', name: 'Seminar Hall', capacity: 60, equipment: ['Whiteboard', 'Projector', 'Microphone'], blocked: true,
    bookings: [], location: 'South wing · Floor 1', description: 'A large teaching space, currently closed for maintenance.' },
].map(room => Object.freeze({ ...room, equipment: Object.freeze(room.equipment),
  bookings: Object.freeze(room.bookings.map(Object.freeze)) })));
export const equipmentOptions = Object.freeze([...new Set(rooms.flatMap(room => room.equipment))].sort());
