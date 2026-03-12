import { z } from "zod";

export const createCheckoutLinkSchema = z.object({
  variantId: z.string().trim().min(1, "variantId is required."),
  quantity: z.number().int().positive("quantity must be a positive integer.")
});
