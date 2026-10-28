import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Key, Show } from "sinwan/control-flow";
import { signal } from "sinwan/reactivity";

import { Button } from "../src/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../src/components/ui/hover-card";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const tick = () => Promise.resolve();

function OpenCard() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger>@sinwan</HoverCardTrigger>
      <HoverCardContent>Sinwan UI</HoverCardContent>
    </HoverCard>
  );
}

describe("open overlay removed with its page", () => {
  test("Show removes the portaled hover card content", async () => {
    const page = signal(true);
    const view = mountUi(() => (
      <Show when={page.value}>
        <OpenCard />
      </Show>
    ));
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(1);

    page.value = false;
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(0);
    view.unmount();
  });

  test("Key route swap removes the portaled hover card content", async () => {
    const route = signal("hover-card");
    const view = mountUi(() => (
      <Key when={route.value}>
        {() => (route.value === "hover-card" ? <OpenCard /> : <p>Progress</p>)}
      </Key>
    ));
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(1);

    route.value = "progress";
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(0);
    view.unmount();
  });

  test("Key route swap removes a hover card opened after mount", async () => {
    const route = signal("hover-card");
    const view = mountUi(() => (
      <Key when={route.value}>
        {() =>
          route.value === "hover-card" ? (
            <HoverCard>
              <HoverCardTrigger>@sinwan</HoverCardTrigger>
              <HoverCardContent>Sinwan UI</HoverCardContent>
            </HoverCard>
          ) : (
            <p>Progress</p>
          )
        }
      </Key>
    ));
    await tick();
    const trigger = view.query('[data-slot="hover-card-trigger"]');
    trigger?.dispatchEvent(new MouseEvent("mouseenter"));
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(1);

    route.value = "progress";
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(0);
    view.unmount();
  });

  test("Key route swap removes an asChild hover card opened by hover", async () => {
    const route = signal("hover-card");
    const view = mountUi(() => (
      <Key when={route.value}>
        {() =>
          route.value === "hover-card" ? (
            <section>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@sinwan</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div class="flex flex-col gap-1">
                    <p class="font-medium">Sinwan UI</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </section>
          ) : (
            <p>Progress</p>
          )
        }
      </Key>
    ));
    await tick();
    const trigger = view.query("button");
    trigger?.dispatchEvent(new MouseEvent("mouseenter"));
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(1);

    route.value = "progress";
    await tick();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]').length).toBe(0);
    view.unmount();
  });
});
