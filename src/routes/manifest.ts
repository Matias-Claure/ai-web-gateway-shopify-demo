import { Router } from "express";
import { buildManifest } from "../lib/manifest";

export const manifestRouter = Router();

manifestRouter.get("/", (_req, res) => {
  res.json(buildManifest());
});
