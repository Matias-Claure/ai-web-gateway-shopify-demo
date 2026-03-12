import { Router } from "express";
import { availableActions } from "../config/actions";
import { getEnv } from "../config/env";
import { getActionState, updateActionState } from "../lib/actionRegistry";

const DASHBOARD_COOKIE = "ai_gateway_dashboard";

export const dashboardRouter = Router();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    })
  );
}

function isAuthenticated(cookieHeader: string | undefined): boolean {
  const cookies = parseCookies(cookieHeader);
  return cookies[DASHBOARD_COOKIE] === getEnv().AI_GATEWAY_API_KEY;
}

function renderLogin(errorMessage?: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gateway Dashboard</title>
    <style>
      :root { color-scheme: light; --bg: #f4efe6; --panel: #fffaf2; --ink: #1f1b16; --muted: #6e6255; --line: #d8c9b4; --accent: #b85c38; --accent-ink: #fff7f1; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; font-family: Georgia, "Times New Roman", serif; background:
        radial-gradient(circle at top left, rgba(184,92,56,0.18), transparent 32%),
        linear-gradient(135deg, #f8f2e7, #efe5d5 60%, #e6d8c2); color: var(--ink); display: grid; place-items: center; padding: 24px; }
      .card { width: min(440px, 100%); background: var(--panel); border: 1px solid var(--line); border-radius: 24px; padding: 28px; box-shadow: 0 18px 60px rgba(74, 49, 28, 0.15); }
      h1 { margin: 0 0 8px; font-size: 2rem; }
      p { margin: 0 0 18px; color: var(--muted); line-height: 1.5; }
      label { display: block; margin-bottom: 8px; font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
      input { width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid var(--line); font: inherit; background: white; }
      button { margin-top: 14px; width: 100%; border: 0; border-radius: 999px; padding: 14px 18px; background: var(--accent); color: var(--accent-ink); font: inherit; font-weight: 700; cursor: pointer; }
      .error { margin: 0 0 16px; color: #8d1f10; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Gateway Dashboard</h1>
      <p>Use your current AI gateway key to manage which actions are exposed to AI clients.</p>
      ${errorMessage ? `<p class="error">${errorMessage}</p>` : ""}
      <form method="post" action="/dashboard/login">
        <label for="password">Gateway Key</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Open Dashboard</button>
      </form>
    </main>
  </body>
</html>`;
}

function renderDashboard(): string {
  const state = getActionState();
  const activeCount = availableActions.filter((action) => state[action.name] !== false).length;
  const cards = availableActions
    .map((action) => {
      const enabled = state[action.name] !== false;
      const params = Object.entries(action.params)
        .map(([key, value]) => `${key}: ${value.type}${value.required ? " required" : ""}`)
        .join(" • ");

      return `<label class="card">
        <div class="card-top">
          <div>
            <div class="eyebrow">${action.method} ${action.path}</div>
            <h2>${action.name}</h2>
          </div>
          <span class="pill ${enabled ? "pill-on" : "pill-off"}">${enabled ? "Enabled" : "Disabled"}</span>
        </div>
        <p>${action.description}</p>
        <p class="meta">Risk: ${action.risk} • Params: ${params}</p>
        <p class="meta">Default state: ${action.enabledByDefault ? "enabled" : "disabled"}</p>
        <div class="toggle">
          <input type="checkbox" name="enabledActions" value="${action.name}" ${enabled ? "checked" : ""} />
          <span>Expose this action in the manifest and allow route execution</span>
        </div>
      </label>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gateway Dashboard</title>
    <style>
      :root { color-scheme: light; --bg: #f1eadc; --panel: rgba(255,250,242,0.9); --ink: #1e1b18; --muted: #65584a; --line: #d7c6b0; --accent: #0e6b50; --accent-2: #b85c38; --shadow: rgba(39, 28, 18, 0.12); }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; font-family: Georgia, "Times New Roman", serif; color: var(--ink); background:
        radial-gradient(circle at 10% 10%, rgba(184,92,56,0.18), transparent 24%),
        radial-gradient(circle at 90% 20%, rgba(14,107,80,0.16), transparent 22%),
        linear-gradient(160deg, #f4ecdf, #e9dcc8 58%, #e0cfb8); }
      .shell { width: min(980px, calc(100% - 32px)); margin: 36px auto; }
      .hero { background: var(--panel); border: 1px solid var(--line); border-radius: 28px; padding: 28px; box-shadow: 0 24px 80px var(--shadow); backdrop-filter: blur(10px); }
      .eyebrow { color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.78rem; }
      h1 { margin: 8px 0 10px; font-size: clamp(2.2rem, 5vw, 4rem); line-height: 0.95; }
      .lead { margin: 0; max-width: 720px; color: var(--muted); line-height: 1.6; }
      .summary { display: inline-flex; margin-top: 18px; border-radius: 999px; padding: 8px 14px; background: rgba(30, 27, 24, 0.06); color: var(--muted); font-size: 0.9rem; }
      form { margin-top: 24px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
      .card { display: block; background: rgba(255,255,255,0.72); border: 1px solid var(--line); border-radius: 22px; padding: 18px; box-shadow: 0 14px 36px rgba(59, 39, 23, 0.08); }
      .card-top { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
      h2 { margin: 6px 0 8px; font-size: 1.35rem; }
      p { margin: 0 0 10px; line-height: 1.5; }
      .meta { color: var(--muted); font-size: 0.92rem; }
      .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
      .pill-on { background: rgba(14,107,80,0.12); color: var(--accent); }
      .pill-off { background: rgba(184,92,56,0.12); color: var(--accent-2); }
      .toggle { display: flex; gap: 10px; align-items: center; margin-top: 14px; font-size: 0.98rem; }
      .toggle input { width: 20px; height: 20px; accent-color: var(--accent); }
      .actions { display: flex; gap: 12px; margin-top: 22px; flex-wrap: wrap; }
      button, .ghost { border: 0; border-radius: 999px; padding: 13px 18px; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
      button { background: var(--accent); color: white; }
      .ghost { background: transparent; color: var(--muted); border: 1px solid var(--line); }
      .hint { margin-top: 14px; color: var(--muted); font-size: 0.95rem; }
      @media (max-width: 640px) { .shell { width: calc(100% - 20px); margin: 16px auto; } .hero { padding: 20px; border-radius: 22px; } }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="eyebrow">Local Admin Surface</div>
        <h1>Control the gateway your AI sees.</h1>
        <p class="lead">This dashboard shows every AI API call currently supported by the gateway. Toggle any call on or off. Disabled calls are removed from the manifest and blocked at runtime.</p>
        <div class="summary">${activeCount} of ${availableActions.length} available AI calls currently active</div>
        <form method="post" action="/dashboard/actions">
          <div class="grid">${cards}</div>
          <div class="actions">
            <button type="submit">Save Action Settings</button>
            <a class="ghost" href="/.well-known/ai-interface.json" target="_blank" rel="noreferrer">View Live Manifest</a>
            <a class="ghost" href="/dashboard/logout">Log Out</a>
          </div>
          <p class="hint">Settings persist to a local JSON file and apply immediately.</p>
        </form>
      </section>
    </main>
  </body>
</html>`;
}

dashboardRouter.get("/", (req, res) => {
  if (!isAuthenticated(req.headers.cookie)) {
    res.status(401).send(renderLogin());
    return;
  }

  res.send(renderDashboard());
});

dashboardRouter.post("/login", (req, res) => {
  if (req.body.password !== getEnv().AI_GATEWAY_API_KEY) {
    res.status(401).send(renderLogin("That key does not match the current gateway configuration."));
    return;
  }

  res.setHeader(
    "Set-Cookie",
    `${DASHBOARD_COOKIE}=${encodeURIComponent(getEnv().AI_GATEWAY_API_KEY)}; HttpOnly; Path=/; SameSite=Lax`
  );
  res.redirect("/dashboard");
});

dashboardRouter.post("/actions", (req, res) => {
  if (!isAuthenticated(req.headers.cookie)) {
    res.status(401).send(renderLogin());
    return;
  }

  const raw = req.body.enabledActions;
  const enabledActions = Array.isArray(raw) ? raw : raw ? [raw] : [];
  updateActionState(enabledActions);
  res.redirect("/dashboard");
});

dashboardRouter.get("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", `${DASHBOARD_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  res.redirect("/dashboard");
});
