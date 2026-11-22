// auto-loader.js
import { app, auth, db, appConfig } from "./01-core-config/firebase-init.js";

const MODULES = [
  "./01-core-config",
  "./02-icons",
  "./03-start-screen",
  "./04-home-page",
  "./05-error-alert",
  "./06page-one",
];

const CANDIDATE_FILES = [
  "logic.js",
  "main.js",
  "init.js",
  "index.js"
];

async function runFolderModule(folderPath, context) {
  const cleanFolder = folderPath.replace(/\/+$/, "");

  for (const fileName of CANDIDATE_FILES) {
    const fullPath = `${cleanFolder}/${fileName}`;
    try {
      const mod = await import(fullPath);
      const fn =
        mod.init ||
        mod.mount ||
        mod.default ||
        Object.values(mod).find((v) => typeof v === "function");

      if (typeof fn === "function") {
        await fn(context);
      }
      return;
    } catch (_) {}
  }
}

async function start() {
  const root = document.getElementById("app-root");
  if (!root) return;

  const context = {
    root,
    app,
    auth,
    db,
    config: appConfig
  };

  for (const folderPath of MODULES) {
    if (!folderPath || typeof folderPath !== "string") continue;
    await runFolderModule(folderPath.trim(), context);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
