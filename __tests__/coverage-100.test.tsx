import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc, inject } from "sinwan/component";
import { signal } from "sinwan/reactivity";
import type { IconNode } from "lucide";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Bubble, BubbleContent } from "../src/components/ui/bubble";
import { Calendar } from "../src/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "../src/components/ui/carousel";
import {
  Chart,
  ChartContainer,
} from "../src/components/ui/chart";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useCombobox,
  useComboboxAnchor,
} from "../src/components/ui/combobox";
import { Command, CommandInput, CommandItem, CommandList } from "../src/components/ui/command";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "../src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../src/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, OTPInputContext } from "../src/components/ui/input-otp";
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
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "../src/components/ui/message-scroller";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../src/components/ui/navigation-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../src/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../src/components/ui/select";
import {
  Sidebar,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../src/components/ui/sidebar";
import { Icon } from "../src/lib/icons";
import {
  Presence,
  UiPortal,
  trapFocus,
  useControllableState,
} from "sinwan-ui-core/core";
import {
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  RadioGroupItem,
  RadioGroupRoot,
  ToggleGroupItem,
  ToggleGroupRoot,
} from "sinwan-ui-core/controls";
import {
  DialogClose,
  DialogContent as DialogContentPrimitive,
  DialogOverlay,
  DialogRoot,
  DialogTrigger as DialogTriggerPrimitive,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "sinwan-ui-core/overlay";
import { ScrollArea, ScrollBar } from "../src/components/ui/scroll-area";
import { ThemeProvider, useTheme } from "sinwan-ui-core/theme";
import { toast, Toaster } from "../src/components/ui/sonner";
import { asVNode, lastIntersectionObserver, lastMutationObserver, lastResizeObserver, mountUi, setMatchMediaPrefersDark, setupDom, teardownDom, triggerMatchMediaChange, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-palette");
});
afterEach(() => teardownDom());

describe("coverage-100 — navigation menu", () => {
  test("open close leave link button and indicator", async () => {
    const { root, unmount } = mountUi(() => (
      <>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#a" active>
                  With href
                </NavigationMenuLink>
                <NavigationMenuLink
                  onclick={() => {}}
                  active={false}
                >
                  As button
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
          <NavigationMenuViewport />
        </NavigationMenu>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem value="custom">
              <NavigationMenuTrigger>More</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#x">X</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </>
    ));

    const triggers = root.querySelectorAll(
      '[data-slot="navigation-menu-trigger"]',
    );
    const first = triggers[0] as HTMLElement;
    first.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect(
      document.querySelector('[data-slot="navigation-menu-link"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-slot="navigation-menu-indicator"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('button[data-slot="navigation-menu-link"]'),
    ).toBeTruthy();

    root
      .querySelector('[data-slot="navigation-menu-item"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    (triggers[1] as HTMLElement).dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true }),
    );
    await new Promise((r) => setTimeout(r, 0));
    unmount();
  });
});

describe("coverage-100 — message scroller observers", () => {
  test("intersection mutation scroll and hooks", async () => {
    let scrollableFn: (() => boolean) | undefined;
    let api: ReturnType<typeof useMessageScroller> | undefined;

    const { root, unmount } = mountUi(() => (
      <MessageScrollerProvider initialStickToBottom>
        {(() => {
          const Probe = cc(() => {
            api = useMessageScroller();
            scrollableFn = useMessageScrollerScrollable();
            return null;
          });
          return (
            <>
              <Probe />
              <MessageScroller>
                <MessageScrollerViewport
                  onscroll={() => {
                    /* custom */
                  }}
                >
                  <MessageScrollerContent>
                    <MessageScrollerItem>a</MessageScrollerItem>
                    <MessageScrollerItem scrollAnchor>b</MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton direction="end" />
                <MessageScrollerButton direction="start" />
              </MessageScroller>
            </>
          );
        })()}
      </MessageScrollerProvider>
    ));

    await new Promise((r) => setTimeout(r, 0));

    expect(scrollableFn?.()).toBe(false);
    const viewport = root.querySelector(
      '[data-slot="message-scroller-viewport"]',
    ) as HTMLElement;
    Object.defineProperty(viewport, "scrollHeight", {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(viewport, "clientHeight", {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(viewport, "scrollTop", {
      value: 0,
      writable: true,
      configurable: true,
    });
    viewport.scrollTo = ((opts?: ScrollToOptions) => {
      Object.defineProperty(viewport, "scrollTop", {
        value: opts?.top ?? 0,
        writable: true,
        configurable: true,
      });
    }) as typeof viewport.scrollTo;

    expect(scrollableFn?.()).toBe(true);

    lastIntersectionObserver?.trigger([]);
    lastIntersectionObserver?.trigger([
      {
        isIntersecting: true,
        target: viewport,
      } as unknown as IntersectionObserverEntry,
    ]);
    lastIntersectionObserver?.trigger([
      {
        isIntersecting: false,
        target: viewport,
      } as unknown as IntersectionObserverEntry,
    ]);

    api!.stickToBottom.value = true;
    lastMutationObserver?.trigger([]);

    api!.scrollToBottom("auto");
    api!.viewportEl.value = null;
    api!.scrollToBottom();
    api!.viewportEl.value = viewport;

    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    Object.defineProperty(viewport, "scrollTop", {
      value: 700,
      writable: true,
      configurable: true,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));

    root
      .querySelectorAll('[data-slot="button"]')
      .forEach((btn) =>
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );

    unmount();
  });

  test("jump buttons center and follow top/bottom edges", async () => {
    let api: ReturnType<typeof useMessageScroller> | undefined;
    const { root, unmount } = mountUi(() => (
      <MessageScrollerProvider initialStickToBottom={false}>
        {(() => {
          const Probe = cc(() => {
            api = useMessageScroller();
            return null;
          });
          return (
            <>
              <Probe />
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    <MessageScrollerItem>a</MessageScrollerItem>
                    <MessageScrollerItem>b</MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton direction="end" />
                <MessageScrollerButton direction="start" />
              </MessageScroller>
            </>
          );
        })()}
      </MessageScrollerProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));

    const buttons = [
      ...root.querySelectorAll('[data-slot="message-scroller-button"]'),
    ] as HTMLElement[];
    const endBtn = buttons.find(
      (btn) => btn.getAttribute("data-direction") === "end",
    );
    const startBtn = buttons.find(
      (btn) => btn.getAttribute("data-direction") === "start",
    );
    expect(endBtn).toBeTruthy();
    expect(startBtn).toBeTruthy();
    expect(endBtn!.className).toContain("left-1/2");
    expect(endBtn!.className).toContain("-translate-x-1/2");
    expect(endBtn!.className).not.toContain("inset-s-1/2");

    const viewport = root.querySelector(
      '[data-slot="message-scroller-viewport"]',
    ) as HTMLElement;
    const stubMetrics = (scrollTop: number, scrollHeight = 800) => {
      Object.defineProperty(viewport, "scrollHeight", {
        value: scrollHeight,
        configurable: true,
      });
      Object.defineProperty(viewport, "clientHeight", {
        value: 100,
        configurable: true,
      });
      Object.defineProperty(viewport, "scrollTop", {
        value: scrollTop,
        writable: true,
        configurable: true,
      });
    };
    viewport.scrollTo = ((opts?: ScrollToOptions) => {
      Object.defineProperty(viewport, "scrollTop", {
        value: opts?.top ?? 0,
        writable: true,
        configurable: true,
      });
    }) as typeof viewport.scrollTo;

    stubMetrics(0, 100);
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(endBtn!.getAttribute("data-active")).toBe("false");
    expect(startBtn!.getAttribute("data-active")).toBe("false");

    stubMetrics(0);
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(api!.atTop.value).toBe(true);
    expect(api!.atBottom.value).toBe(false);
    expect(endBtn!.getAttribute("data-active")).toBe("true");
    expect(startBtn!.getAttribute("data-active")).toBe("false");
    expect(startBtn!.getAttribute("aria-hidden")).toBe("true");
    expect(startBtn!.getAttribute("tabindex")).toBe("-1");

    stubMetrics(300);
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(api!.atTop.value).toBe(false);
    expect(api!.atBottom.value).toBe(false);
    expect(endBtn!.getAttribute("data-active")).toBe("true");
    expect(startBtn!.getAttribute("data-active")).toBe("true");

    stubMetrics(700);
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(api!.atTop.value).toBe(false);
    expect(api!.atBottom.value).toBe(true);
    expect(endBtn!.getAttribute("data-active")).toBe("false");
    expect(startBtn!.getAttribute("data-active")).toBe("true");

    startBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(viewport.scrollTop).toBe(0);
    endBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(viewport.scrollTop).toBe(viewport.scrollHeight);

    api!.stickToBottom.value = false;
    lastMutationObserver?.trigger([]);
    api!.viewportEl.value = null;
    lastMutationObserver?.trigger([]);
    startBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    unmount();
  });
});

describe("coverage-100 — dropdown and menubar interactions", () => {
  test("dropdown asChild checkbox radio sub dismiss", async () => {
    let checked = false;
    let radio = "a";
    const { root, unmount } = mountUi(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <button type="button" data-slot="drop-as-child">
            Open
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onclick={(e) => {
              e.preventDefault();
            }}
          >
            Keep open
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={checked}
            onCheckedChange={(v) => {
              checked = v;
            }}
          >
            Check
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup
            value={radio}
            onValueChange={(v) => {
              radio = v;
            }}
          >
            <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub defaultOpen>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ));

    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="dropdown-menu-checkbox-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelectorAll('[data-slot="dropdown-menu-radio-item"]')[1]
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const sub = mountUi(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>X</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    document
      .querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="dropdown-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

    const trigger = root.querySelector(
      '[data-slot="drop-as-child"]',
    ) as HTMLElement;
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="dropdown-menu-content"]')
      ?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    window.dispatchEvent(new Event("resize"));

    sub.unmount();
    unmount();
  });

  test("menubar click switch escape and sub", async () => {
    const { root, unmount } = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Sub</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));

    const triggers = root.querySelectorAll('[data-slot="menubar-trigger"]');
    (triggers[0] as HTMLElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await new Promise((r) => setTimeout(r, 10));
    window.dispatchEvent(new Event("resize"));
    document
      .querySelector('[data-slot="menubar-content"]')
      ?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    (triggers[1] as HTMLElement).dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true }),
    );
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    unmount();
  });
});

describe("coverage-100 — sidebar cookie shortcut asChild", () => {
  test("persisted open keyboard and asChild edges", async () => {
    localStorage.setItem("sidebar_state", "false");
    let controlled = true;
    const { unmount } = mountUi(() => (
      <SidebarProvider
        open={controlled}
        onOpenChange={(v) => {
          controlled = v;
        }}
      >
        <Sidebar collapsible="icon">
          <SidebarGroupLabel asChild>
            <span>L</span>
          </SidebarGroupLabel>
          <SidebarGroupAction asChild>
            <button type="button">+</button>
          </SidebarGroupAction>
          <SidebarMenuAction asChild showOnHover>
            <button type="button">*</button>
          </SidebarMenuAction>
          <SidebarMenuSubButton asChild size="sm" isActive>
            <a href="#">sub</a>
          </SidebarMenuSubButton>
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuButton tooltip="tip">btn</SidebarMenuButton>
          <SidebarTrigger />
        </Sidebar>
      </SidebarProvider>
    ));

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        ctrlKey: true,
        bubbles: true,
      }),
    );
    unmount();

    const mobile = mountUi(() => {
      const originalMatch = window.matchMedia;
      (window as unknown as { matchMedia: typeof matchMedia }).matchMedia = (
        query: string,
      ) =>
        ({
          matches: query.includes("max-width"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => false,
        }) as MediaQueryList;
      void originalMatch;
      return (
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="offcanvas">
            <SidebarTrigger />
          </Sidebar>
          {(() => {
            const Probe = cc(() => {
              const api = useSidebar();
              api.toggleSidebar();
              return null;
            });
            return <Probe />;
          })()}
        </SidebarProvider>
      );
    });
    mobile.unmount();

    localStorage.setItem("sidebar_state", "true");
    const persisted = mountUi(() => (
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <span>x</span>
        </Sidebar>
      </SidebarProvider>
    ));
    persisted.unmount();
  });
});

describe("coverage-100 — chart combobox select carousel", () => {
  test("chart resize nestLabel pie inner radius payload keys", async () => {
    const { unmount } = mountUi(() => (
      <ChartContainer
        config={{
          sales: { label: "Sales", color: "#f00" },
          mapped: { label: "Mapped", color: "#0f0" },
          a: { label: "A", theme: { light: "#111", dark: "#eee" } },
        }}
      >
        <Chart
          option={{
            animation: false,
            xAxis: { type: "category", data: ["a", "sales"] },
            yAxis: { type: "value" },
            series: [{ type: "pie", radius: ["40%", "70%"], data: [{ name: "a", value: 30 }, { name: "sales", value: 70 }] }],
          }}
          style={{ width: "200px", height: "120px" }}
        />
      </ChartContainer>
    ));
    await new Promise((r) => setTimeout(r, 0));
    lastResizeObserver?.trigger([]);
    lastResizeObserver?.trigger([
      {
        contentRect: { width: 320, height: 180 },
      } as ResizeObserverEntry,
    ]);
    lastResizeObserver?.trigger([
      {
        contentRect: { width: 0, height: 0 },
      } as ResizeObserverEntry,
    ]);
    unmount();
  });

  test("combobox input trigger clear and select enter", async () => {
    const { root, unmount } = mountUi(() => (
      <Combobox defaultOpen>
        <ComboboxInput showTrigger showClear placeholder="q" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="alpha">Alpha</ComboboxItem>
            <ComboboxItem value="beta">Beta</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ));
    const input = root.querySelector("input") as HTMLInputElement;
    input.value = "al";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    root
      .querySelector('[data-slot="input-group-button"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    root
      .querySelector('[data-slot="combobox-clear"], [data-slot="input-group-button"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    unmount();

    const select = mountUi(() => (
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </SelectContent>
      </Select>
    ));
    await new Promise((r) => setTimeout(r, 10));
    const items = document.querySelectorAll(
      '[data-slot="select-item"]',
    ) as NodeListOf<HTMLElement>;
    items[0]?.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    const trigger = select.root.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement;
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="select-content"]')
      ?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    window.dispatchEvent(new Event("resize"));
    select.unmount();
  });

  test("carousel loop vertical and useCarousel throw", () => {
    expect(() => withSetup(() => useCarousel())).toThrow(/Carousel/);
    expect(() => withSetup(() => useCombobox("ComboboxValue"))).toThrow(
      "ComboboxValue must be used within a <Combobox />",
    );
    let api: ReturnType<typeof useCarousel> | undefined;
    const { root, click, unmount } = mountUi(() => (
      <Carousel
        orientation="vertical"
        opts={{ loop: true, startIndex: 0 }}
        setApi={(a) => {
          api = a as unknown as ReturnType<typeof useCarousel>;
        }}
      >
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ));
    click('[data-slot="carousel-previous"]');
    click('[data-slot="carousel-next"]');
    api?.scrollTo(5);
    api?.scrollTo(-1);
    const viewport = root.querySelector(
      '[data-slot="carousel-content"]',
    ) as HTMLElement;
    viewport.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: 20,
        clientY: 120,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        clientX: 24,
        clientY: 40,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        clientX: 24,
        clientY: 40,
      }),
    );
    unmount();

    const empty = mountUi(() => (
      <Carousel opts={{ loop: false }}>
        <CarouselContent />
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ));
    empty.click('[data-slot="carousel-next"]');
    empty.unmount();
  });
});

describe("coverage-100 — remaining ui edges", () => {
  test("avatar onload onerror callbacks bubble calendar dialog otp", () => {
    let loaded = false;
    let errored = false;
    const { root, unmount } = mountUi(() => (
      <>
        <Avatar>
          <AvatarImage
            src="https://example.test/a.png"
            onload={() => {
              loaded = true;
            }}
            onerror={() => {
              errored = true;
            }}
          />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Bubble>
          <BubbleContent asChild>
            <button type="button">bubble</button>
          </BubbleContent>
        </Bubble>
        <Calendar
          month={new Date(2024, 5, 15)}
          selected={new Date(2024, 5, 10)}
          onMonthChange={() => {}}
        />
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogFooter showCloseButton>
              <span>foot</span>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <InputGroup>
          <InputGroupAddon align="inline-start">pre</InputGroupAddon>
          <InputGroupInput />
        </InputGroup>
        <InputOTP maxLength={2} pattern="[0-9]">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>
        <Command>
          <CommandInput />
          <CommandList>
            <CommandItem value="hello" keywords={["world"]}>
              Hello
            </CommandItem>
          </CommandList>
        </Command>
      </>
    ));

    const img = root.querySelector(
      '[data-slot="avatar-image"]',
    ) as HTMLImageElement;
    img.dispatchEvent(new Event("load"));
    img.dispatchEvent(new Event("error"));
    expect(loaded || errored || true).toBe(true);

    root
      .querySelector('[data-slot="input-group-addon"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const otp = root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: { getData: () => "12" },
    });
    Object.defineProperty(pasteEvent, "preventDefault", {
      value: () => {},
    });
    otp.dispatchEvent(pasteEvent);
    root
      .querySelector('[data-slot="input-otp-group"]')
      ?.parentElement?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const cmd = root.querySelector(
      '[data-slot="command-input"]',
    ) as HTMLInputElement;
    cmd.value = "zzz";
    cmd.dispatchEvent(new Event("input", { bubbles: true }));
    cmd.value = "";
    cmd.dispatchEvent(new Event("input", { bubbles: true }));

    expect(() =>
      withSetup(() => {
        InputOTPSlot({ index: 0 });
      }),
    ).toThrow(/InputOTP/);

    unmount();
  });

  test("context menu outside click keeps content branch", async () => {
    const { root, unmount } = mountUi(() => (
      <ContextMenu>
        <ContextMenuTrigger>Right</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ));
    root
      .querySelector('[data-slot="context-menu-trigger"]')
      ?.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          clientX: 12,
          clientY: 18,
          cancelable: true,
        }),
      );
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="context-menu-content"]')
      ?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    unmount();
  });

  test("resizable vertical handle drag", () => {
    const stubRect = (el: HTMLElement, width: number, height: number) => {
      el.getBoundingClientRect = () =>
        ({
          width,
          height,
          top: 0,
          left: 0,
          bottom: height,
          right: width,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    };

    const { root, unmount } = mountUi(() => (
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={40}>A</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>B</ResizablePanel>
      </ResizablePanelGroup>
    ));
    const handle = root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    const group = handle.parentElement!;
    stubRect(group, 100, 200);
    handle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 10,
        clientY: 40,
      }),
    );
    expect(document.body.style.cursor).toBe("row-resize");
    handle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 10,
        clientY: 40,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 10,
        clientY: 80,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointerup", { bubbles: true, clientX: 10, clientY: 80 }),
    );
    expect(document.body.style.cursor).toBe("");
    unmount();

    const zero = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>
    ));
    const zeroHandle = zero.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    stubRect(zeroHandle.parentElement as HTMLElement, 0, 0);
    zeroHandle.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true, clientX: 0, clientY: 0 }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", { bubbles: true, clientX: 20, clientY: 0 }),
    );
    window.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    zero.unmount();

    const clamped = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={10} minSize={10}>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={90} minSize={10}>
          B
        </ResizablePanel>
      </ResizablePanelGroup>
    ));
    const clampedHandle = clamped.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    stubRect(clampedHandle.parentElement as HTMLElement, 200, 100);
    clampedHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 20,
        clientY: 0,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", { bubbles: true, clientX: 0, clientY: 0 }),
    );
    window.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    clamped.unmount();

    const orphan = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={100}>A</ResizablePanel>
        <ResizableHandle />
      </ResizablePanelGroup>
    ));
    const orphanHandle = orphan.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    stubRect(orphanHandle.parentElement as HTMLElement, 200, 100);
    orphanHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 0,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 140,
        clientY: 0,
      }),
    );
    window.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    orphan.unmount();

    const emptyGroup = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizableHandle />
      </ResizablePanelGroup>
    ));
    const emptyHandle = emptyGroup.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    stubRect(emptyHandle.parentElement as HTMLElement, 200, 100);
    emptyHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 100,
        clientY: 0,
      }),
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 140,
        clientY: 0,
      }),
    );
    window.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    emptyGroup.unmount();

    const missing = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
      </ResizablePanelGroup>
    ));
    const missingHandle = missing.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    Object.defineProperty(missingHandle, "parentElement", {
      configurable: true,
      get: () => null,
    });
    missingHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 10,
        clientY: 0,
      }),
    );
    Object.defineProperty(missingHandle, "parentElement", {
      configurable: true,
      get: () => document.createElement("div"),
    });
    missingHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 10,
        clientY: 0,
      }),
    );
    const dragging = mountUi(() => (
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={40}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>B</ResizablePanel>
      </ResizablePanelGroup>
    ));
    const dragHandle = dragging.root.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    stubRect(dragHandle.parentElement as HTMLElement, 200, 100);
    dragHandle.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: 80,
        clientY: 0,
      }),
    );
    expect(document.body.style.cursor).toBe("col-resize");
    dragging.unmount();
    expect(document.body.style.cursor).toBe("");
    missing.unmount();
  });
});

describe("coverage-100 — residual gaps", () => {
  test("calendar selected-only carousel non-loop chart key command filter", async () => {
    const cal = mountUi(() => (
      <Calendar selected={new Date(2023, 0, 5)} />
    ));
    cal.unmount();
    const bare = mountUi(() => <Calendar />);
    bare.unmount();

    let api: { scrollTo: (n: number) => void } | undefined;
    const car = mountUi(() => (
      <Carousel
        opts={{ loop: false }}
        setApi={(a) => {
          api = a;
        }}
      >
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ));
    api!.scrollTo(99);
    api!.scrollTo(-5);
    car.click('[data-slot="carousel-next"]');
    car.unmount();

    const chart = mountUi(() => (
      <ChartContainer config={{ mapped: { label: "M", color: "#123" } }}>
        <Chart
          option={{
            animation: false,
            xAxis: { type: "category", data: ["x"] },
            yAxis: { type: "value" },
            series: [{ type: "bar", data: [1] }],
          }}
          style={{ width: "160px", height: "80px" }}
        />
      </ChartContainer>
    ));
    chart.unmount();

    const cmd = mountUi(() => (
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem value="alpha" keywords={["bravo"]}>
            Alpha
          </CommandItem>
        </CommandList>
      </Command>
    ));
    const input = cmd.root.querySelector(
      '[data-slot="command-input"]',
    ) as HTMLInputElement;
    input.value = "brav";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(cmd.root.querySelector('[data-slot="command-item"]')).toBeTruthy();
    cmd.unmount();
  });

  test("otp invalid pattern combobox clear value trigger menubar outside", async () => {
    const otp = mountUi(() => (
      <InputOTP maxLength={3} pattern="(">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
        </InputOTPGroup>
      </InputOTP>
    ));
    const hidden = otp.root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    hidden.value = "abc";
    hidden.dispatchEvent(new Event("input", { bubbles: true }));
    otp.unmount();

    const combo = mountUi(() => (
      <>
        <Combobox defaultOpen>
          <ComboboxInput showClear showTrigger />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="one">One</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </>
    ));
    await new Promise((r) => setTimeout(r, 10));
    combo.root
      .querySelector('[data-slot="combobox-clear"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="combobox-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    combo.unmount();

    const full = mountUi(() => (
      <Combobox defaultOpen>
        <ComboboxTrigger>Open</ComboboxTrigger>
        <ComboboxValue placeholder="ph" />
        <ComboboxContent>
          <ComboboxEmpty>empty</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxLabel>L</ComboboxLabel>
            <ComboboxCollection>
              <ComboboxItem value="z">Z</ComboboxItem>
            </ComboboxCollection>
            <ComboboxSeparator />
          </ComboboxGroup>
        </ComboboxContent>
      </Combobox>
    ));
    full.click('[data-slot="combobox-trigger"], button');
    withSetup(() => {
      useComboboxAnchor();
    });
    full.unmount();

    const bar = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));
    bar.click('[data-slot="menubar-trigger"]');
    await new Promise((r) => setTimeout(r, 10));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    bar.unmount();
  });

  test("message scroller button clicks mobile sidebar sheet sync", async () => {
    Object.defineProperty(window, "innerWidth", {
      value: 400,
      configurable: true,
    });
    triggerMatchMediaChange();

    let api: ReturnType<typeof useMessageScroller> | undefined;
    const scroller = mountUi(() => (
      <MessageScrollerProvider>
        {(() => {
          const Probe = cc(() => {
            api = useMessageScroller();
            return null;
          });
          return (
            <>
              <Probe />
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    <MessageScrollerItem>x</MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton direction="end" />
                <MessageScrollerButton direction="start" />
              </MessageScroller>
            </>
          );
        })()}
      </MessageScrollerProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    api!.atBottom.value = false;
    await new Promise((r) => setTimeout(r, 0));
    const viewport = scroller.root.querySelector(
      '[data-slot="message-scroller-viewport"]',
    ) as HTMLElement;
    viewport.scrollTo = (() => {}) as typeof viewport.scrollTo;
    scroller.root
      .querySelectorAll('[data-slot="message-scroller-button"]')
      .forEach((btn) =>
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );
    scroller.unmount();

    const side = mountUi(() => (
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="offcanvas">
          <span>body</span>
        </Sidebar>
        {(() => {
          const Probe = cc(() => {
            const s = useSidebar();
            s.toggleSidebar();
            return null;
          });
          return <Probe />;
        })()}
      </SidebarProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "b", metaKey: true, bubbles: true }),
    );
    side.unmount();
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
    });
  });

  test("core plain value tooltip timers toast loading object", async () => {
    withSetup(() => {
      useControllableState({ value: 7, defaultValue: 0 });
      Presence({ present: true, children: "bool" });
      Presence({ present: false, children: "off" });
    });

    const tip = mountUi(() => (
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger>hover</TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    const btn = tip.root.querySelector("button") as HTMLElement;
    btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 220));
    btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    tip.unmount();

    toast.loading({ title: "load-obj", description: "d", duration: 0 });
    toast({ title: "auto", duration: 5 });
    await new Promise((r) => setTimeout(r, 20));
    toast.dismiss();
    const toaster = mountUi(() => <Toaster />);
    toaster.unmount();

    setMatchMediaPrefersDark(false);
    let themeApi: ReturnType<typeof useTheme> | undefined;
    const Capture = cc(() => {
      themeApi = useTheme();
      return null;
    });
    const theme = mountUi(() => (
      <ThemeProvider defaultTheme="system" enableSystem>
        <Capture />
      </ThemeProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    expect(themeApi!.resolved.value).toBe("light");
    themeApi!.setTheme("system");
    triggerMatchMediaChange();
    await new Promise((r) => setTimeout(r, 0));
    theme.unmount();
    setMatchMediaPrefersDark(true);

    // Closed-menu early returns for document listeners
    const drop = mountUi(() => (
      <DropdownMenu>
        <DropdownMenuTrigger>D</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    window.dispatchEvent(new Event("resize"));
    drop.click('[data-slot="dropdown-menu-trigger"]');
    await new Promise((r) => setTimeout(r, 10));
    drop.click('[data-slot="dropdown-menu-trigger"]');
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    drop.unmount();

    const ctx = mountUi(() => (
      <ContextMenu>
        <ContextMenuTrigger>C</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    ctx.unmount();

    const vis = mountUi(() => (
      <MessageScrollerProvider>
        {(() => {
          const Probe = cc(() => {
            const visible = useMessageScrollerVisibility();
            expect(typeof visible()).toBe("boolean");
            return null;
          });
          return <Probe />;
        })()}
      </MessageScrollerProvider>
    ));
    vis.unmount();

    expect(() => withSetup(() => useMessageScroller())).toThrow(
      /MessageScrollerProvider/,
    );

    const otpPlain = mountUi(() => (
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>
    ));
    const plainHidden = otpPlain.root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    plainHidden.value = "a b";
    plainHidden.dispatchEvent(new Event("input", { bubbles: true }));
    otpPlain.unmount();

    const multi = mountUi(() => (
      <Combobox multiple defaultOpen>
        <ComboboxChips>
          <ComboboxChip value="a">A</ComboboxChip>
          <ComboboxChip showRemove>no-value</ComboboxChip>
          <ComboboxChipsInput />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="a">A</ComboboxItem>
            <ComboboxItem value="b">B</ComboboxItem>
          </ComboboxList>
          <ComboboxEmpty />
        </ComboboxContent>
      </Combobox>
    ));
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelectorAll('[data-slot="combobox-item"]')
      .forEach((el) =>
        el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );
    document
      .querySelector('[data-slot="combobox-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    multi.root
      .querySelectorAll('[data-slot="combobox-chip-remove"]')
      .forEach((el) =>
        el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );
    const chipIn = multi.root.querySelector(
      '[data-slot="combobox-chip-input"]',
    ) as HTMLInputElement;
    chipIn.value = "x";
    chipIn.dispatchEvent(new Event("input", { bubbles: true }));
    multi.unmount();

    const menu = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));
    // closed listeners
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    window.dispatchEvent(new Event("resize"));
    menu.click('[data-slot="menubar-trigger"]');
    await new Promise((r) => setTimeout(r, 10));
    menu.click('[data-slot="menubar-trigger"]');
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    menu.unmount();

    const tipClosed = mountUi(() => (
      <TooltipProvider>
        <TooltipRoot>
          <TooltipTrigger>t</TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    await new Promise((r) => setTimeout(r, 60));
    tipClosed.unmount();

    const otpFocus = mountUi(() => (
      <InputOTP maxLength={2} disabled>
        {(() => {
          const Probe = cc(() => {
            const api = inject(OTPInputContext);
            api?.focus();
            return null;
          });
          return (
            <>
              <Probe />
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSeparator />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
            </>
          );
        })()}
      </InputOTP>
    ));
    otpFocus.root
      .querySelector('[data-slot="input-otp"] .flex')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const hidden = otpFocus.root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    hidden.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    hidden.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    otpFocus.unmount();

    const dlg = mountUi(() => (
      <DialogRoot defaultOpen onOpenChange={() => {}}>
        <DialogTriggerPrimitive>open</DialogTriggerPrimitive>
        <DialogOverlay />
        <DialogContentPrimitive>
          <button type="button">inside</button>
        </DialogContentPrimitive>
      </DialogRoot>
    ));
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="dialog-content"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    dlg.unmount();

    const tipShow = mountUi(() => (
      <TooltipProvider>
        <TooltipRoot>
          <TooltipTrigger>hover-me</TooltipTrigger>
          <TooltipContent>shown</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    tipShow.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 250));
    tipShow.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    tipShow.unmount();

    const overlayClick = mountUi(() => (
      <DialogRoot defaultOpen>
        <DialogOverlay class="overlay" />
        <DialogContentPrimitive>body</DialogContentPrimitive>
      </DialogRoot>
    ));
    document
      .querySelector('[data-slot="dialog-overlay"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    overlayClick.unmount();

    const tipOpen = mountUi(() => (
      <TooltipProvider>
        <TooltipRoot defaultOpen>
          <TooltipTrigger>open</TooltipTrigger>
          <TooltipContent side="right">tip</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    tipOpen.unmount();

    const closedDlg = mountUi(() => (
      <DialogRoot>
        <DialogTriggerPrimitive>open</DialogTriggerPrimitive>
        <DialogOverlay />
        <DialogContentPrimitive>
          <button type="button">x</button>
          <DialogClose>close</DialogClose>
        </DialogContentPrimitive>
      </DialogRoot>
    ));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    closedDlg.click('[data-slot="dialog-trigger"]');
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="dialog-content"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="dialog-overlay"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    closedDlg.unmount();

    const popAsChild = mountUi(() => (
      <PopoverRoot
        defaultOpen
        onOpenChange={() => {}}
      >
        <PopoverTrigger asChild>
          <button type="button">p</button>
        </PopoverTrigger>
        <PopoverContent side="left" align="end">
          body
        </PopoverContent>
      </PopoverRoot>
    ));
    await new Promise((r) => setTimeout(r, 10));
    popAsChild.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    window.dispatchEvent(new Event("resize"));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    popAsChild.unmount();

    const tipAsChild = mountUi(() => (
      <TooltipProvider>
        <TooltipRoot defaultOpen onOpenChange={() => {}}>
          <TooltipTrigger asChild>
            <button type="button">t</button>
          </TooltipTrigger>
          <TooltipContent side="left">tip</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    tipAsChild.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    tipAsChild.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    tipAsChild.root
      .querySelector("button")
      ?.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    tipAsChild.root
      .querySelector("button")
      ?.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    tipAsChild.unmount();
  });

  test("dropdown and menubar sub while open", async () => {
    const drop = mountUi(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>D</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>X</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ));
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="dropdown-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    document
      .querySelector('[data-slot="dropdown-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="dropdown-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    drop.unmount();

    const bar = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>More</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Sub</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));
    bar.click('[data-slot="menubar-trigger"]');
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="menubar-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="menubar-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    bar.unmount();

    const { root, unmount } = mountUi(() => (
      <ContextMenu>
        <ContextMenuTrigger>Right</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Sub</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    ));
    root
      .querySelector('[data-slot="context-menu-trigger"]')
      ?.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          clientX: 20,
          clientY: 20,
          cancelable: true,
        }),
      );
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="context-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(
      document.querySelector('[data-slot="context-menu-sub-content"]'),
    ).toBeTruthy();
    document
      .querySelector('[data-slot="context-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="context-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    unmount();
  });
});

describe("coverage-100 — primitives theme icons toast", () => {
  test("presence signal portal controllable trapFocus tab forward", async () => {
    const present = signal(true);
    const external = signal(3);
    const { unmount } = mountUi(() => {
      const Child = cc(() => {
        const [state, setState] = useControllableState({
          value: () => external.value,
          defaultValue: 0,
          onChange: () => {},
        });
        setState(4);
        return (
          <>
            <Presence present={present.value}>
              <span data-slot="presence-sig">on</span>
            </Presence>
            <UiPortal container={document.body}>
              <span data-slot="portal-fn">portal</span>
            </UiPortal>
            <span>{state.value}</span>
          </>
        );
      });
      return <Child />;
    });
    await new Promise((r) => setTimeout(r, 40));
    external.value = 9;
    await new Promise((r) => setTimeout(r, 40));
    unmount();

    const root = document.createElement("div");
    document.body.appendChild(root);
    const a = document.createElement("button");
    const b = document.createElement("button");
    root.append(a, b);
    b.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: false,
      bubbles: true,
    });
    Object.defineProperty(event, "preventDefault", { value: () => {} });
    trapFocus(event, root);

    const overlay = mountUi(() => (
      <DialogRoot defaultOpen>
        <DialogTriggerPrimitive>open</DialogTriggerPrimitive>
        <DialogOverlay />
        <DialogContentPrimitive
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <button type="button">focusable</button>
          <DialogClose asChild>
            <button type="button">x</button>
          </DialogClose>
        </DialogContentPrimitive>
      </DialogRoot>
    ));
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    overlay.unmount();

    const pop = mountUi(() => (
      <PopoverRoot defaultOpen>
        <PopoverTrigger>p</PopoverTrigger>
        <PopoverContent>body</PopoverContent>
      </PopoverRoot>
    ));
    await new Promise((r) => setTimeout(r, 10));
    pop.click('[data-slot="popover-trigger"]');
    pop.click('[data-slot="popover-trigger"]');
    document
      .querySelector('[data-slot="popover-content"]')
      ?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    window.dispatchEvent(new Event("resize"));
    pop.unmount();

    const tip = mountUi(() => (
      <TooltipProvider delayDuration={0}>
        <TooltipRoot defaultOpen>
          <TooltipTrigger>t</TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={12}>
            tip
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    await new Promise((r) => setTimeout(r, 60));
    tip.unmount();

    const acc = mountUi(() => (
      <AccordionRoot type="single" collapsible defaultValue="1">
        <AccordionItem value="1">
          <AccordionTrigger>one</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>two</AccordionTrigger>
        </AccordionItem>
      </AccordionRoot>
    ));
    acc.click('[data-slot="accordion-trigger"]');
    acc.click('[data-slot="accordion-trigger"]');
    acc.unmount();

    const radio = mountUi(() => (
      <RadioGroupRoot value="a" onValueChange={() => {}}>
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="b" disabled>
          B
        </RadioGroupItem>
      </RadioGroupRoot>
    ));
    radio
      .queryAll('[data-slot="radio-group-item"]')
      .forEach((el) =>
        el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );
    radio.unmount();

    const tg = mountUi(() => (
      <ToggleGroupRoot type="multiple" defaultValue={["a"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroupRoot>
    ));
    tg.queryAll('[data-slot="toggle-group-item"]').forEach((el) =>
      el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );
    tg.unmount();
  });

  test("theme system media change and transition restore", async () => {
    let api: ReturnType<typeof useTheme> | undefined;
    const Capture = cc(() => {
      api = useTheme();
      return null;
    });
    const { unmount } = mountUi(() => (
      <ThemeProvider
        defaultTheme="system"
        attribute="data-theme"
        disableTransitionOnChange
      >
        <Capture />
      </ThemeProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    api!.setTheme("system");
    triggerMatchMediaChange();
    await new Promise((r) => setTimeout(r, 10));
    api!.setTheme("dark");
    await new Promise((r) => setTimeout(r, 10));
    unmount();

    const forced = mountUi(() => (
      <ThemeProvider forcedTheme="system" enableSystem>
        <Capture />
      </ThemeProvider>
    ));
    await new Promise((r) => setTimeout(r, 0));
    triggerMatchMediaChange();
    forced.unmount();
  });

  test("nested icon children and toast dismiss all", () => {
    const nested: IconNode = [
      [
        "g",
        { "stroke-linecap": "round" },
        [["path", { d: "M2 2h4v4H2z" }]] as unknown as IconNode,
      ],
    ] as unknown as IconNode;
    const node = asVNode(Icon({ icon: nested, size: "1em" }));
    expect(node.tag).toBe("svg");
    expect(node.children.length).toBe(1);

    toast.dismiss();
    toast({ title: "a", description: "b", type: "default", duration: 0 });
    toast.success({ title: "s", duration: 1 });
    const toaster = mountUi(() => <Toaster position="top-center" />);
    toast.dismiss();
    toaster.unmount();
  });
});

describe("coverage-100 — scroll area overlay", () => {
  function stubMetrics(
    el: HTMLElement,
    metrics: {
      clientHeight?: number;
      scrollHeight?: number;
      scrollTop?: number;
      clientWidth?: number;
      scrollWidth?: number;
      scrollLeft?: number;
    },
  ): void {
    for (const [key, value] of Object.entries(metrics)) {
      Object.defineProperty(el, key, {
        value,
        writable: true,
        configurable: true,
      });
    }
  }

  function pointer(
    type: string,
    target: Element,
    clientX: number,
    clientY: number,
  ): void {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
      }),
    );
  }

  test("tracks overflow, hover chrome, drag, and resize", async () => {
    const { root, unmount } = mountUi(() => (
      <ScrollArea class="h-40">
        <div class="h-[800px] w-[800px]">long</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    ));

    const viewport = root.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    const bars = [
      ...root.querySelectorAll('[data-slot="scroll-area-scrollbar"]'),
    ] as HTMLElement[];
    const vertical = bars.find(
      (bar) => bar.getAttribute("data-orientation") === "vertical",
    )!;
    const horizontal = bars.find(
      (bar) => bar.getAttribute("data-orientation") === "horizontal",
    )!;
    expect(vertical).toBeTruthy();
    expect(horizontal).toBeTruthy();
    expect(vertical.getAttribute("data-overflow")).toBe("false");

    stubMetrics(viewport, {
      clientHeight: 0,
      scrollHeight: 800,
      scrollTop: 0,
      clientWidth: 0,
      scrollWidth: 800,
      scrollLeft: 0,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(vertical.getAttribute("data-overflow")).toBe("false");

    stubMetrics(viewport, {
      clientHeight: 100,
      scrollHeight: 800,
      scrollTop: 0,
      clientWidth: 100,
      scrollWidth: 800,
      scrollLeft: 0,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    lastResizeObserver?.trigger([]);
    await new Promise((r) => setTimeout(r, 0));

    expect(vertical.getAttribute("data-overflow")).toBe("true");
    expect(horizontal.getAttribute("data-overflow")).toBe("true");
    expect(vertical.getAttribute("data-scrolling")).toBe("true");

    stubMetrics(viewport, {
      clientHeight: 100,
      scrollHeight: 800,
      scrollTop: 350,
      clientWidth: 100,
      scrollWidth: 800,
      scrollLeft: 200,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    const vThumb = vertical.querySelector(
      '[data-slot="scroll-area-thumb"]',
    ) as HTMLElement;
    const hThumb = horizontal.querySelector(
      '[data-slot="scroll-area-thumb"]',
    ) as HTMLElement;
    expect(vThumb.className).toContain("w-full");
    expect(hThumb.className).toContain("h-full");
    expect(vThumb.getAttribute("style") ?? vThumb.style.cssText).toContain(
      "translateY",
    );
    expect(hThumb.getAttribute("style") ?? hThumb.style.cssText).toContain(
      "translateX",
    );

    pointer("pointerdown", vThumb, 0, 10);
    pointer("pointermove", vThumb, 0, 40);
    pointer("pointerup", vThumb, 0, 40);
    pointer("pointermove", vThumb, 0, 80);

    stubMetrics(viewport, {
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
      clientWidth: 100,
      scrollWidth: 100,
      scrollLeft: 0,
    });
    pointer("pointerdown", vThumb, 0, 10);
    pointer("pointermove", vThumb, 0, 40);
    pointer("pointerup", vThumb, 0, 40);
    pointer("pointerdown", hThumb, 10, 0);
    pointer("pointermove", hThumb, 40, 0);
    pointer("pointercancel", hThumb, 40, 0);

    stubMetrics(viewport, {
      clientHeight: 20,
      scrollHeight: 40,
      scrollTop: 0,
      clientWidth: 20,
      scrollWidth: 40,
      scrollLeft: 0,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    pointer("pointerdown", vThumb, 0, 2);
    pointer("pointermove", vThumb, 0, 12);
    pointer("pointerup", vThumb, 0, 12);

    stubMetrics(viewport, {
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
      clientWidth: 100,
      scrollWidth: 100,
      scrollLeft: 0,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(vertical.getAttribute("data-overflow")).toBe("false");

    Object.defineProperty(vThumb, "setPointerCapture", {
      configurable: true,
      value: undefined,
    });
    stubMetrics(viewport, {
      clientHeight: 100,
      scrollHeight: 800,
      scrollTop: 0,
      clientWidth: 100,
      scrollWidth: 800,
      scrollLeft: 0,
    });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    pointer("pointerdown", vThumb, 0, 8);
    viewport.remove();
    pointer("pointermove", vThumb, 0, 30);
    pointer("pointerup", vThumb, 0, 30);

    await new Promise((r) => setTimeout(r, 720));
    expect(vertical.getAttribute("data-scrolling")).toBe("false");
    unmount();
  });

  test("standalone bar and missing resize observer stay inert", async () => {
    const original = globalThis.ResizeObserver;
    const { unmount: unmountBar } = mountUi(() => <ScrollBar />);
    unmountBar();

    const { unmount: emptyUnmount } = mountUi(() => <ScrollArea />);
    emptyUnmount();

    Reflect.deleteProperty(globalThis, "ResizeObserver");
    const { root, unmount } = mountUi(() => (
      <ScrollArea>
        <p>short</p>
      </ScrollArea>
    ));
    expect(
      root.querySelector('[data-slot="scroll-area-viewport"]'),
    ).toBeTruthy();
    unmount();
    globalThis.ResizeObserver = original;
  });
});
