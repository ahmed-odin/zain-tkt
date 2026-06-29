// Axios adapter that serves every API request from the in-memory dummy DB.
//
// It mirrors the real Laravel API (routes/api.php + the controllers) closely
// enough that none of the Pinia stores, composables or views need to change:
// same URLs, same response envelopes, same role rules and validation errors.

import { getDb, persist, MOCK_GOVERNORATES } from './mockDb';

const LATENCY_MS = 220; // a touch of delay so loading states are visible

// ---- helpers -------------------------------------------------------------

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const ok = (config, data, status = 200) =>
  delay({ data, status, statusText: 'OK', headers: {}, config, request: {} });

// Reject the way axios does on an HTTP error, so `error.response` works.
const fail = (config, status, body) => {
  const error = new Error(body?.message || 'Request failed');
  error.isAxiosError = true;
  error.config = config;
  error.response = { data: body, status, statusText: 'Error', headers: {}, config };
  return delay().then(() => Promise.reject(error));
};

const nowIso = () => new Date().toISOString();

// Strip the baseURL + query string, returning just the API path ("/tickets/1").
const pathOf = (config) => {
  let url = config.url || '';
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.slice(config.baseURL.length);
  }
  url = url.replace(/^https?:\/\/[^/]+/i, '');
  const apiIdx = url.indexOf('/api');
  if (apiIdx >= 0) url = url.slice(apiIdx + 4);
  return url.split('?')[0];
};

const bodyOf = (config) => {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try { return JSON.parse(config.data); } catch { return {}; }
  }
  return config.data;
};

const tokenOf = (config) => {
  const auth = config.headers?.Authorization || config.headers?.authorization;
  return auth ? String(auth).replace(/^Bearer\s+/i, '') : null;
};

const currentUser = (config) => {
  const db = getDb();
  const token = tokenOf(config);
  const userId = token ? db.tokens[token] : null;
  return db.users.find((u) => u.id === userId) || null;
};

const publicUser = (u) => u && ({
  id: u.id, name: u.name, email: u.email, phone: u.phone ?? null,
  role: u.role, is_active: u.is_active, created_at: u.created_at, updated_at: u.updated_at,
});

// Shape a ticket the way the Eloquent model serializes it (creator/completer/activities).
const serializeTicket = (db, t) => {
  const userMini = (id) => {
    const u = db.users.find((x) => x.id === id);
    return u ? { id: u.id, name: u.name, email: u.email } : null;
  };
  return {
    id: t.id,
    ticket_id: t.ticket_id,
    missdn: t.missdn,
    governorate: t.governorate,
    comments: t.comments ?? '',
    alwaseet_company: t.alwaseet_company ?? null,
    status: t.status,
    created_by: t.created_by,
    completed_by: t.completed_by ?? null,
    completed_by_name: userMini(t.completed_by)?.name ?? null,
    completed_at: t.completed_at ?? null,
    created_at: t.created_at,
    updated_at: t.updated_at,
    creator: userMini(t.created_by),
    completer: userMini(t.completed_by),
    activities: [...(t.activities || [])]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at) || a.id - b.id)
      .map((a) => ({
        id: a.id,
        ticket_id: t.id,
        user_id: a.user_id,
        action: a.action,
        changes: a.changes ?? null,
        created_at: a.created_at,
        user: userMini(a.user_id),
      })),
  };
};

const addActivity = (db, ticket, userId, action, changes = null) => {
  db.seq.activity += 1;
  ticket.activities.push({
    id: db.seq.activity,
    user_id: userId,
    action,
    changes,
    created_at: nowIso(),
  });
};

const validationError = (config, errors) =>
  fail(config, 422, { success: false, message: Object.values(errors)[0][0], errors });

const isTenDigits = (v) => /^\d{10}$/.test(String(v ?? ''));

// ---- list (pending / completed) -----------------------------------------

function respondWithList(config, statuses) {
  const db = getDb();
  const p = config.params || {};
  let rows = db.tickets.filter((t) => statuses.includes(t.status));

  if (p.governorate) rows = rows.filter((t) => t.governorate === p.governorate);

  if (p.search) {
    const term = String(p.search).toLowerCase();
    rows = rows.filter((t) => {
      const creator = db.users.find((u) => u.id === t.created_by);
      const completer = db.users.find((u) => u.id === t.completed_by);
      return [t.missdn, t.comments, t.governorate, t.alwaseet_company, creator?.name, completer?.name]
        .some((f) => String(f ?? '').toLowerCase().includes(term));
    });
  }

  if (p.username) {
    const name = String(p.username).toLowerCase();
    rows = rows.filter((t) => {
      const creator = db.users.find((u) => u.id === t.created_by);
      return String(creator?.name ?? '').toLowerCase().includes(name);
    });
  }

  if (p.date_from) rows = rows.filter((t) => new Date(t.created_at) >= new Date(p.date_from));
  if (p.date_to) rows = rows.filter((t) => new Date(t.created_at) <= new Date(p.date_to));

  // latest() — newest first.
  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id);

  let perPage = parseInt(p.per_page, 10);
  perPage = perPage > 0 ? Math.min(perPage, 100) : 20;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(parseInt(p.page, 10) || 1, 1), lastPage);
  const slice = rows.slice((page - 1) * perPage, page * perPage);

  return ok(config, {
    success: true,
    tickets: slice.map((t) => serializeTicket(db, t)),
    meta: { current_page: page, last_page: lastPage, per_page: perPage, total },
  });
}

// ---- route table ---------------------------------------------------------

export function mockAdapter(config) {
  const db = getDb();
  const method = (config.method || 'get').toLowerCase();
  const path = pathOf(config);
  const body = bodyOf(config);

  // --- auth/login (public) ---
  if (path === '/auth/login' && method === 'post') {
    const identifier = body.email || body.username;
    if (!identifier || !body.password) {
      return validationError(config, { password: ['The login fields are required.'] });
    }
    const user = db.users.find((u) => u.email === identifier || u.name === identifier);
    if (!user || user.password !== body.password) {
      return fail(config, 401, { success: false, message: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return fail(config, 403, { success: false, message: 'User is inactive' });
    }
    const token = 'mock-' + user.id + '-' + Math.abs(Math.floor((Math.random() + user.id) * 1e9)).toString(36);
    db.tokens[token] = user.id;
    persist();
    return ok(config, {
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active },
    });
  }

  // Everything below requires authentication.
  const me = currentUser(config);
  if (!me) {
    return fail(config, 401, { success: false, message: 'Unauthenticated' });
  }

  // --- auth ---
  if (path === '/auth/logout' && method === 'post') {
    const token = tokenOf(config);
    if (token) delete db.tokens[token];
    persist();
    return ok(config, { success: true, message: 'Logged out successfully' });
  }
  if (path === '/auth/me' && method === 'get') {
    return ok(config, { success: true, user: publicUser(me) });
  }

  // --- tickets list / meta ---
  if (path === '/tickets/pending' && method === 'get') {
    return respondWithList(config, ['Pending', 'Reopened', 'Replied']);
  }
  if (path === '/tickets/completed' && method === 'get') {
    return respondWithList(config, ['Complete']);
  }
  if (path === '/tickets/governorates' && method === 'get') {
    return ok(config, { success: true, governorates: MOCK_GOVERNORATES });
  }
  if (path === '/tickets/filter-users' && method === 'get') {
    const ids = new Set();
    db.tickets.forEach((t) => { ids.add(t.created_by); if (t.completed_by) ids.add(t.completed_by); });
    const users = db.users
      .filter((u) => ids.has(u.id))
      .map((u) => ({ id: u.id, name: u.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const governorates = [...new Set(db.tickets.map((t) => t.governorate).filter(Boolean))].sort();
    return ok(config, { success: true, users, governorates });
  }

  // --- create ticket ---
  if (path === '/tickets' && method === 'post') {
    if (!['user', 'super_admin'].includes(me.role)) {
      return fail(config, 403, { success: false, message: 'You are not allowed to create tickets' });
    }
    if (!isTenDigits(body.missdn)) return validationError(config, { missdn: ['The missdn field must be 10 digits.'] });
    if (!body.governorate) return validationError(config, { governorate: ['The governorate field is required.'] });
    if (!['Pending', 'Complete'].includes(body.status)) {
      return validationError(config, { status: ['The selected status is invalid.'] });
    }
    db.seq.ticket += 1;
    db.seq.ticketId += 1;
    const ticket = {
      id: db.seq.ticket,
      ticket_id: db.seq.ticketId,
      missdn: String(body.missdn),
      governorate: body.governorate,
      comments: body.comments ?? null,
      alwaseet_company: null,
      status: body.status,
      created_by: me.id,
      completed_by: null,
      completed_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
      activities: [],
    };
    db.tickets.push(ticket);
    addActivity(db, ticket, me.id, 'created');
    persist();
    return ok(config, { success: true, message: 'Ticket created successfully', ticket: serializeTicket(db, ticket) }, 201);
  }

  // --- bulk create ---
  if (path === '/tickets/bulk' && method === 'post') {
    if (!['user', 'super_admin'].includes(me.role)) {
      return fail(config, 403, { success: false, message: 'You are not allowed to create tickets' });
    }
    const rows = Array.isArray(body.tickets) ? body.tickets : [];
    if (!rows.length) return validationError(config, { tickets: ['At least one ticket is required.'] });
    for (const row of rows) {
      if (!isTenDigits(row.missdn)) return validationError(config, { 'tickets.missdn': ['Each missdn must be 10 digits.'] });
      if (!row.governorate) return validationError(config, { 'tickets.governorate': ['Each governorate is required.'] });
    }
    const created = rows.map((row) => {
      db.seq.ticket += 1;
      db.seq.ticketId += 1;
      const ticket = {
        id: db.seq.ticket,
        ticket_id: db.seq.ticketId,
        missdn: String(row.missdn),
        governorate: row.governorate,
        comments: row.comments ?? null,
        alwaseet_company: null,
        status: 'Pending',
        created_by: me.id,
        completed_by: null,
        completed_at: null,
        created_at: nowIso(),
        updated_at: nowIso(),
        activities: [],
      };
      db.tickets.push(ticket);
      addActivity(db, ticket, me.id, 'created');
      return ticket;
    });
    persist();
    return ok(config, {
      success: true,
      message: 'Tickets imported successfully',
      count: created.length,
      tickets: created.map((t) => serializeTicket(db, t)),
    }, 201);
  }

  // --- per-ticket routes: /tickets/:id , /tickets/:id/complete , /tickets/:id/reply ---
  const ticketMatch = path.match(/^\/tickets\/(\d+)(\/complete|\/reply)?$/);
  if (ticketMatch) {
    const id = parseInt(ticketMatch[1], 10);
    const sub = ticketMatch[2];
    const ticket = db.tickets.find((t) => t.id === id);
    if (!ticket) return fail(config, 404, { success: false, message: 'Ticket not found' });

    // complete
    if (sub === '/complete' && method === 'post') {
      if (!['staff', 'super_admin'].includes(me.role)) {
        return fail(config, 403, { success: false, message: 'You are not allowed to complete tickets' });
      }
      if (!body.alwaseet_company) return validationError(config, { alwaseet_company: ['The Alwaseet Company field is required.'] });
      ticket.status = 'Complete';
      ticket.completed_by = me.id;
      ticket.completed_at = nowIso();
      ticket.alwaseet_company = body.alwaseet_company;
      ticket.updated_at = nowIso();
      addActivity(db, ticket, me.id, 'completed');
      persist();
      return ok(config, { success: true, message: 'Ticket marked as complete', ticket: serializeTicket(db, ticket) });
    }

    // reply
    if (sub === '/reply' && method === 'post') {
      if (me.id !== ticket.created_by && me.role !== 'super_admin') {
        return fail(config, 403, { success: false, message: 'Unauthorized' });
      }
      if (ticket.status !== 'Reopened') {
        return fail(config, 422, { success: false, message: 'Only reopened tickets can be replied to' });
      }
      if (!body.reply) return validationError(config, { reply: ['The reply field is required.'] });
      ticket.status = 'Replied';
      ticket.updated_at = nowIso();
      addActivity(db, ticket, me.id, 'replied', { reply: String(body.reply).trim() });
      persist();
      return ok(config, { success: true, message: 'Reply sent', ticket: serializeTicket(db, ticket) });
    }

    // update
    if (!sub && method === 'put') {
      const prevStatus = ticket.status;
      let changedContent = [];
      const trackContent = (field, value) => {
        if (value !== undefined && value !== ticket[field]) {
          ticket[field] = value;
          changedContent.push(field);
        }
      };

      if (me.role === 'super_admin') {
        if (body.missdn !== undefined && !isTenDigits(body.missdn)) {
          return validationError(config, { missdn: ['The missdn field must be 10 digits.'] });
        }
        trackContent('missdn', body.missdn !== undefined ? String(body.missdn) : undefined);
        trackContent('governorate', body.governorate);
        trackContent('comments', body.comments);
        trackContent('alwaseet_company', body.alwaseet_company);
        applyStatus(db, ticket, body.status, me, body.reopen_reason);
      } else if (me.role === 'staff') {
        trackContent('alwaseet_company', body.alwaseet_company);
        applyStatus(db, ticket, body.status, me, body.reopen_reason);
      } else if (me.role === 'user') {
        if (me.id !== ticket.created_by) {
          return fail(config, 403, { success: false, message: 'Unauthorized' });
        }
        if (ticket.status === 'Complete') {
          return fail(config, 403, { success: false, message: 'Completed tickets cannot be edited' });
        }
        if (body.missdn !== undefined && !isTenDigits(body.missdn)) {
          return validationError(config, { missdn: ['The missdn field must be 10 digits.'] });
        }
        trackContent('missdn', body.missdn !== undefined ? String(body.missdn) : undefined);
        trackContent('governorate', body.governorate);
        trackContent('comments', body.comments);
      } else {
        return fail(config, 403, { success: false, message: 'Unauthorized' });
      }

      ticket.updated_at = nowIso();

      // Mirror the controller's activity logging: a status transition is its
      // own event and is not also logged as a content edit.
      if (ticket.status !== prevStatus) {
        if (ticket.status === 'Complete') addActivity(db, ticket, me.id, 'completed');
        else if (ticket.status === 'Reopened') {
          const reason = body.reopen_reason ? String(body.reopen_reason).trim() : null;
          addActivity(db, ticket, me.id, 'reopened', reason ? { reason } : null);
        }
      } else if (changedContent.length) {
        addActivity(db, ticket, me.id, 'edited', { fields: changedContent });
      }

      persist();
      return ok(config, { success: true, message: 'Ticket updated successfully', ticket: serializeTicket(db, ticket) });
    }

    // delete
    if (!sub && method === 'delete') {
      if (me.role !== 'super_admin') {
        return fail(config, 403, { success: false, message: 'Only super admins can delete tickets' });
      }
      db.tickets = db.tickets.filter((t) => t.id !== id);
      persist();
      return ok(config, { success: true, message: 'Ticket deleted successfully' });
    }
  }

  // --- users ---
  if (path === '/users' && method === 'get') {
    if (me.role !== 'super_admin') return fail(config, 403, { success: false, message: 'Unauthorized' });
    return ok(config, { success: true, users: db.users.map(publicUser) });
  }
  if (path === '/users' && method === 'post') {
    if (me.role !== 'super_admin') return fail(config, 403, { success: false, message: 'Unauthorized' });
    if (!body.name) return validationError(config, { name: ['The name field is required.'] });
    if (!body.email) return validationError(config, { email: ['The email field is required.'] });
    if (db.users.some((u) => u.email === body.email)) {
      return validationError(config, { email: ['The email has already been taken.'] });
    }
    if (!body.password || String(body.password).length < 6) {
      return validationError(config, { password: ['The password must be at least 6 characters.'] });
    }
    if (!['super_admin', 'user', 'staff'].includes(body.role)) {
      return validationError(config, { role: ['The selected role is invalid.'] });
    }
    db.seq.user += 1;
    const user = {
      id: db.seq.user,
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone ?? null,
      role: body.role,
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.users.push(user);
    persist();
    return ok(config, { success: true, message: 'User created successfully', user: publicUser(user) }, 201);
  }

  const userMatch = path.match(/^\/users\/(\d+)$/);
  if (userMatch) {
    const id = parseInt(userMatch[1], 10);
    if (me.role !== 'super_admin') return fail(config, 403, { success: false, message: 'Unauthorized' });
    const user = db.users.find((u) => u.id === id);
    if (!user) return fail(config, 404, { success: false, message: 'User not found' });

    if (method === 'put') {
      if (body.email !== undefined && db.users.some((u) => u.email === body.email && u.id !== id)) {
        return validationError(config, { email: ['The email has already been taken.'] });
      }
      if (body.password !== undefined && body.password !== null && body.password !== '' && String(body.password).length < 6) {
        return validationError(config, { password: ['The password must be at least 6 characters.'] });
      }
      if (body.name !== undefined) user.name = body.name;
      if (body.email !== undefined) user.email = body.email;
      if (body.phone !== undefined) user.phone = body.phone;
      if (body.role !== undefined) user.role = body.role;
      if (body.is_active !== undefined) user.is_active = !!body.is_active;
      if (body.password) user.password = body.password;
      user.updated_at = nowIso();
      persist();
      return ok(config, { success: true, message: 'User updated successfully', user: publicUser(user) });
    }

    if (method === 'delete') {
      if (id === me.id) {
        return fail(config, 422, { success: false, message: 'You cannot delete your own account' });
      }
      db.users = db.users.filter((u) => u.id !== id);
      persist();
      return ok(config, { success: true, message: 'User deleted successfully' });
    }
  }

  return fail(config, 404, { success: false, message: `Mock endpoint not found: ${method.toUpperCase()} ${path}` });
}

// Mirror TicketController@applyCompletionMeta for status transitions.
function applyStatus(db, ticket, status, user, reopenReason) {
  if (status === undefined) return;
  let next = status;
  // Sending a completed ticket back to work becomes "Reopened", not "Pending".
  if (ticket.status === 'Complete' && next === 'Pending') next = 'Reopened';

  if (next === 'Complete' && ticket.status !== 'Complete') {
    ticket.completed_by = user.id;
    ticket.completed_at = nowIso();
  } else if (['Pending', 'Reopened', 'Replied'].includes(next)) {
    ticket.completed_by = null;
    ticket.completed_at = null;
  }
  ticket.status = next;
}
