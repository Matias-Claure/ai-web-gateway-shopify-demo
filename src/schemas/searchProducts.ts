import { z } from "zod";

export const searchProductsSchema = z.object({
  q: z.string().trim().min(1, "Query is required.")
});
