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
import { mountUi, setupDom, teardownDom, type MountedUi } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type MenuCase = {
  name: string;
  prefix: "dropdown-menu" | "context-menu" | "menubar";
  mount: () => MountedUi;
  mountNested: () => MountedUi;
  open: (view: MountedUi) => void;
};

const cases: MenuCase[] = [
  {
    name: "dropdown menu",
    prefix: "dropdown-menu",
    mount: () =>
      mountUi(() => (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>More</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>New tab</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <button type="button" data-slot="outside">
            Outside
          </button>
        </>
      )),
    mountNested: () =>
      mountUi(() => (
        <DropdownMenu>
          <DropdownMenuTrigger>More</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Social</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Post</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )),
    open: (view) => view.click('[data-slot="dropdown-menu-trigger"]'),
  },
  {
    name: "context menu",
    prefix: "context-menu",
    mount: () =>
      mountUi(() => (
        <>
          <ContextMenu>
            <ContextMenuTrigger>Right click</ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Back</ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Email</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
          <button type="button" data-slot="outside">
            Outside
          </button>
        </>
      )),
    mountNested: () =>
      mountUi(() => (
        <ContextMenu>
          <ContextMenuTrigger>Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Social</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Post</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      )),
    open: (view) =>
      view.root
        .querySelector('[data-slot="context-menu-trigger"]')
        ?.dispatchEvent(
          new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }),
        ),
  },
  {
    name: "menubar",
    prefix: "menubar",
    mount: () =>
      mountUi(() => (
        <>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New</MenubarItem>
                <MenubarSub>
                  <MenubarSubTrigger>Share</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Email</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <button type="button" data-slot="outside">
            Outside
          </button>
        </>
      )),
    mountNested: () =>
      mountUi(() => (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarSub>
                    <MenubarSubTrigger>Social</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Post</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )),
    open: (view) => view.click('[data-slot="menubar-trigger"]'),
  },
];

function slot(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-slot="${name}"]`);
}

async function openSubmenu(menu: MenuCase, view: MountedUi): Promise<void> {
  menu.open(view);
  await wait(10);
  slot(`${menu.prefix}-sub-trigger`)?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  await wait(10);
  expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("open");
}

async function expectSubmenuGone(menu: MenuCase): Promise<void> {
  await wait(10);
  expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("closed");
  await wait(300);
  expect(slot(`${menu.prefix}-content`)).toBeNull();
  expect(slot(`${menu.prefix}-sub-content`)).toBeNull();
}

describe.each(cases)("$name submenu lifecycle", (menu) => {
  test("Escape closes and unmounts the open submenu with the root menu", async () => {
    const view = menu.mount();
    await openSubmenu(menu, view);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expectSubmenuGone(menu);
    view.unmount();
  });

  test("an outside pointerdown closes and unmounts the open submenu with the root menu", async () => {
    const view = menu.mount();
    await openSubmenu(menu, view);
    slot("outside")?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    await expectSubmenuGone(menu);
    view.unmount();
  });

  test("reopening the root menu after dismiss starts with the submenu closed", async () => {
    const view = menu.mount();
    await openSubmenu(menu, view);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(320);
    menu.open(view);
    await wait(10);
    expect(slot(`${menu.prefix}-content`)?.getAttribute("data-state")).toBe("open");
    expect(slot(`${menu.prefix}-sub-content`)).toBeNull();
    view.unmount();
  });

  test("clicking the sub-trigger after hover keeps the submenu open", async () => {
    const view = menu.mount();
    await openSubmenu(menu, view);
    const trigger = slot(`${menu.prefix}-sub-trigger`);
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(10);
    expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("open");
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(10);
    expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("open");
    expect(trigger?.hasAttribute("data-open")).toBe(true);
    view.unmount();
  });

  test("ArrowRight on the sub-trigger opens the submenu and exposes menu semantics", async () => {
    const view = menu.mount();
    menu.open(view);
    await wait(10);
    const trigger = slot(`${menu.prefix}-sub-trigger`);
    expect(trigger?.getAttribute("role")).toBe("menuitem");
    expect(trigger?.getAttribute("aria-haspopup")).toBe("menu");
    trigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await wait(10);
    expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("open");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    view.unmount();
  });

  test("closing the root menu closes nested submenus too", async () => {
    const view = menu.mountNested();
    menu.open(view);
    await wait(10);
    slot(`${menu.prefix}-sub-trigger`)?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(10);
    const triggers = document.querySelectorAll<HTMLElement>(`[data-slot="${menu.prefix}-sub-trigger"]`);
    triggers[1]?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(10);
    const subs = () => [...document.querySelectorAll(`[data-slot="${menu.prefix}-sub-content"]`)];
    expect(subs().map((el) => el.getAttribute("data-state"))).toEqual(["open", "open"]);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(10);
    expect(subs().map((el) => el.getAttribute("data-state"))).toEqual(["closed", "closed"]);
    await wait(300);
    expect(subs()).toEqual([]);
    view.unmount();
  });

  test("closing an outer submenu closes the submenu nested in it", async () => {
    const view = menu.mountNested();
    menu.open(view);
    await wait(10);
    const outer = slot(`${menu.prefix}-sub-trigger`);
    outer?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(10);
    document
      .querySelectorAll<HTMLElement>(`[data-slot="${menu.prefix}-sub-trigger"]`)[1]
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(10);
    outer?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await wait(150);
    const states = [...document.querySelectorAll(`[data-slot="${menu.prefix}-sub-content"]`)].map((el) =>
      el.getAttribute("data-state"),
    );
    expect(states).toEqual(["closed", "closed"]);
    expect(slot(`${menu.prefix}-content`)?.getAttribute("data-state")).toBe("open");
    view.unmount();
  });

  test("clicking a closed sub-trigger opens the submenu", async () => {
    const view = menu.mount();
    menu.open(view);
    await wait(10);
    slot(`${menu.prefix}-sub-trigger`)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait(10);
    expect(slot(`${menu.prefix}-sub-content`)?.getAttribute("data-state")).toBe("open");
    view.unmount();
  });
});
