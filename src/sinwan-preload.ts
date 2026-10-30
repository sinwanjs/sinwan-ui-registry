import { plugin } from "bun";
import * as path from "node:path";
import { transformJSX } from "sinwan-compiler";

const SINWAN_DIR = `${path.sep}node_modules${path.sep}sinwan${path.sep}`;
const registrySinwan = path.dirname(
  Bun.resolveSync("sinwan/package.json", path.resolve(import.meta.dir, "..")),
);

/**
 * `sinwan-ui-core` is loaded from `../sinwan-ui-core/src` (tsconfig paths), so
 * its `sinwan/*` imports resolve to `sinwan-ui-core/node_modules/sinwan`: a
 * second runtime that inject keys and signal tracking do not cross. Bun runs
 * `onResolve` for relative imports but not for bare package specifiers, and
 * each `sinwan` export entry is `export * from "./esm/..."`, so redirecting
 * relative imports made inside any other `sinwan` copy to the same file in
 * this package's copy leaves one runtime.
 */
export function redirectToRegistrySinwan(
  specifier: string,
  importer: string,
): string | undefined {
  const at = importer.lastIndexOf(SINWAN_DIR);
  if (at === -1) return undefined;
  const foreignRoot = importer.slice(0, at + SINWAN_DIR.length - 1);
  if (foreignRoot === registrySinwan) return undefined;
  const target = path.resolve(path.dirname(importer), specifier);
  return path.join(registrySinwan, path.relative(foreignRoot, target));
}

// Minimal test-only transform plugin: applies the sinwan compiler with
// derivedLocals: true so plain expressions in components are auto-promoted
// to live getters. No cache, no HMR — avoids keeping the test process alive
// after suite completion.
plugin({
  name: "sinwan-test-transform",
  setup(build) {
    build.onResolve({ filter: /^\.\.?\// }, (args) => {
      const redirected = redirectToRegistrySinwan(args.path, args.importer);
      return redirected === undefined ? undefined : { path: redirected };
    });
    build.onLoad({ filter: /\.[tj]sx$/ }, async (args) => {
      const code = await Bun.file(args.path).text();
      try {
        const transformed = transformJSX(code, args.path, {
          hoist: true,
          explicitBindings: false,
          derivedLocals: true,
          dev: false,
        });
        return {
          contents: transformed.code,
          loader: args.path.endsWith("x") ? "tsx" : "ts",
        };
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err);
        return {
          contents: `throw new Error(${JSON.stringify(text)});`,
          loader: args.path.endsWith("x") ? "tsx" : "ts",
        };
      }
    });
  },
});
