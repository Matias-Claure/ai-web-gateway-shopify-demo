import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";

describe("GET /ai/product-details", () => {
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
    const response = await request(createApp()).get("/ai/product-details?handle=black-hoodie");

    expect(response.status).toBe(401);
  });

  it("returns 404 when product is missing", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          productByHandle: null
        }
      })
    } as Response);

    const response = await request(createApp())
      .get("/ai/product-details?handle=missing")
      .set("x-ai-gateway-key", "test-key");

    expect(response.status).toBe(404);
  });

  it("returns structured product details", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          productByHandle: {
            id: "gid://shopify/Product/1",
            title: "Black Hoodie",
            handle: "black-hoodie",
            description: "Soft fleece hoodie",
            featuredImage: {
              url: "https://example.com/hoodie.jpg",
              altText: "Black hoodie"
            },
            images: {
              nodes: [{ url: "https://example.com/hoodie.jpg", altText: "Black hoodie" }]
            },
            variants: {
              nodes: [
                {
                  id: "gid://shopify/ProductVariant/1",
                  title: "Small",
                  availableForSale: true,
                  price: {
                    amount: "49.00",
                    currencyCode: "USD"
                  }
                }
              ]
            },
            priceRange: {
              minVariantPrice: { amount: "49.00", currencyCode: "USD" },
              maxVariantPrice: { amount: "59.00", currencyCode: "USD" }
            }
          }
        }
      })
    } as Response);

    const response = await request(createApp())
      .get("/ai/product-details?handle=black-hoodie")
      .set("x-ai-gateway-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.variants).toHaveLength(1);
    expect(response.body.priceRange.max.amount).toBe("59.00");
  });
});
