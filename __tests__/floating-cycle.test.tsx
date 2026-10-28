import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../src/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../src/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { Button } from "../src/components/ui/button";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      x: 10, y: 10, width: 80, height: 32, top: 10, left: 10, bottom: 42, right: 90,
      toJSON() { return this; },
    } as DOMRect;
  };
});
afterEach(() => teardownDom());

const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms));

describe("floating open/close cycles", () => {
  test("dialog close removes overlay and can reopen", async () => {
    let open = false;
    const ui = mountUi(() => (
      <Dialog onOpenChange={(v) => { open = v; }}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    ));
    for (let i = 0; i < 4; i++) {
      ui.click('[data-slot="dialog-trigger"]');
      await wait();
      expect(open).toBe(true);
      expect(ui.query('[data-slot="dialog-overlay"]')).toBeTruthy();
      ui.click('[data-slot="dialog-close"]');
      await wait(350);
      expect(open).toBe(false);
      expect(ui.query('[data-slot="dialog-overlay"]')).toBeNull();
      expect(ui.query('[data-slot="dialog-content"]')).toBeNull();
    }
    ui.unmount();
  });

  test("popover asChild open/close/open", async () => {
    let open = false;
    const ui = mountUi(() => (
      <Popover onOpenChange={(v) => { open = v; }}>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>
    ));
    for (let i = 0; i < 5; i++) {
      const trig = ui.query("button");
      expect(trig).toBeTruthy();
      trig!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait();
      expect(open).toBe(true);
      expect(ui.query('[data-slot="popover-content"]')).toBeTruthy();
      document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
      await wait(300);
      expect(open).toBe(false);
    }
    ui.unmount();
  });

  test("dialog overlay close does not reopen from trigger click-through", async () => {
    let open = false;
    const states: string[] = [];
    const ui = mountUi(() => (
      <Dialog onOpenChange={(v) => { open = v; }}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    ));
    ui.click('[data-slot="dialog-trigger"]');
    await wait();
    expect(open).toBe(true);
    const overlay = ui.query('[data-slot="dialog-overlay"]') as HTMLElement;
    expect(overlay).toBeTruthy();
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(open).toBe(false);
    expect(ui.query('[data-slot="dialog-overlay"]')).toBe(overlay);
    expect(overlay.getAttribute("data-state")).toBe("closed");
    states.push(overlay.getAttribute("data-state") ?? "");
    ui.click('[data-slot="dialog-trigger"]');
    await wait();
    expect(open).toBe(false);
    expect(overlay.getAttribute("data-state")).toBe("closed");
    states.push(overlay.getAttribute("data-state") ?? "");
    expect(states).toEqual(["closed", "closed"]);
    await wait(300);
    expect(open).toBe(false);
    expect(ui.query('[data-slot="dialog-overlay"]')).toBeNull();
    ui.click('[data-slot="dialog-trigger"]');
    await wait();
    expect(open).toBe(true);
    ui.unmount();
  });

  test("trigger click closes popover without reopen race", async () => {
    let open = false;
    let changes = 0;
    const ui = mountUi(() => (
      <Popover onOpenChange={(v) => { open = v; changes++; }}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>
    ));
    const trig = ui.query('[data-slot="popover-trigger"]') as HTMLElement;
    trig.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait();
    expect(open).toBe(true);
    const before = changes;
    // Real browser order: pointerdown then click on trigger
    trig.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    trig.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wait();
    expect(open).toBe(false);
    expect(changes).toBe(before + 1);
    ui.unmount();
  });

  test("sheet overlay dismiss keeps closed fill-mode classes until unmount", async () => {
    let open = false;
    const ui = mountUi(() => (
      <Sheet onOpenChange={(v) => { open = v; }}>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    ));
    ui.click('[data-slot="dialog-trigger"]');
    await wait();
    expect(open).toBe(true);
    const overlay = ui.query('[data-slot="dialog-overlay"]') as HTMLElement;
    const panel = ui.query('[data-slot="sheet-content"]') as HTMLElement;
    expect(overlay.className).toContain("duration-200");
    expect(overlay.className).toContain("!fill-mode-forwards");
    expect(panel.className).toContain("duration-200");
    expect(panel.className).toContain("!fill-mode-forwards");
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(open).toBe(false);
    expect(ui.query('[data-slot="dialog-overlay"]')).toBe(overlay);
    expect(ui.query('[data-slot="sheet-content"]')).toBe(panel);
    expect(overlay.getAttribute("data-state")).toBe("closed");
    expect(panel.getAttribute("data-state")).toBe("closed");
    ui.click('[data-slot="dialog-trigger"]');
    await wait();
    expect(open).toBe(false);
    expect(overlay.getAttribute("data-state")).toBe("closed");
    await wait(250);
    expect(ui.query('[data-slot="dialog-overlay"]')).toBeNull();
    ui.unmount();
  });

  test("dropdown menu dismiss keeps closed fill-mode classes until unmount", async () => {
    let open = false;
    const ui = mountUi(() => (
      <DropdownMenu onOpenChange={(v) => { open = v; }}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    ui.click('[data-slot="dropdown-menu-trigger"]');
    await wait();
    expect(open).toBe(true);
    const panel = ui.query('[data-slot="dropdown-menu-content"]') as HTMLElement;
    expect(panel.className).toContain("duration-200");
    expect(panel.className).toContain("!fill-mode-forwards");
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(open).toBe(false);
    expect(ui.query('[data-slot="dropdown-menu-content"]')).toBe(panel);
    expect(panel.getAttribute("data-state")).toBe("closed");
    await wait(250);
    expect(ui.query('[data-slot="dropdown-menu-content"]')).toBeNull();
    ui.unmount();
  });
});

describe("overlay exit CSS", () => {
  test("global stylesheet holds closed overlay animation fill-mode", () => {
    const css = readFileSync(
      join(import.meta.dir, "../src/styles/global.css"),
      "utf8",
    );
    expect(css).toContain("animation-fill-mode: forwards !important");
    expect(css).toContain('[data-slot="dialog-overlay"]');
    expect(css).toContain('[data-slot="sheet-content"]');
    expect(css).toContain('[data-slot="popover-content"]');
    expect(css).toContain('[data-slot="dropdown-menu-content"]');
    expect(css).toContain('[data-slot="select-content"]');
    expect(css).toContain('[data-slot="accordion-content"]');
  });
});
