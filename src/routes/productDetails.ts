import { Router } from "express";
import { getProductByHandle } from "../lib/shopify";
import { productDetailsSchema } from "../schemas/productDetails";

export const productDetailsRouter = Router();

productDetailsRouter.get("/", async (req, res, next) => {
  try {
    const { handle } = productDetailsSchema.parse(req.query);
    const product = await getProductByHandle(handle);

    if (!product) {
      res.status(404).json({
        error: "NotFound",
        message: `No product found for handle "${handle}".`
      });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});
