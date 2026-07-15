// In-memory dummy database for "mock mode".
//
// When the app runs without a real backend (e.g. the Vercel deployment, or
// local dev before a server exists) every API call is served from here.
// The whole DB is persisted to localStorage so refreshes keep your changes,
// and any action (create / edit / complete / delete …) mutates this data just
// like the real Laravel API would. Call resetMockDb() to wipe back to seed.

const STORAGE_KEY = 'tktzain_mock_db';

// Bump this whenever the seed shape changes so browsers holding an older
// snapshot in localStorage automatically re-seed on next load.
const SEED_VERSION = 3;

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

function seed() {
  // Login accounts only — the ticket lists start completely empty so you can
  // add / import your own data on a clean slate. (To pre-load sample tickets
  // again, see git history of this file for the previous blueprint.)
  const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com', password: 'admin', phone: '07700000001', role: 'super_admin', is_active: true, created_at: ago(120), updated_at: ago(120) },
    { id: 2, name: 'Zain',  email: 'zain@example.com',  password: 'zain',  phone: '07700000002', role: 'zain',        is_active: true, created_at: ago(118), updated_at: ago(118) },
    { id: 3, name: 'الوسيط', email: 'alwaseet@example.com', password: 'alwaseet', phone: '07700000003', role: 'الوسيط',       is_active: true, created_at: ago(118), updated_at: ago(118) },
  ];

  return {
    version: SEED_VERSION,
    users,
    tickets: [], // no pending / completed tickets — empty by design
    tokens: {},  // token -> userId
    seq: {
      user: users.length,
      ticket: 0,
      ticketId: 0,
      activity: 0,
    },
  };
}

let db = null;

function load() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      // Older snapshots (different seed shape) are discarded and re-seeded so
      // everyone lands on the current empty-ticket starting point.
      if (stored.version === SEED_VERSION) {
        db = stored;
        // Tokens are intentionally not persisted long-term across resets, but
        // keeping them lets a refresh stay "logged in" in mock mode.
        if (!db.tokens) db.tokens = {};
        return db;
      }
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
