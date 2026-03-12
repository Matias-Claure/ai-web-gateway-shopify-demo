import { ManifestAction } from "../types/manifest";

export type AvailableAction = ManifestAction & {
  enabledByDefault: boolean;
};

export const availableActions: AvailableAction[] = [
  {
    name: "search_products",
    description: "Search the Shopify catalog by text query.",
    method: "GET",
    path: "/ai/search-products",
    params: {
      q: { type: "string", required: true }
    },
    risk: "low",
    enabledByDefault: true
  },
  {
    name: "get_product_details",
    description: "Retrieve structured product details by handle.",
    method: "GET",
    path: "/ai/product-details",
    params: {
      handle: { type: "string", required: true }
    },
    risk: "low",
    enabledByDefault: true
  },
  {
    name: "create_checkout_link",
    description: "Create a checkout/cart link for a selected product variant and quantity.",
    method: "POST",
    path: "/ai/create-checkout-link",
    params: {
      variantId: { type: "string", required: true },
      quantity: { type: "integer", required: true }
    },
    risk: "medium",
    enabledByDefault: true
  },
  {
    name: "add_product_to_cart_by_search",
    description: "Find the closest product match from a partial or slightly misspelled query, select an available variant, and create a checkout/cart link.",
    method: "POST",
    path: "/ai/add-product-to-cart-by-search",
    params: {
      query: { type: "string", required: true },
      quantity: { type: "integer", required: true }
    },
    risk: "medium",
    enabledByDefault: true
  }
];

export const actionNames = availableActions.map((action) => action.name);
