# sinwan-ui-registry

The component registry for [Sinwan](https://sinwanjs.com), following the shadcn model:

- **This repo** holds the source of every component. It is never installed as a package. The `sinwan-ui` CLI copies components into your app, and the copies are yours to edit.
- **[`sinwan-ui-core`](https://www.npmjs.com/package/sinwan-ui-core)** (npm) provides behaviour: headless primitives for overlays, controls, floating positioning, dismissal, slots, theme and direction. Copied components import it as `sinwan-ui-core/<module>`, and `add` installs it.
- **[`sinwan-ui`](https://www.npmjs.com/package/sinwan-ui)** (npm) is only the CLI.

## Layout

| Path | Contents |
| --- | --- |
| `src/components/ui/` | Components (`button.tsx`, `dialog.tsx`, folder components such as `avatar/`) |
| `src/lib/` | Shared library items: `utils.ts` (`cn`), `icons.tsx`, type declarations |
| `src/hooks/` | Hooks such as `use-mobile.ts` |
| `src/styles/global.css` | The theme (item `style`) |
| `__tests__/` | Component tests (`bun test`) |
| `registry.json` | Manifest: every item, its type, title, description and source files. Validated by `registry.schema.json`. |
| `public/r/*.json` | **Generated** by `sinwan-ui build`. Do not edit by hand. |
| `schema.json` | JSON Schema for the consumer config `sinwan-ui.json` |
| `registry-item.schema.json` | JSON Schema for `public/r/<name>.json` |
| `registry.schema.json` | JSON Schema for `registry.json` |

In this repo, items import each other with relative paths such as `../../lib/utils`, so tests and typecheck need no alias. `sinwan-ui build` rewrites those imports in the generated JSON to canonical aliases: `@/components/ui/<x>`, `@/lib/utils`, `@/lib/<x>`, `@/hooks/<x>`. Imports between files of the same folder component stay relative.

## Using components in an app

Requirements: `sinwan`, Tailwind CSS v4, and an `@/*` path alias in `tsconfig.json` or `jsconfig.json`. Vite apps also need a matching `resolve.alias`. Apps created with `create-sinwan` have all of these.

```bash
bunx sinwan-ui init                  # create sinwan-ui.json, check the @/* alias, install sinwan-ui-core,
                                     # add the "utils" and "style" items and link the theme
bunx sinwan-ui add button dialog     # copy items + their registry dependencies, install npm packages
bunx sinwan-ui add                   # pick items interactively (terminal only)
bunx sinwan-ui list                  # list items; ✓ marks installed ones
bunx sinwan-ui search menu           # filter by name, title or description
bunx sinwan-ui view button           # print item JSON, files included
bunx sinwan-ui diff                  # list installed items that differ from the registry
bunx sinwan-ui diff button           # unified diff for one item
```

`npx sinwan-ui`, `pnpm dlx sinwan-ui` and `yarn dlx sinwan-ui` work the same way. `add` accepts item names, `@namespace/name`, item URLs and local `./item.json` paths.

| Flag | Description |
| --- | --- |
| `--cwd <dir>` | Project directory (default: current directory) |
| `-y, --yes` | Skip prompts; keep local files that differ unless `--overwrite` is set |
| `-d, --defaults` | `init`: write the default config without prompting |
| `--overwrite` | Overwrite local files (and CSS variables) that differ from the registry |
| `-a, --all` | `add`: add every item |
| `-p, --path <dir>` | `add`: put `registry:ui` files in this directory |
| `--registry <url-or-dir>` | Registry base URL or local directory |
| `--ref <tag-or-branch>` | Git ref of the default registry (default: `v<CLI version>`) |
| `--dry-run` | Print planned writes and the install command without changing anything |

### `sinwan-ui.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/sinwanjs/sinwan-ui-registry/main/schema.json",
  "tsx": true,
  "tailwind": { "css": "src/styles/global.css" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  },
  "registries": { "@acme": "https://acme.dev/r/{name}.json" },
  "packageManager": "bun"
}
```

When the CLI installs an item, it rewrites the canonical `@/...` imports to your `aliases`, longest prefix first. It then resolves each alias to a directory through `compilerOptions.paths` (and `baseUrl`) in your `tsconfig.json` or `jsconfig.json`.

### Custom and third-party registries

Map an `@namespace` to an item URL template containing `{name}` under `registries`, then add items as `@namespace/name`:

```bash
bunx sinwan-ui add @acme/fancy-card
```

An item's `registryDependencies` may be bare names (same registry), `@namespace/name`, or full URLs. To publish your own registry, write a `registry.json` against `registry.schema.json`, run `sinwan-ui build`, and serve the output.

## URL scheme and versioning

```
https://raw.githubusercontent.com/sinwanjs/sinwan-ui-registry/v<version>/public/r/index.json
https://raw.githubusercontent.com/sinwanjs/sinwan-ui-registry/v<version>/public/r/<name>.json
```

Each release is tagged `v<version>`. By default the CLI reads the tag that matches its own version: `sinwan-ui@1.0.0` reads `v1.0.0`. As a result, a given CLI always gets components it was tested with. Use `--ref main` to read the latest untagged data.

Raw GitHub has rate limits and a CDN cache of about 5 minutes. A new tag can take a few minutes to become available.

## Development

```bash
bun install
bun run test        # component tests with coverage
bun run typecheck
bun run typecheck:consumer       # shipped files only: strict unused checks, DOM libs, no Bun/Node types
bunx sinwan-ui build             # registry.json → public/r/*.json + public/r/index.json
```

`typecheck:consumer` (`tsconfig.consumer.json`) checks the copied files the way a browser-only app does, such as the Vite template (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `types: []`). Registry code must not depend on `process`, `Bun` or other runtime globals for its types.

`build` detects each item's npm `dependencies` and `registryDependencies` from its imports. It takes npm ranges from this repo's `package.json`, and the `version` in that `package.json` becomes the registry version. `build` also strips Tailwind `@source` lines from the `style` item. It fails on unknown packages, a registry dependency with no matching item, or dependency cycles.

### Local testing

Point an app at your working copy instead of GitHub:

```bash
bunx sinwan-ui build
cd ../my-app
bunx sinwan-ui add button --registry ../sinwan-ui-registry/public/r
```

## Release flow

Releases are manual for now.

1. Set `version` in `package.json` to the release version.
2. Run `bun run test`, `bun run typecheck`, `bun run typecheck:consumer`, then `bunx sinwan-ui build`.
3. Review the diff of `public/r/`, commit, and tag:

   ```bash
   git diff -- public/r/
   git add -A
   git commit -m "registry: v<version>"
   git tag v<version>
   ```

4. Push the commit and the tag:

   ```bash
   git push origin main
   git push origin v<version>
   ```

The `version` in `public/r/index.json` must equal the tag without the leading `v`.

## License

MIT
