import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";

describe("POST /ai/create-checkout-link", () => {
  beforeEach(() => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
    process.env.SHOPIFY_STORE_DOMAIN = "demo-store.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "storefront-token";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects missing api key", async () => {
    const response = await request(createApp())
      .post("/ai/create-checkout-link")
      .send({ variantId: "gid://shopify/ProductVariant/1", quantity: 1 });

    expect(response.status).toBe(401);
  });

  it("rejects invalid input", async () => {
    const response = await request(createApp())
      .post("/ai/create-checkout-link")
      .set("x-ai-gateway-key", "test-key")
      .send({ variantId: "", quantity: 0 });

    expect(response.status).toBe(400);
  });

  it("returns a checkout url", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/1",
              checkoutUrl: "https://example.com/cart/c/1"
            },
            userErrors: []
          }
        }
      })
    } as Response);

    const response = await request(createApp())
      .post("/ai/create-checkout-link")
      .set("x-ai-gateway-key", "test-key")
      .send({ variantId: "gid://shopify/ProductVariant/1", quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body.checkoutUrl).toContain("/cart/");
  });
});
