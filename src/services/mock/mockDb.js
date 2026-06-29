// In-memory dummy database for "mock mode".
//
// When the app runs without a real backend (e.g. the Vercel deployment, or
// local dev before a server exists) every API call is served from here.
// The whole DB is persisted to localStorage so refreshes keep your changes,
// and any action (create / edit / complete / delete …) mutates this data just
// like the real Laravel API would. Call resetMockDb() to wipe back to seed.

const STORAGE_KEY = 'tktzain_mock_db';

const GOVERNORATES = [
  'Baghdad', 'Basra', 'Mosul', 'Kirkuk', 'Erbil',
  'Sulaymaniyah', 'Duhok', 'Anbar', 'Salah ad-Din',
  'Diyala', 'Wasit', 'Babylon', 'Karbala', 'Najaf',
  'Muthanna', 'Dhiqar', 'Maysan', 'Nineveh',
];

// Build an ISO timestamp `daysAgo` days (and optional hours) before now.
const ago = (days, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

// Deterministic 10-digit MISSDN-looking phone number.
const missdn = (n) => '07' + String(700000000 + n * 131713).slice(0, 8);

function seed() {
  const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com', password: 'admin', phone: '07700000001', role: 'super_admin', is_active: true, created_at: ago(120), updated_at: ago(120) },
    { id: 2, name: 'User',  email: 'user@example.com',  password: 'user',  phone: '07700000002', role: 'user',        is_active: true, created_at: ago(118), updated_at: ago(118) },
    { id: 3, name: 'Staff', email: 'staff@example.com', password: 'staff', phone: '07700000003', role: 'staff',       is_active: true, created_at: ago(118), updated_at: ago(118) },
    { id: 4, name: 'Sara Kareem', email: 'sara@example.com', password: 'password', phone: '07700000004', role: 'user',  is_active: true,  created_at: ago(90), updated_at: ago(90) },
    { id: 5, name: 'Omar Hadi',   email: 'omar@example.com', password: 'password', phone: '07700000005', role: 'staff', is_active: false, created_at: ago(60), updated_at: ago(10) },
  ];

  // Helper to create an activity row.
  let activitySeq = 0;
  const act = (action, userId, at, changes = null) => ({
    id: ++activitySeq,
    user_id: userId,
    action,
    changes,
    created_at: at,
  });

  const tickets = [];
  let id = 0;

  // A spread of pending / reopened / replied / complete tickets across users.
  const blueprint = [
    { gov: 'Baghdad',      status: 'Complete', by: 2, done: 3, comments: 'No internet since morning', company: 'Earthlink',     d: 25 },
    { gov: 'Basra',        status: 'Pending',  by: 2, comments: 'Slow speed during evenings',          d: 2 },
    { gov: 'Erbil',        status: 'Complete', by: 4, done: 3, comments: 'Router keeps disconnecting', company: 'IQ Networks',   d: 18 },
    { gov: 'Najaf',        status: 'Pending',  by: 4, comments: 'New line installation request',        d: 1 },
    { gov: 'Mosul',        status: 'Reopened', by: 2, done: 3, comments: 'Still dropping after fix',    company: 'TARIN',         d: 9, reason: 'Customer reports the issue returned' },
    { gov: 'Kirkuk',       status: 'Complete', by: 4, done: 3, comments: 'Fiber cut on the street',     company: 'HulumTele',     d: 30 },
    { gov: 'Karbala',      status: 'Replied',  by: 2, done: 3, comments: 'Intermittent outage',         d: 6, reason: 'Need more details', reply: 'It happens daily around 8pm' },
    { gov: 'Sulaymaniyah', status: 'Pending',  by: 4, comments: 'Modem replacement needed',             d: 3 },
    { gov: 'Babylon',      status: 'Complete', by: 2, done: 3, comments: 'IP configuration problem',    company: 'Earthlink',     d: 14 },
    { gov: 'Diyala',       status: 'Pending',  by: 2, comments: 'Account suspended by mistake',         d: 4 },
    { gov: 'Anbar',        status: 'Complete', by: 4, done: 3, comments: 'DNS not resolving',           company: 'IQ Networks',   d: 21 },
    { gov: 'Wasit',        status: 'Pending',  by: 4, comments: 'Requesting speed upgrade',             d: 5 },
    { gov: 'Duhok',        status: 'Complete', by: 2, done: 3, comments: 'No signal on ONT',            company: 'TARIN',         d: 40 },
    { gov: 'Maysan',       status: 'Reopened', by: 4, done: 3, comments: 'Billing dispute',             d: 7, reason: 'Charge still showing' },
    { gov: 'Dhiqar',       status: 'Pending',  by: 2, comments: 'Slow upload speed',                    d: 1 },
    { gov: 'Nineveh',      status: 'Complete', by: 4, done: 3, comments: 'Frequent disconnects at night', company: 'HulumTele',  d: 11 },
    { gov: 'Salah ad-Din', status: 'Pending',  by: 4, comments: 'Cannot reach support hotline',         d: 2 },
    { gov: 'Muthanna',     status: 'Complete', by: 2, done: 3, comments: 'Static IP request',           company: 'Earthlink',     d: 33 },
  ];

  blueprint.forEach((b, i) => {
    id += 1;
    const createdAt = ago(b.d, 2);
    const activities = [act('created', b.by, createdAt)];

    let completed_by = null;
    let completed_at = null;
    let alwaseet_company = null;

    if (b.status === 'Complete') {
      completed_by = b.done;
      completed_at = ago(Math.max(0, b.d - 1), 1);
      alwaseet_company = b.company || null;
      activities.push(act('completed', b.done, completed_at));
    }
    if (b.status === 'Reopened') {
      alwaseet_company = b.company || null;
      const completedAt = ago(b.d, 1);
      activities.push(act('completed', b.done, completedAt));
      activities.push(act('reopened', b.done, ago(Math.max(0, b.d - 1)), b.reason ? { reason: b.reason } : null));
    }
    if (b.status === 'Replied') {
      alwaseet_company = b.company || null;
      activities.push(act('completed', b.done, ago(b.d, 1)));
      activities.push(act('reopened', b.done, ago(Math.max(0, b.d - 1), 6), b.reason ? { reason: b.reason } : null));
      activities.push(act('replied', b.by, ago(Math.max(0, b.d - 1)), b.reply ? { reply: b.reply } : null));
    }

    tickets.push({
      id,
      ticket_id: i + 1,
      missdn: missdn(i + 1),
      governorate: b.gov,
      comments: b.comments,
      alwaseet_company,
      status: b.status,
      created_by: b.by,
      completed_by,
      completed_at,
      created_at: createdAt,
      updated_at: completed_at || createdAt,
      activities,
    });
  });

  return {
    users,
    tickets,
    tokens: {}, // token -> userId
    seq: {
      user: users.length,
      ticket: id,
      ticketId: blueprint.length,
      activity: activitySeq,
    },
  };
}

let db = null;

function load() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      db = JSON.parse(raw);
      // Tokens are intentionally not persisted long-term across resets, but
      // keeping them lets a refresh stay "logged in" in mock mode.
      if (!db.tokens) db.tokens = {};
      return db;
    }
  } catch {
    // fall through to a fresh seed
  }
  db = seed();
  save();
  return db;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // localStorage may be unavailable (private mode); mock still works in memory.
  }
}

export function getDb() {
  return load();
}

export function persist() {
  save();
}

export function resetMockDb() {
  db = seed();
  save();
  return db;
}

export const MOCK_GOVERNORATES = GOVERNORATES;

// Expose a manual reset in the browser console: window.__resetMockData()
if (typeof window !== 'undefined') {
  window.__resetMockData = () => {
    resetMockDb();
    // eslint-disable-next-line no-console
    console.info('[mock] dummy data reset to seed. Reload the page.');
  };
}
