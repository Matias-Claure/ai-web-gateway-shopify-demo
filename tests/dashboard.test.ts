import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("dashboard", () => {
  let settingsFile: string;

  beforeEach(() => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gateway-dashboard-"));
    settingsFile = path.join(tempDir, "action-settings.json");
    process.env.AI_GATEWAY_API_KEY = "test-key";
    process.env.ACTION_SETTINGS_FILE = settingsFile;
  });

  afterEach(() => {
    if (fs.existsSync(settingsFile)) {
      fs.rmSync(path.dirname(settingsFile), { recursive: true, force: true });
    }
  });

  it("renders the login page when unauthenticated", async () => {
    const response = await request(createApp()).get("/dashboard");

    expect(response.status).toBe(401);
    expect(response.text).toContain("Gateway Dashboard");
    expect(response.text).toContain("Open Dashboard");
  });

  it("updates action settings after login", async () => {
    const login = await request(createApp())
      .post("/dashboard/login")
      .type("form")
      .send({ password: "test-key" });

    expect(login.status).toBe(302);

    const cookie = login.headers["set-cookie"][0].split(";")[0];

    const save = await request(createApp())
      .post("/dashboard/actions")
      .set("Cookie", cookie)
      .type("form")
      .send({ enabledActions: ["search_products", "get_product_details"] });

    expect(save.status).toBe(302);

    const manifest = await request(createApp()).get("/.well-known/ai-interface.json");
    expect(manifest.body.actions).toHaveLength(2);
    expect(manifest.body.actions.map((action: { name: string }) => action.name)).not.toContain(
      "create_checkout_link"
    );
  });

  it("blocks disabled actions at runtime", async () => {
    await request(createApp())
      .post("/dashboard/login")
      .type("form")
      .send({ password: "test-key" });

    fs.writeFileSync(
      settingsFile,
      JSON.stringify({
        search_products: false,
        get_product_details: true,
        create_checkout_link: true
      })
    );

    const response = await request(createApp())
      .get("/ai/search-products?q=shirt")
      .set("x-ai-gateway-key", "test-key");

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("ActionDisabled");
  });

  it("shows all available API calls with current defaults active", async () => {
    const login = await request(createApp())
      .post("/dashboard/login")
      .type("form")
      .send({ password: "test-key" });

    const cookie = login.headers["set-cookie"][0].split(";")[0];

    const dashboard = await request(createApp()).get("/dashboard").set("Cookie", cookie);

    expect(dashboard.status).toBe(200);
    expect(dashboard.text).toContain("4 of 4 available AI calls currently active");
    expect(dashboard.text).toContain("search_products");
    expect(dashboard.text).toContain("get_product_details");
    expect(dashboard.text).toContain("create_checkout_link");
    expect(dashboard.text).toContain("add_product_to_cart_by_search");
    expect(dashboard.text).toContain("Default state: enabled");
  });
});
