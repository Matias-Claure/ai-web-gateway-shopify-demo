import { z } from "zod";

export const addProductToCartBySearchSchema = z.object({
  query: z.string().trim().min(1, "query is required."),
  quantity: z.number().int().positive("quantity must be a positive integer.").default(1)
});
