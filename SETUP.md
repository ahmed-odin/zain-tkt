# Zain Ticket System — Frontend (`zain-tkt`)

Vue 3 + Vite UI for the ticket system. It talks to the Laravel API in the
`tktzainbackend` repo, so **start the backend first** (see
`tktzainbackend/SETUP.md`).

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
