import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { requireActionEnabled } from "./middleware/requireActionEnabled";
import { requireApiKey } from "./middleware/requireApiKey";
import { logRequest } from "./lib/logger";
import { addProductToCartBySearchRouter } from "./routes/addProductToCartBySearch";
import { createCheckoutLinkRouter } from "./routes/createCheckoutLink";
import { dashboardRouter } from "./routes/dashboard";
import { healthRouter } from "./routes/health";
import { manifestRouter } from "./routes/manifest";
import { productDetailsRouter } from "./routes/productDetails";
import { searchProductsRouter } from "./routes/searchProducts";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(logRequest);

  app.use("/health", healthRouter);
  app.use("/.well-known/ai-interface.json", manifestRouter);
  app.use("/dashboard", dashboardRouter);
  app.use(
    "/ai/search-products",
    requireApiKey,
    requireActionEnabled("search_products"),
    searchProductsRouter
  );
  app.use(
    "/ai/product-details",
    requireApiKey,
    requireActionEnabled("get_product_details"),
    productDetailsRouter
  );
  app.use(
    "/ai/add-product-to-cart-by-search",
    requireApiKey,
    requireActionEnabled("add_product_to_cart_by_search"),
    addProductToCartBySearchRouter
  );
  app.use(
    "/ai/create-checkout-link",
    requireApiKey,
    requireActionEnabled("create_checkout_link"),
    createCheckoutLinkRouter
  );

  app.use(errorHandler);

  return app;
}
