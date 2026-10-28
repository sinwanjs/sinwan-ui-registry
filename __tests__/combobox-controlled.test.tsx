import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../src/components/ui/combobox";
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
      .querySelector('[data-slot="popover-content"]')
      ?.getAttribute("data-state") ?? null
  );
}

function Items() {
  return (
    <ComboboxContent>
      <ComboboxList>
        <ComboboxItem value="a">A</ComboboxItem>
        <ComboboxItem value="b">B</ComboboxItem>
      </ComboboxList>
    </ComboboxContent>
  );
}

describe("combobox controlled open", () => {
  test("follows a controlled open signal", async () => {
    const open = signal(false);
    const ui = mountUi(() => (
      <Combobox open={open.value}>
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <Items />
      </Combobox>
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
      <Combobox open={false} onOpenChange={(next) => changes.push(next)}>
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <Items />
      </Combobox>
    ));
    await wait();
    ui.click('[data-slot="combobox-trigger"]');
    await wait();
    expect(changes).toEqual([true]);
    expect(contentState()).toBeNull();
    ui.unmount();
  });

  test("trigger, item select, and Escape round-trip through the parent", async () => {
    const open = signal(false);
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <Combobox
        open={open.value}
        onOpenChange={(next) => {
          changes.push(next);
          open.value = next;
        }}
      >
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <Items />
      </Combobox>
    ));
    await wait();
    ui.click('[data-slot="combobox-trigger"]');
    await wait();
    expect(changes).toEqual([true]);
    expect(contentState()).toBe("open");
    ui.click('[data-slot="combobox-item"]');
    await wait();
    expect(changes).toEqual([true, false]);
    expect(open.value).toBe(false);
    expect(contentState()).not.toBe("open");
    await wait(300);
    ui.click('[data-slot="combobox-trigger"]');
    await wait();
    expect(contentState()).toBe("open");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wait();
    expect(changes).toEqual([true, false, true, false]);
    expect(contentState()).not.toBe("open");
    ui.unmount();
  });

  test("input focus while already open does not report again", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <Combobox open onOpenChange={(next) => changes.push(next)}>
        <ComboboxInput placeholder="Search" />
        <Items />
      </Combobox>
    ));
    await wait();
    ui.query("input")?.dispatchEvent(new Event("focus"));
    await wait();
    expect(changes).toEqual([]);
    expect(contentState()).toBe("open");
    ui.unmount();
  });
});

describe("combobox uncontrolled open", () => {
  test("defaultOpen seeds local state and the trigger toggles it once", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <Combobox defaultOpen onOpenChange={(next) => changes.push(next)}>
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <Items />
      </Combobox>
    ));
    await wait();
    expect(contentState()).toBe("open");
    ui.click('[data-slot="combobox-trigger"]');
    await wait();
    expect(changes).toEqual([false]);
    expect(contentState()).not.toBe("open");
    await wait(300);
    ui.click('[data-slot="combobox-trigger"]');
    await wait();
    expect(changes).toEqual([false, true]);
    expect(contentState()).toBe("open");
    ui.unmount();
  });

  test("input focus opens once", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <Combobox onOpenChange={(next) => changes.push(next)}>
        <ComboboxInput placeholder="Search" />
        <Items />
      </Combobox>
    ));
    await wait();
    ui.query("input")?.dispatchEvent(new Event("focus"));
    await wait();
    expect(changes).toEqual([true]);
    expect(contentState()).toBe("open");
    ui.unmount();
  });
});
