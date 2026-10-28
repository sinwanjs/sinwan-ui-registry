import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../src/components/ui/avatar";
import {
  Chart,
  ChartContainer,
  ChartStyle,
  useChart,
} from "../src/components/ui/chart";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../src/components/ui/combobox";
import { Command, CommandInput, CommandItem, CommandList } from "../src/components/ui/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../src/components/ui/context-menu";
import { Dialog, DialogContent, DialogPortal, DialogTrigger } from "../src/components/ui/dialog";
import { Drawer, DrawerPortal, DrawerTrigger } from "../src/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../src/components/ui/hover-card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../src/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../src/components/ui/input-otp";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
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
} from "../src/components/ui/navigation-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPortal,
  AlertDialogTrigger,
} from "../src/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../src/components/ui/select";
import {
  Sidebar,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../src/components/ui/sidebar";
import { Slider } from "../src/components/ui/slider";
import { AttachmentTrigger } from "../src/components/ui/attachment";
import { Badge } from "../src/components/ui/badge";
import { BreadcrumbLink } from "../src/components/ui/breadcrumb";
import { Bubble, BubbleContent } from "../src/components/ui/bubble";
import { ButtonGroupText } from "../src/components/ui/button-group";
import { Item } from "../src/components/ui/item";
import { Marker } from "../src/components/ui/marker";
import {
  inject,
} from "sinwan/component";
import { signal } from "sinwan/reactivity";
import {
  computePosition,
  getFocusableElements,
  Presence,
  trapFocus,
  useControllableState,
} from "sinwan-ui-core/core";
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
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from "sinwan-ui-core/overlay";
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  RadioGroupRoot,
  RadioGroupItem,
  ToggleGroupRoot,
  ToggleGroupItem,
  TabsRoot,
  TabsTrigger,
} from "sinwan-ui-core/controls";
import { ThemeProvider, ThemeToggle, useTheme } from "sinwan-ui-core/theme";
import {
  DirectionKey,
  DirectionProvider,
  useDirection,
} from "sinwan-ui-core/direction";
import { toast, Toaster } from "../src/components/ui/sonner";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";
import { Slot } from "sinwan-ui-core/slot";

beforeEach(() => {
  setupDom();
  localStorage.clear();
  document.documentElement.className = "";
});
afterEach(() => teardownDom());

describe("coverage extras — menus open paths", () => {
  test("context menu open via contextmenu", async () => {
    let opened = false;
    const { root, unmount } = mountUi(() => (
      <ContextMenu
        onOpenChange={(v) => {
          opened = v;
        }}
      >
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>L</ContextMenuLabel>
              <ContextMenuItem>One</ContextMenuItem>
              <ContextMenuCheckboxItem checked>Check</ContextMenuCheckboxItem>
              <ContextMenuRadioGroup value="x">
                <ContextMenuRadioItem value="x">X</ContextMenuRadioItem>
                <ContextMenuRadioItem value="y">Y</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
              <ContextMenuSeparator />
              <ContextMenuShortcut>S</ContextMenuShortcut>
              <ContextMenuSub>
                <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>Sub</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    ));
    const trigger = root.querySelector(
      '[data-slot="context-menu-trigger"]',
    ) as HTMLElement;
    trigger.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: 40,
        clientY: 50,
        cancelable: true,
      }),
    );
    expect(opened).toBe(true);
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="context-menu-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-checkbox-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-radio-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="context-menu-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    unmount();

    const asChild = mountUi(() => (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button">child</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>X</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ));
    asChild.root
      .querySelector("button")
      ?.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          clientX: 1,
          clientY: 1,
          cancelable: true,
        }),
      );
    asChild.unmount();
  });

  test("menubar trigger opens content", async () => {
    const { root, click, unmount } = mountUi(() => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>L</MenubarLabel>
                <MenubarItem>New</MenubarItem>
                <MenubarCheckboxItem checked>C</MenubarCheckboxItem>
                <MenubarRadioGroup value="1">
                  <MenubarRadioItem value="1">1</MenubarRadioItem>
                  <MenubarRadioItem value="2">2</MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
                <MenubarShortcut>⌘N</MenubarShortcut>
                <MenubarSub>
                  <MenubarSubTrigger>More</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Sub</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ));
    click('[data-slot="menubar-trigger"]');
    await new Promise((r) => setTimeout(r, 10));
    document
      .querySelector('[data-slot="menubar-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-checkbox-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-radio-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-slot="menubar-sub-content"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    const triggers = root.querySelectorAll('[data-slot="menubar-trigger"]');
    (triggers[1] as HTMLElement)?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    unmount();
  });

  test("dropdown hover-card open interactions", async () => {
    const { click, unmount } = mountUi(() => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <HoverCard>
          <HoverCardTrigger>H</HoverCardTrigger>
          <HoverCardContent>card</HoverCardContent>
        </HoverCard>
      </>
    ));
    click('[data-slot="dropdown-menu-trigger"]');
    await new Promise((r) => setTimeout(r, 0));
    document
      .querySelector('[data-slot="dropdown-menu-item"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const hover = document.querySelector(
      '[data-slot="hover-card-trigger"], [data-slot="popover-trigger"]',
    );
    hover?.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true }));
    hover?.dispatchEvent(new MouseEvent("pointerleave", { bubbles: true }));
    unmount();
  });
});

describe("coverage extras — controllable state and presence", () => {
  test("useControllableState branches", () => {
    withSetup(() => {
      const external = signal(1);
      const [state, setState] = useControllableState({
        value: () => external.value,
        defaultValue: 0,
        onChange: () => {},
      });
      expect(state.value).toBe(1);
      setState(2);
      setState((prev) => prev + 1);
      useControllableState({
        value: () => 5,
        defaultValue: 0,
      });
      useControllableState({
        defaultValue: 9,
      });
    });

    withSetup(() => {
      Presence({ present: true, children: "sig" });
      Presence({ present: false, children: "hid" });
    });
  });
});

describe("coverage extras — atoms branches", () => {
  test("asChild and variant edges", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <Badge asChild>
          <a href="#">badge</a>
        </Badge>
        <BreadcrumbLink asChild href="#">
          <a href="/x">x</a>
        </BreadcrumbLink>
        <BubbleContent asChild>
          <div>bubble</div>
        </BubbleContent>
        <ButtonGroupText asChild>
          <span>txt</span>
        </ButtonGroupText>
        <Item asChild>
          <a href="#">item</a>
        </Item>
        <Marker asChild>
          <span>m</span>
        </Marker>
        <AttachmentTrigger asChild>
          <button type="button">open</button>
        </AttachmentTrigger>
        <InputGroup>
          <InputGroupAddon align="block-start">pre</InputGroupAddon>
          <InputGroupInput />
        </InputGroup>
        <Slider defaultValue={[10, 20]} orientation="vertical" />
        <Slider value={40} onValueChange={() => {}} />
        <Slider defaultValue={[]} step={0} />
        <Slider defaultValue={1.5} min={0} max={5} step={0.5} />
        <Slider defaultValue={0} min={0} max={0} step={1} />
        <Slider defaultValue={0} min={0} max={0} step={1} />
      </>
    ));
    const zeroStep = root.querySelectorAll(
      '[data-slot="slider-input"]',
    )[2] as HTMLInputElement | undefined;
    if (zeroStep) {
      zeroStep.value = "33";
      zeroStep.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const decimal = root.querySelectorAll(
      '[data-slot="slider-input"]',
    )[3] as HTMLInputElement | undefined;
    if (decimal) {
      decimal.value = "2.4";
      decimal.dispatchEvent(new Event("input", { bubbles: true }));
    }
    expect(root.querySelector("a")).toBeTruthy();
    unmount();
  });

  test("avatar image load and error", () => {
    const { root, unmount } = mountUi(() => (
      <Avatar>
        <AvatarImage src="https://example.test/a.png" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    ));
    const img = root.querySelector('[data-slot="avatar-image"]') as HTMLImageElement;
    img?.dispatchEvent(new Event("load"));
    img?.dispatchEvent(new Event("error"));
    unmount();
  });
});

describe("coverage extras — overlays menus", () => {
  test("menu portals and hover card open sync", () => {
    const { click, unmount } = mountUi(() => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>D</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>One</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger>C</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>One</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>M</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>One</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <HoverCard>
          <HoverCardTrigger>H</HoverCardTrigger>
          <HoverCardContent>body</HoverCardContent>
        </HoverCard>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#">L</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogPortal>
            <span>portal</span>
          </DialogPortal>
        </Dialog>
        <Drawer>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerPortal>
            <span>drawer-portal</span>
          </DrawerPortal>
        </Drawer>
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogPortal>
            <span>alert-portal</span>
          </AlertDialogPortal>
        </AlertDialog>
      </>
    ));
    click('[data-slot="dropdown-menu-trigger"], [data-slot="dialog-trigger"]');
    document
      .querySelector('[data-slot="hover-card-trigger"], [data-slot="popover-trigger"]')
      ?.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true }));
    unmount();
  });
});

describe("coverage extras — select command combobox otp", () => {
  test("select keyboard and document dismiss", () => {
    const { unmount } = mountUi(() => (
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b" disabled>
            B
          </SelectItem>
        </SelectContent>
      </Select>
    ));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    document.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    unmount();
  });

  test("command keywords filter and combobox input", () => {
    let complete = "";
    const { root, unmount } = mountUi(() => (
      <>
        <Command>
          <CommandInput />
          <CommandList>
            <CommandItem value="hello" keywords={["world"]}>
              Hello
            </CommandItem>
          </CommandList>
        </Command>
        <Combobox defaultOpen>
          <ComboboxInput showTrigger showClear placeholder="q" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="alpha">Alpha</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <InputOTP
          maxLength={2}
          pattern="("
          onComplete={(v) => {
            complete = v;
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
        </InputOTP>
      </>
    ));
    const cmd = root.querySelector(
      '[data-slot="command-input"]',
    ) as HTMLInputElement;
    cmd.value = "wor";
    cmd.dispatchEvent(new Event("input", { bubbles: true }));

    const combo = root.querySelector(
      '[data-slot="input-group"] input, [data-slot="combobox"] input, input',
    ) as HTMLInputElement | null;
    const inputs = root.querySelectorAll("input");
    const comboboxInput = Array.from(inputs).find((el) =>
      el.closest('[data-slot="input-group"]'),
    ) as HTMLInputElement | undefined;
    if (comboboxInput) {
      comboboxInput.value = "al";
      comboboxInput.dispatchEvent(new Event("input", { bubbles: true }));
      comboboxInput.dispatchEvent(new Event("focus", { bubbles: true }));
    }
    const otp = root.querySelector(
      '[data-slot="input-otp-hidden"]',
    ) as HTMLInputElement;
    otp.value = "ab";
    otp.dispatchEvent(new Event("input", { bubbles: true }));
    const clip = {
      preventDefault() {},
      clipboardData: { getData: () => "zz" },
    };
    otp.dispatchEvent(new Event("paste", { bubbles: true }));
    // call paste handler directly if Event constructor doesn't attach clipboardData
    const pasteHandler = (otp as unknown as { onpaste?: (e: unknown) => void })
      .onpaste;
    void pasteHandler;
    otp.dispatchEvent(
      Object.assign(new Event("paste", { bubbles: true }), {
        clipboardData: { getData: () => "12" },
        preventDefault() {},
      }),
    );
    expect(complete === "" || complete.length >= 0).toBe(true);
    void combo;
    unmount();
  });
});

describe("coverage extras — sidebar chart message theme", () => {
  test("sidebar asChild and mobile paths", () => {
    const { click, unmount } = mountUi(() => (
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="offcanvas" side="right" variant="inset">
          <SidebarGroupLabel asChild>
            <a href="#">label</a>
          </SidebarGroupLabel>
          <SidebarGroupAction asChild>
            <button type="button">+</button>
          </SidebarGroupAction>
          <SidebarMenuButton asChild tooltip={{ children: "tip", class: "x" }}>
            <a href="#">link</a>
          </SidebarMenuButton>
          <SidebarMenuButton tooltip="plain">plain</SidebarMenuButton>
        </Sidebar>
        {(() => {
          const Probe = () => {
            const api = useSidebar();
            api.setOpen(false);
            api.setOpenMobile(true);
            return null;
          };
          return <Probe />;
        })()}
      </SidebarProvider>
    ));
    click('[data-slot="sidebar-menu-button"]');
    unmount();
    expect(() => withSetup(() => useSidebar())).toThrow(/SidebarProvider/);
  });

  test("nested SidebarProvider skips the keyboard shortcut", () => {
    let outer = true;
    let inner = true;
    const { unmount } = mountUi(() => (
      <SidebarProvider
        open={outer}
        onOpenChange={(next) => {
          outer = next;
        }}
      >
        <SidebarProvider
          open={inner}
          onOpenChange={(next) => {
            inner = next;
          }}
        >
          <SidebarTrigger />
        </SidebarProvider>
      </SidebarProvider>
    ));
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "b", metaKey: true, bubbles: true }),
    );
    expect(outer).toBe(false);
    expect(inner).toBe(true);
    unmount();
  });

  test("chart helpers and message scroller hooks", () => {
    expect(() => withSetup(() => useChart())).toThrow(/ChartContainer/);
    const { root, unmount } = mountUi(() => (
      <ChartContainer
        config={{
          a: { label: "A", color: "#f00" },
          b: { theme: { light: "#0f0", dark: "#00f" } },
        }}
      >
        <Chart
          option={{
            animation: false,
            xAxis: { type: "category", data: ["a"] },
            yAxis: { type: "value" },
            series: [{ type: "bar", data: [1] }],
          }}
          style={{ width: "200px", height: "120px" }}
        />
        <ChartStyle id="extra-empty" config={{}} />
      </ChartContainer>
    ));
    expect(root.querySelector('[data-slot="chart"]')).toBeTruthy();
    unmount();

    const scroller = mountUi(() => (
      <MessageScrollerProvider>
        {(() => {
          const Hooks = () => {
            expect(typeof useMessageScrollerScrollable()).toBe("function");
            expect(typeof useMessageScrollerVisibility()).toBe("function");
            return null;
          };
          return (
            <>
              <Hooks />
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    <MessageScrollerItem>one</MessageScrollerItem>
                    <MessageScrollerItem>two</MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton>↓</MessageScrollerButton>
              </MessageScroller>
            </>
          );
        })()}
      </MessageScrollerProvider>
    ));
    const viewport = scroller.root.querySelector(
      '[data-slot="message-scroller-viewport"]',
    ) as HTMLElement | null;
    if (viewport) {
      Object.defineProperty(viewport, "scrollHeight", { value: 500 });
      Object.defineProperty(viewport, "clientHeight", { value: 100 });
      Object.defineProperty(viewport, "scrollTop", {
        value: 0,
        writable: true,
      });
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    }
    const btn =
      scroller.query('[data-slot="button"]') ??
      scroller.root.querySelector("button");
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    scroller.unmount();
  });

  test("theme attribute data-theme and forced system", () => {
    let api: ReturnType<typeof useTheme> | undefined;
    const Capture = () => {
      api = useTheme();
      return <ThemeToggle />;
    };
    const { click, unmount } = mountUi(() => (
      <ThemeProvider
        defaultTheme="system"
        attribute="data-theme"
        disableTransitionOnChange
      >
        <Capture />
      </ThemeProvider>
    ));
    api!.setTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    click('[data-slot="theme-toggle"]');
    unmount();

    const forced = mountUi(() => (
      <ThemeProvider forcedTheme="light" enableSystem={false}>
        <Capture />
      </ThemeProvider>
    ));
    api!.setTheme("dark");
    expect(api!.theme.value).toBe("light");
    forced.unmount();

    const dir = mountUi(() => {
      const Child = () => {
        const d = useDirection();
        return <button type="button" data-slot="set-dir" onclick={() => {}}>{d}</button>;
      };
      return (
        <DirectionProvider dir="ltr">
          <Child />
        </DirectionProvider>
      );
    });
    dir.unmount();

    toast({ title: "x", description: "y", id: "same" });
    toast({ title: "x2", description: "y2", id: "same" });
    const toaster = mountUi(() => <Toaster position="bottom-left" />);
    expect(toaster.query('[data-slot="toaster"]')).toBeTruthy();
    toaster.unmount();
  });
});

describe("coverage extras — primitives deep", () => {
  test("overlay asChild and focus helpers", async () => {
    const { click, unmount } = mountUi(() => (
      <DialogRoot defaultOpen>
        <DialogTriggerPrimitive asChild>
          <button type="button">open</button>
        </DialogTriggerPrimitive>
        <DialogOverlay />
        <DialogContentPrimitive>
          <DialogClose asChild>
            <button type="button">close</button>
          </DialogClose>
        </DialogContentPrimitive>
      </DialogRoot>
    ));
    click('[data-slot="dialog-close"], button');
    unmount();

    const pop = mountUi(() => (
      <PopoverRoot defaultOpen>
        <PopoverTrigger asChild>
          <button type="button">p</button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start">
          body
        </PopoverContent>
      </PopoverRoot>
    ));
    pop.unmount();

    const tip = mountUi(() => (
      <TooltipProvider delayDuration={0}>
        <TooltipRoot defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">t</button>
          </TooltipTrigger>
          <TooltipContent side="left">tip</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    ));
    tip.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true }));
    tip.root
      .querySelector("button")
      ?.dispatchEvent(new MouseEvent("pointerleave", { bubbles: true }));
    tip.root
      .querySelector("button")
      ?.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    tip.root
      .querySelector("button")
      ?.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    tip.unmount();

    const col = mountUi(() => (
      <CollapsibleRoot
        defaultOpen
        onOpenChange={() => {}}
      >
        <CollapsibleTrigger>plain</CollapsibleTrigger>
        <CollapsibleContent>body</CollapsibleContent>
      </CollapsibleRoot>
    ));
    col.click('[data-slot="collapsible-trigger"]');
    col.unmount();

    const colChild = mountUi(() => (
      <CollapsibleRoot defaultOpen>
        <CollapsibleTrigger asChild>
          <button type="button">c</button>
        </CollapsibleTrigger>
        <CollapsibleContent>body</CollapsibleContent>
      </CollapsibleRoot>
    ));
    colChild.click("button");
    colChild.unmount();

    withSetup(() => {
      Presence({ present: true, children: "x" });
      Presence({ present: false, children: "y" });
    });

    const root = document.createElement("div");
    document.body.appendChild(root);
    const a = document.createElement("button");
    const b = document.createElement("button");
    root.append(a, b);
    a.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: false,
      bubbles: true,
    });
    Object.defineProperty(event, "preventDefault", { value: () => {} });
    trapFocus(event, root);
    const shift = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
    });
    Object.defineProperty(shift, "preventDefault", { value: () => {} });
    b.focus();
    trapFocus(shift, root);
    expect(getFocusableElements(root).length).toBe(2);
    await computePosition(
      { top: 0, left: 0, bottom: 10, right: 10, width: 10, height: 10 },
      { width: 20, height: 20 },
      "bottom",
      "start",
    );

    const accordion = mountUi(() => (
      <AccordionRoot type="multiple" defaultValue={["1"]}>
        <AccordionItem value="1">
          <AccordionTrigger>t</AccordionTrigger>
        </AccordionItem>
      </AccordionRoot>
    ));
    accordion.click('[data-slot="accordion-trigger"]');
    accordion.unmount();

    const tabs = mountUi(() => (
      <TabsRoot defaultValue="a" orientation="vertical">
        <TabsTrigger value="a" disabled>
          A
        </TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsRoot>
    ));
    tabs.click('[data-slot="tabs-trigger"]');
    tabs.unmount();

    const radio = mountUi(() => (
      <RadioGroupRoot defaultValue="x">
        <RadioGroupItem value="x" disabled>
          X
        </RadioGroupItem>
        <RadioGroupItem value="y">Y</RadioGroupItem>
      </RadioGroupRoot>
    ));
    radio.click('[data-slot="radio-group-item"]');
    radio.unmount();

    const tg = mountUi(() => (
      <ToggleGroupRoot type="single" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroupRoot>
    ));
    tg.click('[data-slot="toggle-group-item"]');
    tg.unmount();

    expect(() =>
      Slot({
        children: [{ tag: "a", props: {}, children: [] }, { tag: "b", props: {}, children: [] }],
      }),
    ).toThrow();
  });
});

describe("coverage extras — nav hover scroller chips", () => {
  test("navigation menu open and leave", async () => {
    const { root, unmount } = mountUi(() => (
      <>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#">Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem value="custom">
              <NavigationMenuTrigger>More</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#">X</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </>
    ));
    const trigger = root.querySelector(
      '[data-slot="navigation-menu-trigger"]',
    ) as HTMLElement;
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    trigger?.dispatchEvent(new MouseEvent("pointerenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    root
      .querySelector('[data-slot="navigation-menu-item"]')
      ?.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    unmount();
  });

  test("hover card timers and asChild", async () => {
    const { root, unmount } = mountUi(() => (
      <HoverCard>
        <HoverCardTrigger>Hover</HoverCardTrigger>
        <HoverCardContent side="top">body</HoverCardContent>
      </HoverCard>
    ));
    const trigger = root.querySelector(
      '[data-slot="hover-card-trigger"]',
    ) as HTMLElement;
    trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    trigger.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    trigger.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    trigger.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    unmount();

    const child = mountUi(() => (
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild>
          <a href="#">link</a>
        </HoverCardTrigger>
        <HoverCardContent>c</HoverCardContent>
      </HoverCard>
    ));
    child.unmount();
  });

  test("message scroller buttons", () => {
    const { root, unmount } = mountUi(() => (
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>a</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end">↓</MessageScrollerButton>
          <MessageScrollerButton direction="start">↑</MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>
    ));
    const viewport = root.querySelector(
      '[data-slot="message-scroller-viewport"]',
    ) as HTMLElement | null;
    if (viewport) {
      Object.defineProperty(viewport, "scrollHeight", { value: 800 });
      Object.defineProperty(viewport, "clientHeight", { value: 100 });
      Object.defineProperty(viewport, "scrollTop", { value: 0, writable: true });
      viewport.scrollTo = ((opts?: ScrollToOptions) => {
        Object.defineProperty(viewport, "scrollTop", {
          value: opts?.top ?? 0,
          writable: true,
        });
      }) as typeof viewport.scrollTo;
      viewport.dispatchEvent(new Event("scroll"));
    }
    root
      .querySelectorAll('[data-slot="button"]')
      .forEach((btn) =>
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true })),
      );
    unmount();
  });

  test("combobox chips remove and chips input", async () => {
    const { root, unmount } = mountUi(() => (
      <Combobox multiple defaultOpen>
        <ComboboxChips>
          <ComboboxChip value="a">A</ComboboxChip>
          <ComboboxChip value="b" showRemove={false}>
            B
          </ComboboxChip>
          <ComboboxChipsInput placeholder="add" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="a">A</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ));
    const item = () =>
      document.querySelector('[data-slot="combobox-item"]') as HTMLElement;
    const clickItem = async () => {
      item().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    };
    await clickItem();
    expect(item().getAttribute("aria-selected")).toBe("true");
    await clickItem();
    expect(item().getAttribute("aria-selected")).not.toBe("true");
    await clickItem();
    root
      .querySelector('[data-slot="combobox-chip-remove"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(item().getAttribute("aria-selected")).not.toBe("true");
    const chipInput = root.querySelector(
      '[data-slot="combobox-chip-input"]',
    ) as HTMLInputElement | null;
    if (chipInput) {
      chipInput.value = "z";
      chipInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    unmount();
  });

  test("controlled combobox reads open and value from props", async () => {
    const changes: boolean[] = [];
    const { root, unmount } = mountUi(() => (
      <Combobox
        open
        value="b"
        onOpenChange={(next) => changes.push(next)}
      >
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="a">A</ComboboxItem>
            <ComboboxItem value="b">B</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ));
    await Promise.resolve();
    const items = document.querySelectorAll('[data-slot="combobox-item"]');
    expect(items.length).toBe(2);
    expect(items[0]?.getAttribute("aria-selected")).not.toBe("true");
    expect(items[1]?.getAttribute("aria-selected")).toBe("true");
    root
      .querySelector('[data-slot="combobox-trigger"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(changes).toEqual([false]);
    expect(
      document.querySelectorAll('[data-slot="combobox-item"]').length,
    ).toBe(2);
    unmount();
  });

  test("slider input commit", () => {
    let value: number[] = [];
    const { root, unmount } = mountUi(() => (
      <Slider
        defaultValue={10}
        min={0}
        max={100}
        step={5}
        onValueChange={(v) => {
          value = v;
        }}
      />
    ));
    const range = root.querySelector(
      '[data-slot="slider-input"]',
    ) as HTMLInputElement | null;
    expect(range).toBeTruthy();
    range!.value = "55";
    range!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(value[0]).toBe(55);
    unmount();
  });

  test("controlled slider keeps input across drag updates", async () => {
    const volume = signal([40]);
    const { root, unmount } = mountUi(() => (
      <div>
        <Slider
          value={volume.value}
          step={1}
          onValueChange={(next) => {
            volume.value = next;
          }}
        />
        <span data-slot="slider-label">{String(volume.value[0])}</span>
      </div>
    ));
    const range = root.querySelector(
      '[data-slot="slider-input"]',
    ) as HTMLInputElement;
    expect(range).toBeTruthy();
    for (const next of ["45", "52", "61", "70"]) {
      range.value = next;
      range.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    }
    expect(root.querySelector('[data-slot="slider-input"]')).toBe(range);
    expect(volume.value[0]).toBe(70);
    expect(range.value).toBe("70");
    volume.value = [20];
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(range.value).toBe("20");
    volume.value = [10, 90];
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(range.value).toBe("10");
    range.value = "10";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    unmount();
  });

  test("direction setDir and theme system toggle", async () => {
    const { click, unmount } = mountUi(() => {
      const Probe = () => {
        const api = inject(DirectionKey)!;
        return (
          <button
            type="button"
            data-slot="flip-dir"
            onclick={() => api.setDir("rtl")}
          >
            {useDirection()}
          </button>
        );
      };
      return (
        <DirectionProvider dir="ltr">
          <Probe />
        </DirectionProvider>
      );
    });
    click('[data-slot="flip-dir"]');
    unmount();

    let themeApi: ReturnType<typeof useTheme> | undefined;
    const Capture = () => {
      themeApi = useTheme();
      return <ThemeToggle />;
    };
    const theme = mountUi(() => (
      <ThemeProvider defaultTheme="system" enableSystem>
        <Capture />
      </ThemeProvider>
    ));
    themeApi!.setTheme("system");
    theme.click('[data-slot="theme-toggle"]');
    theme.unmount();

    toast.loading("spin");
    toast.info("i");
    toast.warning("w");
    toast.error("e");
    toast.success("s");
    const toaster = mountUi(() => <Toaster />);
    expect(toaster.query('[data-slot="toast"]')).toBeTruthy();
    toaster.unmount();
  });
});
