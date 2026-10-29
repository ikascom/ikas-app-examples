#!/usr/bin/env node
// Keeps the files installed from the @ikas shadcn registry (ikas-ui.md, src/components/ikas, src/components/ui,
// src/lib) in line with what the registry serves now. shadcn's own dry run decides what is outdated.
//   node scripts/ikas-ui.mjs check   list outdated files, exit 1 if there are any
//   node scripts/ikas-ui.mjs sync    reinstall the installed @ikas items with `shadcn add --overwrite`
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "components.json"), "utf8"));
const indexUrl = config.registries["@ikas"].replace("{name}", "registry");

// "@/components" -> "src/components" (tsconfig maps "@/*" to "./src/*")
const aliasDir = (alias) => alias.replace(/^@\//, "src/");

function localPath(file) {
  const target = file.target;
  if (target?.startsWith("~/")) return target.slice(2);
  if (target?.startsWith("@components/")) return path.join(aliasDir(config.aliases.components), target.slice(12));
  if (target?.startsWith("@lib/")) return path.join(aliasDir(config.aliases.lib), target.slice(5));
  if (file.type === "registry:ui") return path.join(aliasDir(config.aliases.ui), path.basename(file.path));
  if (file.type === "registry:lib") return path.join(aliasDir(config.aliases.lib), path.basename(file.path));
  return null;
}

async function installedItems() {
  const res = await fetch(indexUrl);
  if (!res.ok) throw new Error(`${indexUrl} returned ${res.status}`);
  const index = await res.json();
  return index.items
    .filter((item) => item.files?.length && item.files.every((file) => {
      const p = localPath(file);
      return p && existsSync(path.join(root, p));
    }))
    .map((item) => `@ikas/${item.name}`);
}

const shadcn = (args, options) => execFileSync("npx", ["-y", "shadcn@latest", "add", ...args], options);

function changedFiles(items) {
  const out = shadcn([...items, "--dry-run"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return [...out.matchAll(/^\S*\s+[~+]\s+(\S+)\s+(overwrite|create)\s*$/gm)].map(([, file, action]) => `${file} (${action})`);
}

const mode = process.argv[2];
if (mode !== "check" && mode !== "sync") {
  console.error("Usage: node scripts/ikas-ui.mjs <check|sync>");
  process.exit(2);
}

try {
  const items = await installedItems();
  const changed = changedFiles(items);
  if (!changed.length) {
    console.log(`@ikas registry: ${items.length} installed items are up to date.`);
    process.exit(0);
  }
  console.log(`@ikas registry: ${changed.length} file(s) differ from the registry:\n  ${changed.join("\n  ")}`);
  if (mode === "check") {
    console.log("Run `pnpm ui:sync` to update them.");
    process.exit(1);
  }
  shadcn([...items, "--overwrite", "--yes"], { stdio: "inherit" });
} catch (error) {
  console.error(`@ikas registry check failed: ${error.message}`);
  process.exit(2);
}
