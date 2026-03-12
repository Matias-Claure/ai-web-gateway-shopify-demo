import { ensureShopifyConfig, getEnv } from "../config/env";

type ShopifyErrorResponse = {
  errors?: Array<{ message?: string }>;
};

type ShopifyProductSearchNode = {
  id: string;
  handle: string;
  title: string;
  variants?: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }>;
  };
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
};

type ShopifyProductDetailsNode = ShopifyProductSearchNode & {
  description: string;
  images: { nodes: Array<{ url: string; altText: string | null }> };
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }>;
  };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
};

type SearchProductsResponse = {
  products: {
    nodes: ShopifyProductSearchNode[];
  };
};

type ProductByHandleResponse = {
  productByHandle: ShopifyProductDetailsNode | null;
};

type CartCreateResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

export type ProductSearchResult = {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  variants?: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
  }>;
  price: {
    amount: string;
    currencyCode: string;
  };
};

export type ProductDetailsResult = {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: Array<{ url: string; altText: string | null }>;
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
  }>;
  priceRange: {
    min: { amount: string; currencyCode: string };
    max: { amount: string; currencyCode: string };
  };
};

export async function shopifyRequest<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  ensureShopifyConfig();
  const env = getEnv();

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables })
    }
  );

  if (!response.ok) {
    throw Object.assign(
      new Error(`Shopify request failed with status ${response.status}.`),
      { statusCode: 502 }
    );
  }

  const payload = (await response.json()) as { data?: TData } & ShopifyErrorResponse;

  if (payload.errors?.length) {
    const messages = payload.errors.map((error) => error.message || "Unknown Shopify error");
    throw Object.assign(new Error(messages.join("; ")), { statusCode: 502 });
  }

  if (!payload.data) {
    throw Object.assign(new Error("Shopify returned an empty response."), { statusCode: 502 });
  }

  return payload.data;
}

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String!) {
    products(first: 25, query: $query) {
      nodes {
        id
        handle
        title
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CATALOG_PRODUCTS_QUERY = `
  query CatalogProducts($first: Int!) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      variants(first: 25) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
    }
  }
`;

const CREATE_CART_QUERY = `
  mutation CreateCart($variantId: ID!, $quantity: Int!) {
    cartCreate(
      input: {
        lines: [
          {
            merchandiseId: $variantId,
            quantity: $quantity
          }
        ]
      }
    ) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  const data = await shopifyRequest<SearchProductsResponse>(SEARCH_PRODUCTS_QUERY, { query });

  return data.products.nodes.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    image: product.featuredImage?.url ?? null,
    variants: product.variants?.nodes ?? [],
    price: product.priceRange.minVariantPrice
  }));
}

export async function listCatalogProducts(limit = 100): Promise<ProductSearchResult[]> {
  const data = await shopifyRequest<SearchProductsResponse>(CATALOG_PRODUCTS_QUERY, {
    first: limit
  });

  return data.products.nodes.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    image: product.featuredImage?.url ?? null,
    variants: product.variants?.nodes ?? [],
    price: product.priceRange.minVariantPrice
  }));
}

export async function getProductByHandle(handle: string): Promise<ProductDetailsResult | null> {
  const data = await shopifyRequest<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, { handle });
  const product = data.productByHandle;

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    images: product.images.nodes,
    variants: product.variants.nodes,
    priceRange: {
      min: product.priceRange.minVariantPrice,
      max: product.priceRange.maxVariantPrice
    }
  };
}

export async function createCheckoutLink(
  variantId: string,
  quantity: number
): Promise<{ cartId: string; checkoutUrl: string }> {
  const data = await shopifyRequest<CartCreateResponse>(CREATE_CART_QUERY, {
    variantId,
    quantity
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw Object.assign(
      new Error(data.cartCreate.userErrors.map((error) => error.message).join("; ")),
      { statusCode: 400 }
    );
  }

  if (!data.cartCreate.cart) {
    throw Object.assign(new Error("Shopify did not return a checkout URL."), {
      statusCode: 502
    });
  }

  return {
    cartId: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl
  };
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function levenshteinDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function fuzzyScore(query: string, candidate: ProductSearchResult): number {
  const normalizedQuery = normalizeSearchText(query);
  const title = normalizeSearchText(candidate.title);
  const handle = normalizeSearchText(candidate.handle);

  if (!normalizedQuery) {
    return 0;
  }

  if (title === normalizedQuery || handle === normalizedQuery) {
    return 100;
  }

  if (title.includes(normalizedQuery) || handle.includes(normalizedQuery)) {
    return 92;
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  const titleTerms = title.split(/\s+/).filter(Boolean);
  const handleTerms = handle.split(/\s+/).filter(Boolean);
  const candidateTerms = new Set([...titleTerms, ...handleTerms]);

  let termHits = 0;
  for (const term of queryTerms) {
    if ([...candidateTerms].some((candidateTerm) => candidateTerm.includes(term) || term.includes(candidateTerm))) {
      termHits += 1;
      continue;
    }

    if ([...candidateTerms].some((candidateTerm) => levenshteinDistance(term, candidateTerm) <= 2)) {
      termHits += 0.8;
    }
  }

  const phraseDistance = Math.min(
    levenshteinDistance(normalizedQuery, title),
    levenshteinDistance(normalizedQuery, handle)
  );
  const maxLength = Math.max(normalizedQuery.length, title.length, handle.length, 1);
  const phraseSimilarity = 1 - phraseDistance / maxLength;

  return Math.max(
    queryTerms.length > 0 ? (termHits / queryTerms.length) * 85 : 0,
    phraseSimilarity * 75
  );
}

export async function findProductsByApproximateQuery(query: string): Promise<ProductSearchResult[]> {
  const [searchResults, catalogResults] = await Promise.all([
    searchProducts(query),
    listCatalogProducts(100)
  ]);

  const deduped = new Map<string, ProductSearchResult>();
  for (const product of [...searchResults, ...catalogResults]) {
    deduped.set(product.id, product);
  }

  return [...deduped.values()]
    .map((product) => ({
      product,
      score: fuzzyScore(query, product)
    }))
    .filter((entry) => entry.score >= 35)
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .map((entry) => entry.product);
}
