import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  SHOPIFY_STORE_DOMAIN: z.string().min(1).default(""),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1).default(""),
  AI_GATEWAY_API_KEY: z.string().min(1).default("replace_with_random_secret"),
  ACTION_SETTINGS_FILE: z.string().default("./data/action-settings.json")
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  return envSchema.parse(process.env);
}

export function ensureShopifyConfig(): void {
  const env = getEnv();

  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw Object.assign(new Error("Shopify Storefront API is not configured."), {
      statusCode: 500
    });
  }
}
