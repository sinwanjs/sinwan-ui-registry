import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../src/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../src/components/ui/menubar";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const SUB_CONTENT_CLASSES = [
  "z-50",
  "overflow-hidden",
  "rounded-lg",
  "bg-popover",
  "p-1",
  "text-popover-foreground",
  "shadow-lg",
  "ring-1",
  "ring-foreground/10",
  "duration-200",
  "data-[side=bottom]:slide-in-from-top-2",
  "data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2",
  "data-[side=top]:slide-in-from-bottom-2",
  "data-open:animate-in",
  "data-open:fade-in-0",
  "data-open:zoom-in-95",
  "data-closed:animate-out",
  "data-closed:fade-out-0",
  "data-closed:zoom-out-95",
  "data-closed:!fill-mode-forwards",
];

const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

function expectSubContentClasses(slot: string) {
  const content = document.querySelector(`[data-slot="${slot}"]`);
  expect(content).toBeTruthy();
  const classes = new Set(content?.className.split(/\s+/));
  for (const token of SUB_CONTENT_CLASSES) expect(classes.has(token)).toBe(true);
  expect(classes.has("min-w-40")).toBe(true);
  expect(classes.has("min-w-[96px]")).toBe(false);
}

async function hover(slot: string) {
  document
    .querySelector(`[data-slot="${slot}"]`)
    ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  await tick();
}

describe("menu sub content classes", () => {
  test("dropdown menu sub content merges the default classes with the caller class", async () => {
    const view = mountUi(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-40">
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    await tick();
    await hover("dropdown-menu-sub-trigger");
    expectSubContentClasses("dropdown-menu-sub-content");
    view.unmount();
  });

  test("context menu sub content merges the default classes with the caller class", async () => {
    const view = mountUi(() => (
      <ContextMenu>
        <ContextMenuTrigger>Right</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent class="min-w-40">
              <ContextMenuItem>Item</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    ));
    view.root
      .querySelector('[data-slot="context-menu-trigger"]')
      ?.dispatchEvent(
        new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }),
      );
    await tick();
    await hover("context-menu-sub-trigger");
    expectSubContentClasses("context-menu-sub-content");
    view.unmount();
  });

  test("menubar sub content merges the default classes with the caller class", async () => {
    const view = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent class="min-w-40">
                <MenubarItem>Item</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));
    view.click('[data-slot="menubar-trigger"]');
    await tick();
    await hover("menubar-sub-trigger");
    expectSubContentClasses("menubar-sub-content");
    view.unmount();
  });
});
