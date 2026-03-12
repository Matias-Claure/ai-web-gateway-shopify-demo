import { Router } from "express";
import { createCheckoutLink } from "../lib/shopify";
import { createCheckoutLinkSchema } from "../schemas/createCheckoutLink";

export const createCheckoutLinkRouter = Router();

createCheckoutLinkRouter.post("/", async (req, res, next) => {
  try {
    const { variantId, quantity } = createCheckoutLinkSchema.parse(req.body);
    const checkout = await createCheckoutLink(variantId, quantity);
    res.json(checkout);
  } catch (error) {
    next(error);
  }
});
