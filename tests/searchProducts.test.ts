import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";

describe("GET /ai/search-products", () => {
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
    const response = await request(createApp()).get("/ai/search-products?q=hoodie");

    expect(response.status).toBe(401);
  });

  it("rejects invalid query", async () => {
    const response = await request(createApp())
      .get("/ai/search-products?q=")
      .set("x-ai-gateway-key", "test-key");

    expect(response.status).toBe(400);
  });

  it("returns normalized product matches", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          products: {
            nodes: [
              {
                id: "gid://shopify/Product/1",
                title: "Black Hoodie",
                handle: "black-hoodie",
                featuredImage: {
                  url: "https://example.com/hoodie.jpg",
                  altText: "Black hoodie"
                },
                priceRange: {
                  minVariantPrice: {
                    amount: "49.00",
                    currencyCode: "USD"
                  }
                }
              }
            ]
          }
        }
      })
    } as Response);

    const response = await request(createApp())
      .get("/ai/search-products?q=hoodie")
      .set("x-ai-gateway-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.products[0].handle).toBe("black-hoodie");
  });
});
