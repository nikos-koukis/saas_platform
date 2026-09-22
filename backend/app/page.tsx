const ENDPOINTS = [
  "POST   /api/auth/register",
  "POST   /api/auth/login",
  "POST   /api/auth/logout",
  "GET    /api/auth/me",
  "GET    /api/projects",
  "POST   /api/projects",
  "GET    /api/projects/:id",
  "PATCH  /api/projects/:id",
  "DELETE /api/projects/:id",
  "GET    /api/team-members",
  "GET    /api/health",
];

/** Service index page. The dashboard UI lives in the separate `frontend` app. */
export default function ApiIndexPage() {
  return (
    <main style={{ fontFamily: "ui-monospace, monospace", padding: "2rem", lineHeight: 1.7 }}>
      <h1>SaaS Platform API</h1>
      <pre>{ENDPOINTS.join("\n")}</pre>
    </main>
  );
}
