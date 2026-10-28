import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  useHoverCard,
  useHoverCardContent,
  useHoverCardTrigger,
} from "../src/components/ui/hover-card";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("hover-card hooks", () => {
  test("context hooks throw outside a <HoverCard />", () => {
    expect(() => withSetup(() => useHoverCard())).toThrow(
      "useHoverCard must be used within a <HoverCard />",
    );
    expect(() => withSetup(() => useHoverCardTrigger())).toThrow(
      "HoverCardTrigger must be used within a <HoverCard />",
    );
    expect(() => withSetup(() => useHoverCardContent())).toThrow(
      "HoverCardContent must be used within a <HoverCard />",
    );
  });

  test("trigger opens after the hover delay and content hover keeps it open", async () => {
    const changes: boolean[] = [];
    const ui = mountUi(() => (
      <HoverCard onOpenChange={(open) => changes.push(open)}>
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent>card</HoverCardContent>
      </HoverCard>
    ));
    const trigger = ui.query('[data-slot="hover-card-trigger"]');
    if (!(trigger instanceof HTMLElement)) throw new Error("missing trigger");

    trigger.dispatchEvent(new FocusEvent("focus"));
    trigger.dispatchEvent(new FocusEvent("blur"));
    await wait(130);
    expect(changes).not.toContain(true);
    await wait(300);
    changes.length = 0;

    trigger.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(110);
    await Promise.resolve();
    expect(changes).toEqual([true]);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    trigger.dispatchEvent(new MouseEvent("mouseleave"));
    const content = ui.query('[data-slot="popover-content"]');
    if (!(content instanceof HTMLElement)) throw new Error("missing content");
    content.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(130);
    expect(changes.at(-1)).toBe(true);

    content.dispatchEvent(new MouseEvent("mouseleave"));
    await wait(130);
    await Promise.resolve();
    expect(changes.at(-1)).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).not.toBe("true");
    ui.unmount();
  });
});
