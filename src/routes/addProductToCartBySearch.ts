import { Router } from "express";
import { addProductToCartBySearchSchema } from "../schemas/addProductToCartBySearch";
import {
  createCheckoutLink,
  findProductsByApproximateQuery,
  getProductByHandle
} from "../lib/shopify";

export const addProductToCartBySearchRouter = Router();

addProductToCartBySearchRouter.post("/", async (req, res, next) => {
  try {
    const { query, quantity } = addProductToCartBySearchSchema.parse(req.body);
    const matches = await findProductsByApproximateQuery(query);
    const bestMatch = matches[0];

    if (!bestMatch) {
      res.status(404).json({
        error: "NotFound",
        message: `No product found for query "${query}".`
      });
      return;
    }

    const product = await getProductByHandle(bestMatch.handle);

    if (!product) {
      res.status(404).json({
        error: "NotFound",
        message: `The matched product "${bestMatch.handle}" could not be loaded.`
      });
      return;
    }

    const selectedVariant = product.variants.find((variant) => variant.availableForSale);

    if (!selectedVariant) {
      res.status(409).json({
        error: "NoAvailableVariant",
        message: `No sellable variants were found for "${product.title}".`
      });
      return;
    }

    const checkout = await createCheckoutLink(selectedVariant.id, quantity);

    res.json({
      query,
      quantity,
      matchedProduct: {
        id: product.id,
        title: product.title,
        handle: product.handle
      },
      selectedVariant,
      checkout
    });
  } catch (error) {
    next(error);
  }
});
