import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms));

function contentState(): string | null {
  return (
    document
      .querySelector('[data-slot="dropdown-menu-content"]')
      ?.getAttribute("data-state") ?? null
  );
}

function Menu() {
  return (
    <>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenuContent>
    </>
  );
}

describe("dropdown menu controlled open", () => {
  test("follows a controlled open signal", async () => {
    const open = signal(false);
    const ui = mountUi(() => (
      <DropdownMenu open={open.value}>
        <Menu />
      </DropdownMenu>
    ));
    await wait();
    expect(contentState()).toBeNull();
    open.value = true;
    await wait();
    expect(contentState()).toBe("open");
    open.value = false;
    await wait();
    expect(contentState()).not.toBe("open");
    ui.unmount();
  });

  test("trigger reports the next state once without changing controlled open", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <DropdownMenu open={false} onOpenChange={(next) => changes.push(next)}>
        <Menu />
      </DropdownMenu>
    ));
    await wait();
    ui.click('[data-slot="dropdown-menu-trigger"]');
    await wait();
    expect(changes).toEqual([true]);
    expect(contentState()).toBeNull();
    ui.unmount();
  });

  test("item select and Escape round-trip through the parent", async () => {
    const open = signal(true);
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <DropdownMenu
        open={open.value}
        onOpenChange={(next) => {
          changes.push(next);
          open.value = next;
        }}
      >
        <Menu />
      </DropdownMenu>
    ));
    await wait();
    expect(contentState()).toBe("open");
    ui.click('[data-slot="dropdown-menu-item"]');
    await wait();
    expect(changes).toEqual([false]);
    expect(contentState()).not.toBe("open");
    ui.click('[data-slot="dropdown-menu-trigger"]');
    await wait();
    expect(changes).toEqual([false, true]);
    expect(contentState()).toBe("open");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wait();
    expect(changes).toEqual([false, true, false]);
    expect(contentState()).not.toBe("open");
    ui.unmount();
  });
});

describe("dropdown menu uncontrolled open", () => {
  test("defaultOpen seeds local state and the trigger toggles it", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <DropdownMenu defaultOpen onOpenChange={(next) => changes.push(next)}>
        <Menu />
      </DropdownMenu>
    ));
    await wait();
    expect(contentState()).toBe("open");
    ui.click('[data-slot="dropdown-menu-trigger"]');
    await wait();
    expect(changes).toEqual([false]);
    expect(contentState()).not.toBe("open");
    ui.click('[data-slot="dropdown-menu-trigger"]');
    await wait();
    expect(changes).toEqual([false, true]);
    expect(contentState()).toBe("open");
    ui.unmount();
  });
});
