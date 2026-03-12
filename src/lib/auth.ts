import { getEnv } from "../config/env";

export const AI_GATEWAY_HEADER = "x-ai-gateway-key";

export function isValidApiKey(candidate: string | undefined): boolean {
  return Boolean(candidate) && candidate === getEnv().AI_GATEWAY_API_KEY;
}
