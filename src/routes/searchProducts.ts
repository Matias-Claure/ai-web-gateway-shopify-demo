import { Router } from "express";
import { searchProductsSchema } from "../schemas/searchProducts";
import { searchProducts } from "../lib/shopify";

export const searchProductsRouter = Router();

searchProductsRouter.get("/", async (req, res, next) => {
  try {
    const { q } = searchProductsSchema.parse(req.query);
    const products = await searchProducts(q);
    res.json({
      query: q,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
});
