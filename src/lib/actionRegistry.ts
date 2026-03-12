import fs from "fs";
import path from "path";
import { availableActions } from "../config/actions";
import { getEnv } from "../config/env";
import { ManifestAction } from "../types/manifest";

type ActionState = Record<string, boolean>;

function getSettingsPath(): string {
  const env = getEnv();
  return path.resolve(process.cwd(), env.ACTION_SETTINGS_FILE);
}

function buildDefaultState(): ActionState {
  return Object.fromEntries(
    availableActions.map((action) => [action.name, action.enabledByDefault])
  );
}

function ensureSettingsFile(): void {
  const settingsPath = getSettingsPath();

  if (fs.existsSync(settingsPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(buildDefaultState(), null, 2));
}

function readSettings(): ActionState {
  ensureSettingsFile();

  try {
    const raw = fs.readFileSync(getSettingsPath(), "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return Object.fromEntries(
      availableActions.map((action) => [
        action.name,
        typeof parsed[action.name] === "boolean" ? parsed[action.name] : action.enabledByDefault
      ])
    ) as ActionState;
  } catch {
    return buildDefaultState();
  }
}

function writeSettings(state: ActionState): void {
  const settingsPath = getSettingsPath();
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(state, null, 2));
}

export function getActionState(): ActionState {
  return readSettings();
}

export function getEnabledActions(): ManifestAction[] {
  const state = readSettings();
  return availableActions.filter((action) => state[action.name] !== false);
}

export function isActionEnabled(actionName: string): boolean {
  return readSettings()[actionName] !== false;
}

export function updateActionState(enabledActionNames: string[]): ActionState {
  const enabled = new Set(enabledActionNames);
  const nextState = Object.fromEntries(
    availableActions.map((action) => [action.name, enabled.has(action.name)])
  );

  writeSettings(nextState);
  return nextState;
}
