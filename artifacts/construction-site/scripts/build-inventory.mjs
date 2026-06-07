// Regenerates src/content/inventory.json — a map of the construction-site src/
// modules and their import relationships, rendered by the admin InventoryPage
// (graph view, built in a later phase).
//
// Keep it current: run `pnpm --filter @workspace/construction-site run inventory`
// whenever you add, remove, or rename a file/component under src/.
//
// It statically scans every .ts/.tsx file, parses static import / re-export
// specifiers, resolves the "@/" alias (-> src/) and relative paths, classifies
// each module by its folder, and emits { nodes, edges }. No deps, no bundler.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "src");
const OUT = path.join(SRC, "content", "inventory.json");

const EXTS = [".tsx", ".ts", ".jsx", ".js"];
const IMPORT_RE = /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']/g;

function classify(id) {
  if (id.startsWith("pages/")) return "page";
  if (id.startsWith("components/")) return "component";
  if (id.startsWith("repositories/")) return "repository";
  if (id.startsWith("services/")) return "service";
  if (id.startsWith("content/")) return "content";
  if (id.startsWith("hooks/")) return "hook";
  if (id.startsWith("contexts/")) return "context";
  if (id.startsWith("translations/")) return "content";
  return "lib";
}

function group(id) {
  if (id.includes("/admin")) return "admin";
  if (id.startsWith("pages/admin")) return "admin";
  if (id.startsWith("components/ui")) return "ui";
  if (id.startsWith("pages/") || id.startsWith("components/layout")) return "public";
  return "core";
}

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      await walk(full, acc);
    } else if (EXTS.includes(path.extname(e.name))) {
      acc.push(full);
    }
  }
  return acc;
}

function toId(absFile) {
  let rel = path.relative(SRC, absFile).split(path.sep).join("/");
  rel = rel.replace(/\.(tsx|ts|jsx|js)$/, "");
  rel = rel.replace(/\/index$/, "");
  return rel;
}

async function resolveSpecifier(spec, fromFile, fileIds) {
  let target;
  if (spec.startsWith("@/")) {
    target = path.resolve(SRC, spec.slice(2));
  } else if (spec.startsWith("./") || spec.startsWith("../")) {
    target = path.resolve(path.dirname(fromFile), spec);
  } else {
    return null;
  }
  const targetId = path.relative(SRC, target).split(path.sep).join("/").replace(/\/index$/, "");
  const candidates = [
    targetId,
    ...EXTS.map((e) => `${targetId}${e}`.replace(/\.(tsx|ts|jsx|js)$/, "")),
    `${targetId}/index`,
  ].map((c) => c.replace(/\/index$/, ""));
  for (const c of candidates) {
    if (fileIds.has(c)) return c;
  }
  if (/\.json$/.test(spec)) {
    return path.relative(SRC, target).split(path.sep).join("/");
  }
  return null;
}

async function main() {
  const files = await walk(SRC);
  const fileIds = new Set(files.map(toId));

  const nodes = new Map();
  const edges = [];

  const addNode = (id, absPath) => {
    if (nodes.has(id)) return;
    nodes.set(id, {
      id,
      label: id.split("/").pop(),
      type: classify(id),
      group: group(id),
      path: absPath ? "src/" + path.relative(SRC, absPath).split(path.sep).join("/") : "src/" + id,
    });
  };

  for (const file of files) addNode(toId(file), file);

  for (const file of files) {
    const id = toId(file);
    const code = await fs.readFile(file, "utf8");
    const seen = new Set();
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(code))) {
      const spec = m[1];
      const targetId = await resolveSpecifier(spec, file, fileIds);
      if (!targetId || targetId === id || seen.has(targetId)) continue;
      seen.add(targetId);
      if (!nodes.has(targetId)) {
        addNode(targetId, path.resolve(SRC, targetId));
      }
      edges.push({ from: id, to: targetId, kind: "imports" });
    }
  }

  const sortedNodes = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = edges.sort(
    (a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to),
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    counts: { nodes: sortedNodes.length, edges: sortedEdges.length },
    nodes: sortedNodes,
    edges: sortedEdges,
  };

  await fs.writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `inventory.json: ${sortedNodes.length} nodes, ${sortedEdges.length} edges -> ${path.relative(process.cwd(), OUT)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
