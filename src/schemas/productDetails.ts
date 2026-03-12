import { z } from "zod";

export const productDetailsSchema = z.object({
  handle: z.string().trim().min(1, "Handle is required.")
});
