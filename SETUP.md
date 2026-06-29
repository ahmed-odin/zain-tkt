# Zain Ticket System — Frontend (`zain-tkt`)

Vue 3 + Vite UI for the ticket system.

## Mock mode (dummy data — no backend) — **ON by default**

The app ships with a built-in **mock mode** so it works standalone with no
server: every API call is served from seeded **dummy data** kept in your
browser (localStorage), and every action — login, create / edit / complete /
reopen / reply / delete tickets, manage users — mutates that data just like the
real API would. This is what powers the **Vercel deployment**
(https://zain-tkt.vercel.app) until a real host is purchased.

- Log in with the same demo accounts below (e.g. `Admin` / `admin`).
- Your changes persist across refreshes. To wipe back to the original sample
  data, open the browser console and run `window.__resetMockData()` then reload.
- Mock mode needs **no `.env` and no backend** — `npm run dev` just works.

When you buy hosting and deploy the Laravel API, switch to it by creating a
`.env` here (see `.env.example`):

```
VITE_USE_MOCK=false
VITE_API_URL=https://your-api-host/api
```

The rest of this guide is for running against the **real backend** (start it
first — see `tktzainbackend/SETUP.md`).

## Prerequisites

- **Node.js 22.18+** (or 24.12+) and npm
- The backend API running at **http://localhost:8000** with seeded accounts

## Run it

```bash
cd zain-tkt
npm install
npm run dev          # http://localhost:5173
```

Open http://localhost:5173 and log in.

### API URL

By default the app calls `http://localhost:8000/api`. To point at a different
backend, create a `.env` file here:

```
VITE_API_URL=http://localhost:8000/api
```

### Default logins (created by the backend seeder)

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `Admin` | `admin` |
| User | `User` | `user` |
| Staff | `Staff` | `staff` |

## Build for production

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build
```

## Notes

- Language: English / Arabic (RTL) toggle in the navbar.
- If you get CORS or network errors, confirm the backend is running on
  `http://localhost:8000` and that this app runs on `http://localhost:5173`
  (both are allowed in the backend's `config/cors.php`).
