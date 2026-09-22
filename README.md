# Mini SaaS Dashboard

List, filter, search, create and edit projects — each with a status, deadline,
assigned team member and budget. Sessions are authenticated with a JWT held in
an httpOnly cookie.

| Folder      | Stack                                                | Port |
| ----------- | ---------------------------------------------------- | ---- |
| `backend/`  | Next.js API routes, MongoDB via Mongoose, JWT auth   | 4000 |
| `frontend/` | Next.js App Router, Tailwind CSS, SWR, React Hook Form | 3000 |

The two are separate applications with their own dependencies and Dockerfiles.
The backend serves no UI; the frontend calls it across origins with credentials.

---

## Quick start with Docker

```bash
cp .env.example .env      # ships with a development-only JWT secret
docker compose up --build
```

Then open <http://localhost:3000> and sign in:

```
demo@saasdash.dev / demo12345
```

Compose starts MongoDB, waits for it to report healthy, seeds the database,
then starts the API and the dashboard. The seed step runs on every `up` but
skips itself once the volume holds data, so restarting never discards your work.

If a port is already taken, override it in `.env` — `FRONTEND_PORT`,
`BACKEND_PORT` and `MONGO_PORT` are all read by Compose.

To start over from an empty database:

```bash
docker compose down -v && docker compose up --build
```

---

## Running without Docker

You need Node 20+ and a MongoDB instance.

```bash
# 1. MongoDB (or point at one you already run)
docker run -d --name saas-mongo -p 27017:27017 mongo:7

# 2. API
cd backend
cp .env.example .env.local     # set JWT_SECRET to 32+ characters
npm install
npm run seed                   # fills the database
npm run dev                    # http://localhost:4000

# 3. Dashboard, in a second terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

### Scripts

| Command             | Where      | Purpose                                  |
| ------------------- | ---------- | ---------------------------------------- |
| `npm run dev`       | both       | Development server                       |
| `npm run build`     | both       | Production build                         |
| `npm start`         | both       | Serve a production build                 |
| `npm run lint`      | both       | ESLint                                   |
| `npm run typecheck` | both       | `tsc --noEmit`                           |
| `npm run seed`      | `backend/` | Seed the database; `-- --if-empty` to skip when populated |

---

## Seeding

`npm run seed` fetches the team roster from
[JSONPlaceholder](https://jsonplaceholder.typicode.com/users) and creates 48
projects across those 10 people, spread over three statuses and a mix of past,
imminent and distant deadlines.

Project names come from a local vocabulary rather than the API: JSONPlaceholder's
`/posts` and `/todos` carry only lorem ipsum, and *"sunt aut facere repellat
provident"* as a project name makes the dashboard unreadable. If the API cannot
be reached the seeder falls back to a bundled copy of the roster, so seeding
works offline and in CI.

Generation is driven by a fixed PRNG seed and deadlines land on UTC midnight,
so re-seeding on the same day reproduces the database exactly.

---

## API

Base URL `http://localhost:4000`. Every response uses one of two envelopes:

```jsonc
{ "data": … , "meta": { … } }                  // success
{ "error": { "code": "…", "message": "…", "details": { … } } }  // failure
```

`details` carries per-field messages the form renders beside its inputs.

| Method   | Endpoint                | Auth | Notes                                |
| -------- | ----------------------- | ---- | ------------------------------------ |
| `POST`   | `/api/auth/register`    | –    | Creates an account and signs in       |
| `POST`   | `/api/auth/login`       | –    | Sets the session cookie               |
| `POST`   | `/api/auth/logout`      | –    | Clears it; `204`                      |
| `GET`    | `/api/auth/me`          | ✓    | Current user                          |
| `GET`    | `/api/projects`         | ✓    | Filter, search, sort, paginate        |
| `POST`   | `/api/projects`         | ✓    | `201`                                 |
| `GET`    | `/api/projects/:id`     | ✓    |                                       |
| `PATCH`  | `/api/projects/:id`     | ✓    | Updates the fields provided           |
| `PUT`    | `/api/projects/:id`     | ✓    | Full replacement; all fields required |
| `DELETE` | `/api/projects/:id`     | ✓    | `204`                                 |
| `GET`    | `/api/team-members`     | ✓    | Assignable people                     |
| `GET`    | `/api/health`           | –    | Reports database state                |

### Listing projects

```
GET /api/projects?status=active&search=billing&sort=deadline&order=asc&page=1&limit=20
```

| Parameter  | Values                                          | Default    |
| ---------- | ----------------------------------------------- | ---------- |
| `status`   | `active`, `on_hold`, `completed`, `all`          | all        |
| `assignee` | team member id                                   | –          |
| `search`   | matches project name, description and assignee name | –       |
| `sort`     | `deadline`, `name`, `budget`, `status`, `createdAt` | `deadline` |
| `order`    | `asc`, `desc`                                    | `asc`      |
| `page`     | ≥ 1                                              | `1`        |
| `limit`    | 1–100                                            | `20`       |

Search input is regex-escaped, so `.` matches a literal dot. Results are ordered
by a secondary `_id` key so records cannot shift between pages mid-read.

### Project shape

```jsonc
{
  "id": "6ab2…",
  "name": "Atlas Billing Migration",
  "description": "Move invoicing off the legacy cluster without downtime.",
  "status": "active",              // active | on_hold | completed
  "deadline": "2027-03-15T00:00:00.000Z",
  "budget": 48500,                 // whole euros
  "assignee": { "id": "…", "name": "…", "email": "…", "role": "…" },
  "createdAt": "…",
  "updatedAt": "…"
}
```

---

## Layout

```
backend/
  app/api/          route handlers, one folder per resource
  lib/
    auth/           password hashing, JWT signing, cookie session
    http/           route wrappers, response envelopes, request parsing
    validation/     zod schemas for bodies and query strings
    db.ts           cached mongoose connection
    env.ts          configuration, validated on first use
  models/           mongoose schemas
  scripts/seed.ts   database seeding
  proxy.ts          CORS for the dashboard origin

frontend/
  src/app/          routes; (dashboard) is the authenticated area
  src/components/
    ui/             Button, Input, Select, Modal, StatusBadge…
    projects/       table, filters, form modal, pagination
    layout/         app shell and the auth guard
  src/hooks/        data fetching and URL-backed filter state
  src/lib/          API client, formatting, shared types
  src/providers/    session context
  src/proxy.ts      redirects on cookie presence
```

---

## Design notes

**Authentication.** Signing in sets an httpOnly, SameSite=Lax cookie holding a
JWT, so no token is reachable from JavaScript. The cookie's lifetime is derived
from the token's own `exp` claim, so the two cannot drift apart. Login answers a
wrong email and a wrong password identically, and always performs a bcrypt
comparison, so responses cannot be used to discover which accounts exist.

**Two origins.** The dashboard runs on port 3000 and the API on 4000. Cookies
ignore ports, so the browser sends the session to both. On separate subdomains
in production, set `COOKIE_DOMAIN` on the API so the cookie is shared.

**Route protection is opt-out.** `authedRoute()` rejects a request before the
handler runs, so a new private endpoint cannot be left open by forgetting a
check. On the client the guard runs twice: `proxy.ts` redirects on cookie
presence to avoid a flash of dashboard shell, and `RequireAuth` confirms with
the API, since the signing secret lives only on the backend.

**Stateless sessions.** Authorisation trusts the token signature and does not
re-read the user on every request. A deleted account therefore keeps a working
token until it expires; `/api/auth/me` does check the database and clears the
cookie when the user is gone. A denylist would close that window at the cost of
a read per request.

**Filters live in the URL.** Status, search, sort and page are query parameters,
so a filtered view can be bookmarked, shared and restored by the back button.

**Money.** Budgets are stored as whole euros in a `Number`. Amounts needing
sub-unit precision should move to integer minor units before any arithmetic is
added.

**Dates.** Deadlines are stored at UTC midnight and formatted in UTC. Formatting
them in local time would show the previous day for anyone west of Greenwich.

**Shared types are duplicated.** `frontend/src/lib/types.ts` mirrors the API
DTOs by hand. A shared workspace package would remove the duplication but
complicate both Dockerfiles for about sixty lines of types; the tradeoff felt
wrong at this size.

**MongoDB is pinned to 7.** Version 8 fails to start on Linux kernels 6.19 and
newer ([SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912)).

## Known gaps

- Sorting is available on desktop table headers only; the mobile card list has
  search and filtering but no sort control.
- There are no automated tests in the repository. Behaviour was verified through
  the running application — the API with scripted HTTP calls, the dashboard with
  a headless browser covering sign-in, filtering, search, sorting, pagination
  and the full create/edit/delete cycle.
