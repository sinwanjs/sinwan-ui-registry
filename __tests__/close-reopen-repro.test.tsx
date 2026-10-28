import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../src/components/ui/hover-card";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      x: 10,
      y: 10,
      width: 80,
      height: 32,
      top: 10,
      left: 10,
      bottom: 42,
      right: 90,
      toJSON() {
        return this;
      },
    } as DOMRect;
  };
});
afterEach(() => teardownDom());

const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms));

describe("close stays closed", () => {
  test("select pointerdown on trigger or content while open is ignored", async () => {
    let open = false;
    const ui = mountUi(() => (
      <Select
        onOpenChange={(v) => {
          open = v;
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    ));
    const trig = ui.query('[data-slot="select-trigger"]') as HTMLElement;
    trig.click();
    await wait();
    expect(open).toBe(true);
    trig.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
    );
    expect(open).toBe(true);
    const content = ui.query('[data-slot="select-content"]') as HTMLElement;
    content.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
    );
    expect(open).toBe(true);
    ui.unmount();
  });

  test("dropdown pointerdown on trigger while open does not dismissOutside", async () => {
    let open = false;
    const ui = mountUi(() => (
      <DropdownMenu
        onOpenChange={(v) => {
          open = v;
        }}
      >
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    const trig = ui.query('[data-slot="dropdown-menu-trigger"]') as HTMLElement;
    trig.click();
    await wait();
    expect(open).toBe(true);
    trig.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
    );
    expect(open).toBe(true);
    const content = ui.query('[data-slot="dropdown-menu-content"]') as HTMLElement;
    content.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
    );
    expect(open).toBe(true);
    ui.unmount();
  });

  test("hover card unmount under cursor does not flap open then closed", async () => {
    let open = false;
    const ui = mountUi(() => (
      <HoverCard
        onOpenChange={(v) => {
          open = v;
        }}
      >
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>
    ));
    const trig = ui.query('[data-slot="hover-card-trigger"]') as HTMLElement;
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(true);
    trig.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await wait(250);
    expect(open).toBe(false);
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(50);
    expect(open).toBe(false);
    ui.unmount();
  });

  test("hover card stays closed after dismiss while pointer remains on trigger", async () => {
    let open = false;
    const ui = mountUi(() => (
      <HoverCard
        onOpenChange={(v) => {
          open = v;
        }}
      >
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>
    ));
    const trig = ui.query('[data-slot="hover-card-trigger"]') as HTMLElement;
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(true);
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await wait();
    expect(open).toBe(false);
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(false);
    trig.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(true);
    ui.unmount();
  });

  test("hover card outside press while pointer is on trigger does not flap", async () => {
    let open = false;
    const ui = mountUi(() => (
      <HoverCard
        onOpenChange={(v) => {
          open = v;
        }}
      >
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>
    ));
    const trig = ui.query('[data-slot="hover-card-trigger"]') as HTMLElement;
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(true);
    document.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
    );
    await wait();
    expect(open).toBe(false);
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(open).toBe(false);
    ui.unmount();
  });
});
