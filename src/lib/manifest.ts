import { getEnabledActions } from "./actionRegistry";
import { Manifest } from "../types/manifest";

export function buildManifest(): Manifest {
  return {
    version: "0.1",
    service: "shopify-demo-store",
    auth: {
      type: "api_key",
      header: "x-ai-gateway-key"
    },
    actions: getEnabledActions()
  };
}
