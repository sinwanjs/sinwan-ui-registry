import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
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

describe("overlay open sync", () => {
  test("controlled dialog getter open/close", async () => {
    const open = signal(false);
    const ui = mountUi(() => (
      <Dialog
        open={open.value}
        onOpenChange={(v) => {
          open.value = v;
        }}
      >
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    ));
    expect(ui.query('[data-slot="dialog-content"]')).toBeNull();
    open.value = true;
    await wait(80);
    expect(ui.query('[data-slot="dialog-content"]')).toBeTruthy();
    open.value = false;
    await wait(300);
    expect(ui.query('[data-slot="dialog-content"]')).toBeNull();
    ui.click('[data-slot="dialog-trigger"]');
    await wait(80);
    expect(open.value).toBe(true);
    expect(ui.query('[data-slot="dialog-content"]')).toBeTruthy();
    ui.click('[data-slot="dialog-close"]');
    await wait(300);
    expect(open.value).toBe(false);
    expect(ui.query('[data-slot="dialog-content"]')).toBeNull();
    ui.click('[data-slot="dialog-trigger"]');
    await wait(80);
    expect(open.value).toBe(true);
    ui.unmount();
  });

  test("hover card stays open when moving toward content", async () => {
    const ui = mountUi(() => (
      <HoverCard>
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>
    ));
    const trig = ui.query('[data-slot="hover-card-trigger"]') as HTMLElement;
    trig.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(150);
    expect(ui.query('[data-slot="popover-content"]')).toBeTruthy();
    trig.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await wait(10);
    const content = ui.query('[data-slot="popover-content"]') as HTMLElement;
    expect(content).toBeTruthy();
    content.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await wait(200);
    expect(ui.query('[data-slot="popover-content"]')).toBeTruthy();
    content.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await wait(350);
    expect(ui.query('[data-slot="popover-content"]')).toBeNull();
    ui.unmount();
  });
});
