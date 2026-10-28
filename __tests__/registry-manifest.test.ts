import { describe, expect, test } from "bun:test";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SOURCE_FILE = /\.(ts|tsx|css)$/;
const UNOWNED_FILES = new Set(["src/index.ts", "src/sinwan-preload.ts"]);
const ITEM_TYPES = new Set(["registry:ui", "registry:lib", "registry:hook", "registry:style"]);

interface ManifestFile {
  path: string;
  type: string;
}

interface ManifestItem {
  name: string;
  type: string;
  title: string;
  description: string;
  files: ManifestFile[];
}

interface Manifest {
  name: string;
  aliasRoots: Record<string, string>;
  items: ManifestItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFile(value: unknown): ManifestFile {
  if (!isRecord(value) || typeof value.path !== "string" || typeof value.type !== "string") {
    throw new Error(`Invalid manifest file entry: ${JSON.stringify(value)}`);
  }
  return { path: value.path, type: value.type };
}

function parseItem(value: unknown): ManifestItem {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.type !== "string" ||
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    !Array.isArray(value.files)
  ) {
    throw new Error(`Invalid manifest item: ${JSON.stringify(value)}`);
  }
  return {
    name: value.name,
    type: value.type,
    title: value.title,
    description: value.description,
    files: value.files.map(parseFile),
  };
}

function parseManifest(value: unknown): Manifest {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    !isRecord(value.aliasRoots) ||
    !Array.isArray(value.items)
  ) {
    throw new Error("Invalid registry.json manifest");
  }
  const aliasRoots: Record<string, string> = {};
  for (const [key, root] of Object.entries(value.aliasRoots)) {
    if (typeof root !== "string") throw new Error(`Invalid alias root ${key}`);
    aliasRoots[key] = root;
  }
  return { name: value.name, aliasRoots, items: value.items.map(parseItem) };
}

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listSourceFiles(path);
      return SOURCE_FILE.test(entry.name) ? [relative(ROOT, path)] : [];
    }),
  );
  return nested.flat().sort();
}

const manifest = parseManifest(JSON.parse(await readFile(join(ROOT, "registry.json"), "utf8")));
const sourceFiles = await listSourceFiles(join(ROOT, "src"));

describe("registry.json manifest", () => {
  test("item names are unique and every item is described", () => {
    const names = manifest.items.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
    for (const item of manifest.items) {
      expect(ITEM_TYPES.has(item.type)).toBe(true);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.files.length).toBeGreaterThan(0);
      for (const file of item.files) expect(ITEM_TYPES.has(file.type)).toBe(true);
    }
  });

  test("alias roots exist", async () => {
    for (const root of Object.values(manifest.aliasRoots)) {
      const info = await stat(join(ROOT, root));
      expect(info.isDirectory()).toBe(true);
    }
  });

  test("every listed file exists", async () => {
    const missing: string[] = [];
    for (const item of manifest.items) {
      for (const file of item.files) {
        const info = await stat(join(ROOT, file.path)).catch(() => null);
        if (!info?.isFile()) missing.push(`${item.name}: ${file.path}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test("every source file belongs to exactly one item", () => {
    const owners = new Map<string, string[]>();
    for (const item of manifest.items) {
      for (const file of item.files) {
        owners.set(file.path, [...(owners.get(file.path) ?? []), item.name]);
      }
    }
    const duplicated = [...owners].filter(([, names]) => names.length > 1);
    expect(duplicated).toEqual([]);

    const unowned = sourceFiles.filter((file) => !UNOWNED_FILES.has(file) && !owners.has(file));
    expect(unowned).toEqual([]);

    const listedUnowned = [...owners.keys()].filter((file) => UNOWNED_FILES.has(file));
    expect(listedUnowned).toEqual([]);
  });

  test("chart owns the echarts-gl declarations", () => {
    const chart = manifest.items.find((item) => item.name === "chart");
    expect(chart?.files).toContainEqual({ path: "src/lib/echarts-gl.d.ts", type: "registry:lib" });
  });
});

describe("registry source imports", () => {
  const IMPORT = /(?:from|import)\s*\(?\s*"([^"]+)"/g;
  const FORMER_CORE_OR_MOVED = /(^|\/)(primitives|theme|toast)(\/|$)|(^|\/)lib\/(slot|types)$|\.\/icons$/;

  test("use relative cross-item imports and concrete sinwan-ui-core modules", async () => {
    const violations: string[] = [];
    for (const file of sourceFiles.filter((path) => /\.tsx?$/.test(path))) {
      const code = await readFile(join(ROOT, file), "utf8");
      for (const match of code.matchAll(IMPORT)) {
        const specifier = match[1] ?? "";
        if (specifier.startsWith("@/")) violations.push(`${file}: ${specifier}`);
        if (specifier === "sinwan-ui-core") violations.push(`${file}: ${specifier}`);
        if (specifier.startsWith(".") && FORMER_CORE_OR_MOVED.test(specifier)) {
          violations.push(`${file}: ${specifier}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
