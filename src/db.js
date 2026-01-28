import Dexie from 'dexie';

export const db = new Dexie('CalendarAppDB');

db.version(1).stores({
  events: '++id, title, date, startTime, endTime, entityId, mode',
  entities: '++id, &name, color',
  settings: 'key'
});

// Default entities to seed if empty
export const DEFAULT_ENTITIES = [
  { name: 'Lavoro', color: '#1976D2' },
  { name: 'Personale', color: '#388E3C' },
  { name: 'Salute', color: '#D32F2F' },
  { name: 'Studio', color: '#F57C00' },
  { name: 'Progetti', color: '#7B1FA2' },
  { name: 'Urgenti', color: '#C2185B' }
];

db.on('populate', () => {
  db.entities.bulkAdd(DEFAULT_ENTITIES);
  db.settings.bulkAdd([
    { key: 'theme', value: 'light' },
    { key: 'language', value: 'it' },
    { key: 'notifications', value: true }
  ]);
});

db.open().catch(err => {
  console.error('Failed to open db:', err);
});

/**
 * @typedef {Object} Event
 * @property {number} [id]
 * @property {string} title
 * @property {string} date
 * @property {string} startTime
 * @property {string} endTime
 * @property {number} duration
 * @property {'online' | 'presence'} mode
 * @property {string} [location]
 * @property {string} [meetingUrl]
 * @property {number} entityId
 * @property {string} [materials]
 * @property {string} [notes]
 * @property {'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'} [recurrence]
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} Entity
 * @property {number} [id]
 * @property {string} name
 * @property {string} color
 */

/**
 * @typedef {Object} AppSettings
 * @property {string} key
 * @property {any} value
 */
