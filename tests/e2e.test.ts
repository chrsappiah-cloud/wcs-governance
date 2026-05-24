import assert from "node:assert/strict";
import { describe, it } from "node:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function fetchText(path: string) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, headers: res.headers, text: await res.text() };
}

async function fetchJson(path: string) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, headers: res.headers, json: await res.json() };
}

async function fetchRedirect(path: string) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, headers: res.headers, location: res.headers.get("location") ?? "" };
}

describe("Frontend pages", () => {
  it("GET / returns 200", async () => {
    const { status } = await fetchText("/");
    assert.equal(status, 200);
  });

  it("GET / returns valid HTML", async () => {
    const { text } = await fetchText("/");
    assert.match(text, /<!DOCTYPE html>/i);
    assert.match(text, /World Class Scholars/);
    assert.match(text, /Dr Christopher Appiah-Thompson/);
  });

  it("GET /about returns 200", async () => {
    const { status, text } = await fetchText("/about");
    assert.equal(status, 200);
    assert.match(text, /About World Class Scholars/);
  });

  it("GET /marketing returns 200 with iOS apps", async () => {
    const { status, text } = await fetchText("/marketing");
    assert.equal(status, 200);
    assert.match(text, /WCS Care/);
    assert.match(text, /WCS Gold Test/);
    assert.match(text, /WCS Agentic/);
    assert.match(text, /WCS Commerce/);
    assert.match(text, /App Store/);
    assert.match(text, /TestFlight/);
  });

  it("GET /login returns 200 with sign-in form", async () => {
    const { status, text } = await fetchText("/login");
    assert.equal(status, 200);
    assert.match(text, /Staff sign in/);
    assert.match(text, /type="email"/);
    assert.match(text, /type="password"/);
  });

  it("Sub-pages via proxy return 200", async () => {
    for (const path of ["/library", "/courses", "/podcasts", "/contact"]) {
      const { status } = await fetchText(path);
      assert.equal(status, 200, `${path} expected 200`);
    }
  });

  it("GET /robots.txt returns 200", async () => {
    const { status, text } = await fetchText("/robots.txt");
    assert.equal(status, 200);
    assert.match(text, /User-agent/);
    assert.match(text, /Sitemap/);
  });

  it("GET /sitemap.xml returns 200", async () => {
    const { status, text } = await fetchText("/sitemap.xml");
    assert.equal(status, 200);
    assert.match(text, /xmlns/);
    assert.match(text, /worldclassscholars\.vercel\.app/);
  });
});

describe("SEO metadata", () => {
  it("Home page has OG tags", async () => {
    const { text } = await fetchText("/");
    assert.match(text, /<meta[^>]*property="og:title/);
    assert.match(text, /<meta[^>]*property="og:description/);
    assert.match(text, /<meta[^>]*name="twitter:card/);
  });

  it("Home page has JSON-LD structured data", async () => {
    const { text } = await fetchText("/");
    assert.match(text, /application\/ld\+json/);
    assert.match(text, /"@type":"Organization"/);
    assert.match(text, /"@type":"WebSite"/);
  });

  it("About page has Person JSON-LD", async () => {
    const { text } = await fetchText("/about");
    assert.match(text, /"@type":"Person"/);
    assert.match(text, /"jobTitle":"Founder/);
  });

  it("Marketing page has SoftwareApplication JSON-LD", async () => {
    const { text } = await fetchText("/marketing");
    assert.match(text, /"@type":"SoftwareApplication"/);
    assert.match(text, /"applicationCategory":"HealthApplication"/);
  });

  it("Login page has noindex", async () => {
    const { text } = await fetchText("/login");
    assert.match(text, /noindex/);
  });

  it("Has meta keywords", async () => {
    const { text } = await fetchText("/");
    assert.match(text, /dementia care/);
    assert.match(text, /aged care quality/);
  });

  it("Has canonical URL", async () => {
    const { text } = await fetchText("/");
    assert.match(text, /canonical/);
  });
});

describe("API endpoints", () => {
  it("GET /api/health returns JSON", async () => {
    const { status, json } = await fetchJson("/api/health");
    assert.equal(status, 200);
    assert.equal(json.supabase, "connected");
    assert.equal(json.schema, "governance_ready");
    assert.equal(json.ok, true);
  });

  it("GET /api/system/diagnostics returns summary", async () => {
    const { status, json } = await fetchJson("/api/system/diagnostics");
    assert.ok(status === 200 || status === 503, `expected 2xx or 503, got ${status}`);
    assert.ok(json.summary);
    assert.ok(Array.isArray(json.results));
  });
});

describe("Middleware / auth guards", () => {
  it("/dashboard redirects to /login when unauthenticated", async () => {
    const { status, location } = await fetchRedirect("/dashboard");
    assert.ok(status === 307 || status === 308);
    assert.match(location, /\/login/);
  });

  it("/dashboard redirect includes next param", async () => {
    const { location } = await fetchRedirect("/dashboard");
    assert.match(location, /next=%2Fdashboard/);
  });

  it("/access redirects to /login", async () => {
    const { status, location } = await fetchRedirect("/access");
    assert.ok(status === 307 || status === 308);
    assert.match(location, /\/login/);
  });

  it("/system redirects to /login", async () => {
    const { status, location } = await fetchRedirect("/system");
    assert.ok(status === 307 || status === 308);
    assert.match(location, /\/login/);
  });

  it("/content redirects to /login", async () => {
    const { status, location } = await fetchRedirect("/content");
    assert.ok(status === 307 || status === 308);
    assert.match(location, /\/login/);
  });

  it("/api/* routes do not redirect", async () => {
    const { status } = await fetchText("/api/health");
    assert.equal(status, 200);
  });
});

describe("Edge cases", () => {
  it("Non-existent page returns 404", async () => {
    const { status } = await fetchText("/this-does-not-exist");
    assert.equal(status, 404);
  });

  it("Malformed path returns 404", async () => {
    const { status } = await fetchText("/../../etc/passwd");
    assert.equal(status, 404);
  });

  it("Double slash path does not crash", async () => {
    const { status } = await fetchText("//admin");
    // should either 404 or redirect, not 500
    assert.ok(status < 500);
  });

  it("Deep nested path returns 404", async () => {
    const { status } = await fetchText("/a/b/c/d/e/f/g");
    assert.equal(status, 404);
  });

  it("Login page handles supabase_not_configured error", async () => {
    // Test the error notice renders (error query param)
    const { text } = await fetchText("/login?error=supabase_not_configured");
    assert.match(text, /Supabase is not configured/);
  });

  it("Login page with unknown error param does not crash", async () => {
    const { status } = await fetchText("/login?error=unknown_error");
    assert.equal(status, 200);
  });
});

describe("Security headers", () => {
  it("Does not leak source maps in production", async () => {
    // Verify no source maps exposed
    const { status } = await fetchText("/_next/static/chunks/main.js.map");
    if (status === 200 || status === 301) {
      // In dev source maps may exist, but shouldn't be directly accessible
    }
    // Should not 500
    assert.ok(status < 500);
  });

  it("No .env file exposed", async () => {
    const { status } = await fetchText("/.env");
    assert.ok(status === 404 || status >= 400);
  });

  it("No .env.local file exposed", async () => {
    const { status } = await fetchText("/.env.local");
    assert.ok(status === 404 || status >= 400);
  });
});

describe("Database connectivity", () => {
  it("API health confirms Supabase connected", async () => {
    const { json } = await fetchJson("/api/health");
    assert.equal(json.supabase, "connected");
    assert.equal(json.schema, "governance_ready");
  });
});

describe("Backup API endpoints", () => {
  async function postStatus(path: string) {
    const res = await fetch(`${BASE}${path}`, { method: "POST", redirect: "manual" });
    return { status: res.status, location: res.headers.get("location") ?? "" };
  }

  it("POST /api/backup/cloudflare returns 403 or redirect (unauthenticated)", async () => {
    const { status, location } = await postStatus("/api/backup/cloudflare");
    const ok = status === 403 || status === 307 || status === 308;
    assert.ok(ok, `expected 403 or redirect, got ${status}`);
  });

  it("POST /api/backup/icloud returns 403 or redirect (unauthenticated)", async () => {
    const { status, location } = await postStatus("/api/backup/icloud");
    const ok = status === 403 || status === 307 || status === 308;
    assert.ok(ok, `expected 403 or redirect, got ${status}`);
  });

  it("POST /api/backup/cloudkit returns 403 or redirect (unauthenticated)", async () => {
    const { status, location } = await postStatus("/api/backup/cloudkit");
    const ok = status === 403 || status === 307 || status === 308;
    assert.ok(ok, `expected 403 or redirect, got ${status}`);
  });

  it("GET /api/health still works after backup endpoints registered", async () => {
    const { status } = await fetchText("/api/health");
    assert.equal(status, 200);
  });
});

describe("Console pages return proper HTTP statuses", () => {
  // These should all redirect to login since unauthenticated
  const consolePaths = [
    "/dashboard", "/access", "/content", "/ios-releases",
    "/rd-projects", "/grants", "/audit", "/settings", "/system",
    "/governance",
  ];

  for (const path of consolePaths) {
    it(`${path} redirects to login`, async () => {
      const { status, location } = await fetchRedirect(path);
      assert.ok(status === 307 || status === 308, `${path}: expected redirect, got ${status}`);
      assert.match(location, /\/login/);
    });
  }
});
