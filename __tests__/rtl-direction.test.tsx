import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { nextTick } from "sinwan/reactivity";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../src/components/ui/carousel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../src/components/ui/resizable";
import { mountUi, setupDom, teardownDom } from "./helpers";

// Every component must read right to left as well as left to right (`dir="rtl"`
// on the page or a parent): sides, spacing, corners, text alignment, slide
// directions, arrow icons and JS-driven movement follow the reading direction.

const UI = join(import.meta.dir, "..", "src", "components", "ui");

/** A Tailwind utility that names a physical side (left or right). */
const PHYSICAL =
  /^-?(?:(?:left|right)-|m[lr]-|p[lr]-|scroll-[mp][lr]-)|^border-[lr](?:$|-)|^rounded-(?:[lr]|tl|tr|bl|br)(?:$|-)|^text-(?:left|right)$|^-?translate-x-|^(?:float|clear)-(?:left|right)$|^origin-(?:left|right|top-left|top-right|bottom-left|bottom-right)$|^slide-(?:in|out)-(?:from|to)-(?:left|right)/;

/** Variants keyed to a physical side the code computed (a floating side, a drawer or sheet direction). */
const SIDE_KEYED = /(?:data-\[side=(?:left|right)\]|\[data-side=(?:left|right)\]|data-\[vaul-drawer-direction=(?:left|right)\])/;

/** Physical on purpose: `file → utility → reason`. */
const ALLOWED: Record<string, Record<string, string>> = {
  "drawer/drawer.tsx": {
    "right-0": "the handle of a drawer opened from the physical left side",
    "left-0": "the handle of a drawer opened from the physical right side",
  },
  "sonner.tsx": {
    "left-4": "the toaster's `position` names a physical corner (`top-left`)",
    "right-4": "the toaster's `position` names a physical corner (`top-right`)",
  },
  "resizable/resizable.tsx": {
    "aria-[orientation=horizontal]:after:left-0": "a horizontal seam's hit area spans the full width (symmetric)",
  },
  "sidebar/sidebar.tsx": {
    "group-data-[collapsible=offcanvas]:after:left-full": "the off-canvas rail follows the sidebar's physical `side`",
  },
};

/** `variant:` prefix and utility of a class token (colons inside `[…]` are not separators). */
function splitToken(token: string): { variant: string; utility: string } {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < token.length; i += 1) {
    const ch = token[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") depth -= 1;
    else if (ch === ":" && depth === 0) last = i;
  }
  return { variant: token.slice(0, last + 1), utility: token.slice(last + 1).replace(/^!|!$/g, "") };
}

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return Promise.resolve(entry.name.endsWith(".tsx") ? [path] : []);
    }),
  );
  return nested.flat().sort();
}

/** Every string and template literal of a file, with its line. */
function literals(source: string): { line: number; text: string }[] {
  const found: { line: number; text: string }[] = [];
  const pattern = /"([^"\n]*)"|`([^`]*)`/g;
  for (const match of source.matchAll(pattern)) {
    const line = source.slice(0, match.index).split("\n").length;
    found.push({ line, text: match[1] ?? match[2] ?? "" });
  }
  return found;
}

const isCentering = (utility: string) => utility === "left-1/2" || utility === "-translate-x-1/2";

/** The physical utilities of one literal that do not follow the reading direction. */
function physicalIn(text: string, allowed: Record<string, string>): string[] {
  const tokens = text.split(/\s+/).filter(Boolean).map((token) => ({ token, ...splitToken(token) }));
  const hasRtlTranslate = tokens.some((t) => /(?:^|:)rtl:/.test(t.variant) && /^-?translate-x-/.test(t.utility));
  const centered = (variant: string) =>
    tokens.some((t) => t.variant === variant && t.utility === "left-1/2") &&
    tokens.some((t) => t.variant === variant && t.utility === "-translate-x-1/2");
  return tokens
    .filter(({ token, variant, utility }) => {
      if (!PHYSICAL.test(utility)) return false;
      if (/(?:^|:)(?:rtl|ltr):/.test(variant)) return false;
      if (SIDE_KEYED.test(variant)) return false;
      if (token in allowed) return false;
      if (utility === "translate-x-0") return false;
      // `left-1/2 -translate-x-1/2` centres: the same in both directions.
      if (isCentering(utility) && centered(variant)) return false;
      if (/^-?translate-x-/.test(utility)) return !hasRtlTranslate;
      return true;
    })
    .map(({ token }) => token);
}

describe("RTL: every component follows the reading direction", () => {
  test("no class names a physical side without an rtl: counterpart", async () => {
    const problems: string[] = [];
    for (const path of await sourceFiles(UI)) {
      const file = relative(UI, path);
      const allowed = ALLOWED[file] ?? {};
      for (const { line, text } of literals(await readFile(path, "utf8"))) {
        for (const token of physicalIn(text, allowed)) problems.push(`${file}:${line} ${token}`);
      }
    }
    // Use the logical utility (`ps-`, `me-`, `start-`, `end-`, `border-s`,
    // `rounded-e`, `text-start`), or add the mirrored `rtl:` translate.
    expect(problems).toEqual([]);
  });

  test("every allowed physical utility is still used (no stale entries)", async () => {
    for (const [file, tokens] of Object.entries(ALLOWED)) {
      const source = await readFile(join(UI, file), "utf8");
      for (const token of Object.keys(tokens)) expect(source).toContain(token);
    }
  });

  test("arrow icons turn around in RTL", async () => {
    const problems: string[] = [];
    const icon = /<Icon\b[\s\S]*?\/>/g;
    const directional = /icon=\{(?:Chevrons?(?:Left|Right)|Arrow(?:Left|Right)|Panel(?:Left|Right))\}/;
    for (const path of await sourceFiles(UI)) {
      const source = await readFile(path, "utf8");
      for (const match of source.matchAll(icon)) {
        const element = match[0];
        if (!directional.test(element)) continue;
        if (/rtl:(?:rotate-180|-scale-x-100)/.test(element)) continue;
        const line = source.slice(0, match.index).split("\n").length;
        problems.push(`${relative(UI, path)}:${line} ${element.replace(/\s+/g, " ")}`);
      }
    }
    expect(problems).toEqual([]);
  });

  test("inline styles place things with logical sides", async () => {
    const problems: string[] = [];
    for (const path of await sourceFiles(UI)) {
      const file = relative(UI, path);
      for (const { line, text } of literals(await readFile(path, "utf8"))) {
        const physical = text.match(/(?<![\w-])(?:left|right|margin-left|margin-right|padding-left|padding-right):\s*([^;]+)/g) ?? [];
        // Use `inset-inline-start`, `margin-inline-end`, … instead.
        for (const rule of physical) problems.push(`${file}:${line} ${rule.trim()}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("RTL: movement follows the reading direction", () => {
  beforeEach(() => setupDom());
  afterEach(() => teardownDom());

  const pointer = (type: string, clientX: number, clientY = 0) =>
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY, button: 0 });

  test("carousel: the arrow toward the end of the line and a swipe toward the start go to the next slide", () => {
    let api: CarouselApi | undefined;
    const { root, unmount } = mountUi(() => (
      <div dir="rtl">
        <Carousel
          opts={{ startIndex: 0, loop: false }}
          setApi={(a) => {
            api = a;
          }}
        >
          <CarouselContent>
            <CarouselItem>1</CarouselItem>
            <CarouselItem>2</CarouselItem>
            <CarouselItem>3</CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    ));
    const carousel = root.querySelector('[data-slot="carousel"]') as HTMLElement;
    carousel.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect(api!.index.value).toBe(1);
    carousel.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(api!.index.value).toBe(0);

    // In RTL the next slide sits to the left: dragging the track to the right brings it in.
    const viewport = root.querySelector('[data-slot="carousel-content"]') as HTMLElement;
    viewport.dispatchEvent(pointer("pointerdown", 100));
    window.dispatchEvent(pointer("pointermove", 180));
    window.dispatchEvent(pointer("pointerup", 180));
    expect(api!.index.value).toBe(1);
    unmount();
  });

  test("carousel: left to right is unchanged", () => {
    let api: CarouselApi | undefined;
    const { root, unmount } = mountUi(() => (
      <Carousel
        opts={{ startIndex: 0, loop: false }}
        setApi={(a) => {
          api = a;
        }}
      >
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
      </Carousel>
    ));
    const carousel = root.querySelector('[data-slot="carousel"]') as HTMLElement;
    carousel.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(api!.index.value).toBe(1);
    const viewport = root.querySelector('[data-slot="carousel-content"]') as HTMLElement;
    viewport.dispatchEvent(pointer("pointerdown", 180));
    window.dispatchEvent(pointer("pointermove", 100));
    window.dispatchEvent(pointer("pointerup", 100));
    expect(api!.index.value).toBe(1);
    viewport.dispatchEvent(pointer("pointerdown", 100));
    window.dispatchEvent(pointer("pointermove", 180));
    window.dispatchEvent(pointer("pointerup", 180));
    expect(api!.index.value).toBe(0);
    unmount();
  });

  test("resizable: dragging the handle toward the start panel's far edge grows it, in RTL too", async () => {
    const { root, unmount } = mountUi(() => (
      <div dir="rtl">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={30}>A</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70}>B</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    ));
    const handle = root.querySelector('[data-slot="resizable-handle"]') as HTMLElement;
    const group = handle.parentElement!;
    group.getBoundingClientRect = () =>
      ({ width: 200, height: 100, top: 0, left: 0, bottom: 100, right: 200, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    const panels = root.querySelectorAll('[data-slot="resizable-panel"]') as NodeListOf<HTMLElement>;
    // RTL: panel A is on the right, so moving the handle 20px to the left widens A by 10%.
    handle.dispatchEvent(pointer("pointerdown", 100));
    window.dispatchEvent(pointer("pointermove", 80));
    await nextTick();
    expect(panels[0]?.style.flexBasis).toBe("40%");
    window.dispatchEvent(pointer("pointerup", 80));
    unmount();
  });
});
