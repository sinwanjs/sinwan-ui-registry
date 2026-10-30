import { describe, expect, test } from "bun:test";
import * as path from "node:path";

import { redirectToRegistrySinwan } from "../src/sinwan-preload";

const registrySinwan = path.dirname(
  Bun.resolveSync("sinwan/package.json", path.resolve(import.meta.dir, "..")),
);
const foreignSinwan = path.resolve(
  import.meta.dir,
  "../../sinwan-ui-core/node_modules/sinwan",
);

describe("redirectToRegistrySinwan", () => {
  test("maps a relative import inside another sinwan copy to this package's copy", () => {
    expect(
      redirectToRegistrySinwan(
        "./esm/component/index.production.min.js",
        path.join(foreignSinwan, "dist/component.production.min.js"),
      ),
    ).toBe(
      path.join(registrySinwan, "dist/esm/component/index.production.min.js"),
    );
  });

  test("leaves imports inside this package's copy alone", () => {
    expect(
      redirectToRegistrySinwan(
        "./esm/component/index.production.min.js",
        path.join(registrySinwan, "dist/component.production.min.js"),
      ),
    ).toBeUndefined();
  });

  test("leaves imports outside any sinwan copy alone", () => {
    expect(
      redirectToRegistrySinwan("./utils", path.join(import.meta.dir, "x.ts")),
    ).toBeUndefined();
  });

  test("components and sinwan-ui-core share one sinwan runtime", async () => {
    await import("sinwan-ui-core/theme");
    await import("sinwan/component");
    const roots = new Set(
      Object.keys(require.cache)
        .filter((key) => key.includes(`${path.sep}dist${path.sep}esm${path.sep}`))
        .filter((key) => key.includes(`${path.sep}sinwan${path.sep}dist`))
        .map((key) => key.slice(0, key.indexOf(`${path.sep}dist${path.sep}`))),
    );
    expect([...roots]).toEqual([registrySinwan]);
  });
});
