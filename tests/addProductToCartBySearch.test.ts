import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";

describe("POST /ai/add-product-to-cart-by-search", () => {
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
      .post("/ai/add-product-to-cart-by-search")
      .send({ query: "hoodie", quantity: 1 });

    expect(response.status).toBe(401);
  });

  it("finds a close match for a misspelled query and returns checkout", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            products: {
              nodes: []
            }
          }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            products: {
              nodes: [
                {
                  id: "gid://shopify/Product/1",
                  title: "Doen - Julienne Top",
                  handle: "doen-julienne-top",
                  variants: {
                    nodes: [
                      {
                        id: "gid://shopify/ProductVariant/1",
                        title: "XS",
                        availableForSale: true,
                        price: {
                          amount: "90.00",
                          currencyCode: "USD"
                        }
                      }
                    ]
                  },
                  featuredImage: {
                    url: "https://example.com/top.jpg",
                    altText: null
                  },
                  priceRange: {
                    minVariantPrice: {
                      amount: "90.00",
                      currencyCode: "USD"
                    }
                  }
                }
              ]
            }
          }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            productByHandle: {
              id: "gid://shopify/Product/1",
              title: "Doen - Julienne Top",
              handle: "doen-julienne-top",
              description: "Cotton top",
              featuredImage: {
                url: "https://example.com/top.jpg",
                altText: null
              },
              images: {
                nodes: []
              },
              variants: {
                nodes: [
                  {
                    id: "gid://shopify/ProductVariant/1",
                    title: "XS",
                    availableForSale: true,
                    price: {
                      amount: "90.00",
                      currencyCode: "USD"
                    }
                  }
                ]
              },
              priceRange: {
                minVariantPrice: {
                  amount: "90.00",
                  currencyCode: "USD"
                },
                maxVariantPrice: {
                  amount: "90.00",
                  currencyCode: "USD"
                }
              }
            }
          }
        })
      } as Response)
      .mockResolvedValueOnce({
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
      .post("/ai/add-product-to-cart-by-search")
      .set("x-ai-gateway-key", "test-key")
      .send({ query: "doen juliene top", quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body.matchedProduct.handle).toBe("doen-julienne-top");
    expect(response.body.selectedVariant.id).toBe("gid://shopify/ProductVariant/1");
    expect(response.body.checkout.checkoutUrl).toContain("/cart/");
  });
});
