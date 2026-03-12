import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("GET /.well-known/ai-interface.json", () => {
  it("returns the manifest", async () => {
    const response = await request(createApp()).get("/.well-known/ai-interface.json");

    expect(response.status).toBe(200);
    expect(response.body.version).toBe("0.1");
    expect(response.body.auth.header).toBe("x-ai-gateway-key");
    expect(response.body.actions).toHaveLength(4);
  });
});
