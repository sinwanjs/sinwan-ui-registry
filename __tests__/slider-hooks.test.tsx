import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import { Slider, useSlider } from "../src/components/ui/slider";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("useSlider", () => {
  test("uncontrolled commit snaps, clamps, and updates local values", () => {
    const changes: number[][] = [];
    const slider = withSetup(() =>
      useSlider({
        defaultValue: [10, 20],
        min: 0,
        max: 50,
        step: 5,
        onValueChange: (next) => changes.push(next),
      }),
    );
    expect(slider.orientation.value).toBe("horizontal");
    expect(slider.primary.value).toBe(10);
    expect(slider.percent.value).toBe(20);

    slider.commit(13);
    expect(slider.values.value).toEqual([15]);
    expect(slider.percent.value).toBe(30);

    slider.commit(15);
    slider.commit(999);
    expect(slider.values.value).toEqual([50]);
    expect(changes).toEqual([[15], [15], [50]]);
  });

  test("controlled values follow props and ignore local commits", () => {
    const props = { value: 30, min: 0, max: 60 };
    const slider = withSetup(() => useSlider(props));
    expect(slider.primary.value).toBe(30);
    expect(slider.percent.value).toBe(50);
    slider.commit(45);
    expect(slider.values.value).toEqual([30]);
  });

  test("defaults to min and a zero-width span", () => {
    const slider = withSetup(() =>
      useSlider({ min: 4, max: 4, orientation: "vertical" }),
    );
    expect(slider.values.value).toEqual([4]);
    expect(slider.percent.value).toBe(0);
    expect(slider.orientation.value).toBe("vertical");
    expect(slider.step.value).toBe(1);
  });
});

describe("Slider markup", () => {
  test("controlled signal updates range, thumb, and input in place", async () => {
    const volume = signal([25]);
    const { root, unmount } = mountUi(() => (
      <Slider
        value={volume.value}
        onValueChange={(next) => {
          volume.value = next;
        }}
      />
    ));
    const range = root.querySelector(
      '[data-slot="slider-range"]',
    ) as HTMLElement;
    const thumb = root.querySelector(
      '[data-slot="slider-thumb"]',
    ) as HTMLElement;
    const input = root.querySelector(
      '[data-slot="slider-input"]',
    ) as HTMLInputElement;
    expect(range.getAttribute("style")).toContain("width: 25%");
    expect(thumb.getAttribute("style")).toContain("left: 25%");

    volume.value = [80];
    await Promise.resolve();
    expect(range.getAttribute("style")).toContain("width: 80%");
    expect(thumb.getAttribute("style")).toContain("left: 80%");
    expect(input.value).toBe("80");
    expect(root.querySelector('[data-slot="slider-input"]')).toBe(input);
    unmount();
  });

  test("vertical disabled slider keeps orientation markup", () => {
    const { root, unmount } = mountUi(() => (
      <Slider defaultValue={40} orientation="vertical" disabled class="x" />
    ));
    const host = root.querySelector('[data-slot="slider"]') as HTMLElement;
    expect(host.getAttribute("data-orientation")).toBe("vertical");
    expect(host.hasAttribute("data-disabled")).toBe(true);
    expect(host.className).toContain("flex-col");
    expect(host.className).toContain("x");
    const range = root.querySelector(
      '[data-slot="slider-range"]',
    ) as HTMLElement;
    expect(range.getAttribute("style")).toContain("height: 40%");
    const input = root.querySelector(
      '[data-slot="slider-input"]',
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.getAttribute("aria-orientation")).toBe("vertical");
    unmount();
  });
});
