import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../src/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../src/components/ui/alert-dialog";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../src/components/ui/alert";
import { AspectRatio } from "../src/components/ui/aspect-ratio";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "../src/components/ui/attachment";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "../src/components/ui/avatar";
import { Badge, badgeVariants } from "../src/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../src/components/ui/breadcrumb";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "../src/components/ui/bubble";
import { Button, buttonVariants } from "../src/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from "../src/components/ui/button-group";
import { Calendar } from "../src/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../src/components/ui/carousel";
import {
  Chart,
  ChartContainer,
  ChartStyle,
  THEMES,
  type EChartsOption,
} from "../src/components/ui/chart";
import { Checkbox } from "../src/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../src/components/ui/collapsible";
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
  useComboboxAnchor,
} from "../src/components/ui/combobox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../src/components/ui/command";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/components/ui/dialog";
import { DirectionProvider, useDirection } from "../src/components/ui/direction";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../src/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../src/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../src/components/ui/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../src/components/ui/hover-card";
import { Input } from "../src/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "../src/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../src/components/ui/input-otp";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "../src/components/ui/item";
import { Kbd, KbdGroup } from "../src/components/ui/kbd";
import { Label } from "../src/components/ui/label";
import { Marker, MarkerContent, MarkerIcon, markerVariants } from "../src/components/ui/marker";
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
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "../src/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "../src/components/ui/message-scroller";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "../src/components/ui/native-select";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "../src/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../src/components/ui/pagination";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../src/components/ui/popover";
import { Progress } from "../src/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../src/components/ui/resizable";
import { ScrollArea, ScrollBar } from "../src/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { Separator } from "../src/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../src/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "../src/components/ui/sidebar";
import { Skeleton } from "../src/components/ui/skeleton";
import { Slider } from "../src/components/ui/slider";
import { Toaster as SonnerToaster, toast as sonnerToast } from "../src/components/ui/sonner";
import { Spinner } from "../src/components/ui/spinner";
import { Switch } from "../src/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/components/ui/table";
import {
  DataTable,
} from "../src/components/ui/data-table";
import { createDataTableColumnHelper } from "../src/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "../src/components/ui/tabs";
import { Textarea } from "../src/components/ui/textarea";
import { Toggle, toggleVariants } from "../src/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../src/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../src/components/ui/tooltip";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => setupDom());
afterEach(() => teardownDom());

describe("components smoke — atoms", () => {
  test("core atoms mount", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <Button>Go</Button>
        <Badge>New</Badge>
        <Label>Name</Label>
        <Separator />
        <Skeleton />
        <Spinner />
        <KbdGroup>
          <Kbd>⌘</Kbd>
        </KbdGroup>
        <Input placeholder="x" />
        <Textarea placeholder="y" />
        <Progress value={40} />
        <AspectRatio ratio={16 / 9}>img</AspectRatio>
        <NativeSelect>
          <NativeSelectOptGroup label="G">
            <NativeSelectOption value="a">A</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </>
    ));
    expect(root.querySelector('[data-slot="button"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="spinner"]')).toBeTruthy();
    expect(buttonVariants({ variant: "outline" })).toContain("border");
    expect(badgeVariants({ variant: "secondary" })).toBeTruthy();
    unmount();
  });

  test("layout atoms mount", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <Alert>
          <AlertTitle>T</AlertTitle>
          <AlertDescription>D</AlertDescription>
          <AlertAction>A</AlertAction>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Desc</CardDescription>
            <CardAction>Act</CardAction>
          </CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Foot</CardFooter>
        </Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>M</EmptyMedia>
            <EmptyTitle>T</EmptyTitle>
            <EmptyDescription>D</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>C</EmptyContent>
        </Empty>
        <ItemGroup>
          <Item>
            <ItemHeader>H</ItemHeader>
            <ItemMedia>M</ItemMedia>
            <ItemContent>
              <ItemTitle>T</ItemTitle>
              <ItemDescription>D</ItemDescription>
            </ItemContent>
            <ItemActions>A</ItemActions>
            <ItemFooter>F</ItemFooter>
          </Item>
        </ItemGroup>
        <ItemSeparator />
        <Marker>
          <MarkerIcon>!</MarkerIcon>
          <MarkerContent>note</MarkerContent>
        </Marker>
        <BubbleGroup>
          <Bubble>
            <BubbleContent>hi</BubbleContent>
            <BubbleReactions>👍</BubbleReactions>
          </Bubble>
        </BubbleGroup>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbEllipsis />
            <BreadcrumbItem>
              <BreadcrumbPage>Here</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Table>
          <TableCaption>cap</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>H</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>C</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>F</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <DataTable
          columns={(() => {
            const nameHelper = createDataTableColumnHelper<{ name: string }>();
            return nameHelper.columns([
              nameHelper.accessor("name", { header: "Name" }),
            ]);
          })()}
          data={[{ name: "Ada" }]}
          hideToolbar
          hidePagination
        />
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <ButtonGroup>
          <Button>1</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>or</ButtonGroupText>
          <Button>2</Button>
        </ButtonGroup>
        <FieldSet>
          <FieldLegend>Legend</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldTitle>Title</FieldTitle>
              <FieldContent>
                <Input />
                <FieldDescription>hint</FieldDescription>
                <FieldError errors={[{ message: "required" }]} />
                <FieldError errors={[{ message: "a" }, { message: "b" }]} />
                <FieldError>child err</FieldError>
                <FieldError />
              </FieldContent>
            </Field>
          </FieldGroup>
          <FieldSeparator>or</FieldSeparator>
          <FieldSeparator />
        </FieldSet>
      </>
    ));
    expect(root.querySelector('[data-slot="card"]')).toBeTruthy();
    expect(markerVariants({ variant: "default" })).toBeTruthy();
    expect(buttonGroupVariants({ orientation: "horizontal" })).toBeTruthy();
    unmount();
  });
});

describe("components smoke — controls", () => {
  test("interactive controls mount", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <Checkbox defaultChecked />
        <Switch />
        <Toggle>Bold</Toggle>
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
        <RadioGroup defaultValue="x">
          <RadioGroupItem value="x">X</RadioGroupItem>
        </RadioGroup>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">panel</TabsContent>
        </Tabs>
        <Accordion defaultValue="1">
          <AccordionItem value="1">
            <AccordionTrigger>Item</AccordionTrigger>
            <AccordionContent>Body</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible defaultOpen>
          <CollapsibleTrigger>T</CollapsibleTrigger>
          <CollapsibleContent class="gap-2">C</CollapsibleContent>
        </Collapsible>
        <Slider defaultValue={30} />
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput />
          <InputGroupButton>Go</InputGroupButton>
          <InputGroupTextarea />
        </InputGroup>
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <Select defaultOpen defaultValue="a">
          <SelectTrigger>
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group</SelectLabel>
              <SelectItem value="a">A</SelectItem>
              <SelectItem value="b">B</SelectItem>
              <SelectSeparator />
            </SelectGroup>
          </SelectContent>
        </Select>
        <Calendar month={new Date(2024, 5, 1)} selected={new Date(2024, 5, 15)} locale="en-US" />
      </>
    ));
    expect(root.querySelector('[data-slot="checkbox"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="input-otp"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="calendar"]')).toBeTruthy();
    expect(
      root.querySelector('[data-slot="collapsible-content"]')?.className,
    ).toContain("animate-collapsible-up");
    expect(toggleVariants({ variant: "outline" })).toBeTruthy();
    expect(tabsListVariants({ variant: "line" })).toBeTruthy();
    unmount();
  });
});

describe("components smoke — overlays", () => {
  test("dialogs sheets drawers popovers", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>T</DialogTitle>
              <DialogDescription>D</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>X</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>T</SheetTitle>
              <SheetDescription>D</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose>X</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>!</AlertDialogMedia>
              <AlertDialogTitle>T</AlertDialogTitle>
              <AlertDialogDescription>D</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Drawer defaultOpen>
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>T</DrawerTitle>
              <DrawerDescription>D</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>X</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <Popover defaultOpen>
          <PopoverTrigger>P</PopoverTrigger>
          <PopoverAnchor>A</PopoverAnchor>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>T</PopoverTitle>
              <PopoverDescription>D</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>T</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <HoverCard defaultOpen>
          <HoverCardTrigger>H</HoverCardTrigger>
          <HoverCardContent>card</HoverCardContent>
        </HoverCard>
      </>
    ));
    expect(root.querySelector('[data-slot="dialog-trigger"]')).toBeTruthy();
    unmount();
  });

  test("menus navigation", () => {
    const { root, unmount } = mountUi(() => (
      <>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>L</DropdownMenuLabel>
                <DropdownMenuItem>Item</DropdownMenuItem>
                <DropdownMenuCheckboxItem checked>Check</DropdownMenuCheckboxItem>
                <DropdownMenuRadioGroup value="a">
                  <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Sub</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger>Right</ContextMenuTrigger>
          <ContextMenuPortal>
            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuLabel>L</ContextMenuLabel>
                <ContextMenuItem>Item</ContextMenuItem>
                <ContextMenuCheckboxItem checked={false}>C</ContextMenuCheckboxItem>
                <ContextMenuRadioGroup value="x">
                  <ContextMenuRadioItem value="x">X</ContextMenuRadioItem>
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
        </Menubar>
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
          <NavigationMenuViewport />
        </NavigationMenu>
      </>
    ));
    expect(root.querySelector('[data-slot="navigation-menu"]') || root.textContent).toBeTruthy();
    expect(navigationMenuTriggerStyle()).toBeTruthy();
    unmount();
  });
});

describe("components smoke — heavy", () => {
  test("command combobox carousel chart resizable", () => {
    let carouselReady = false;
    const chartConfig = {
      sales: { label: "Sales", color: "hsl(220 70% 50%)" },
      themed: { label: "Themed", theme: { light: "#111", dark: "#eee" } },
    };
    const { root, unmount } = mountUi(() => (
      <>
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>None</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem value="calendar">
                Calendar
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandSeparator />
            </CommandGroup>
          </CommandList>
        </Command>
        <CommandDialog defaultOpen>
          <Command>
            <CommandInput />
          </Command>
        </CommandDialog>
        <Combobox defaultOpen>
          <ComboboxTrigger>
            <ComboboxValue placeholder="Pick" />
          </ComboboxTrigger>
          <ComboboxInput showClear placeholder="Type" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty />
              <ComboboxGroup>
                <ComboboxLabel>Opts</ComboboxLabel>
                <ComboboxCollection>
                  <ComboboxItem value="a">Alpha</ComboboxItem>
                </ComboboxCollection>
                <ComboboxSeparator />
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
          <ComboboxChips>
            <ComboboxChip>chip</ComboboxChip>
            <ComboboxChipsInput />
          </ComboboxChips>
        </Combobox>
        <Carousel
          setApi={() => {
            carouselReady = true;
          }}
        >
          <CarouselContent>
            <CarouselItem>1</CarouselItem>
            <CarouselItem>2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <ChartContainer config={chartConfig}>
          <Chart
            option={
              {
                xAxis: { type: "category", data: ["Jan", "Feb"] },
                yAxis: { type: "value" },
                series: [{ type: "bar", name: "sales", data: [10, 20] }],
              } satisfies EChartsOption
            }
            renderer="svg"
            style={{ width: "240px", height: "120px" }}
          />
          <ChartStyle id="empty" config={{}} />
        </ChartContainer>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={40}>A</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>B</ResizablePanel>
        </ResizablePanelGroup>
      </>
    ));
    expect(carouselReady).toBe(true);
    expect(root.querySelector('[data-slot="command"]')).toBeTruthy();
    expect(root.querySelector('[data-slot="chart"]')).toBeTruthy();
    expect(THEMES.light).toBe("");
    withSetup(() => {
      expect(typeof useComboboxAnchor()).toBe("object");
    });
    unmount();
  });

  test("sidebar avatar scroll attachment message sonner", () => {
    let sidebarApiOk = false;
    const Capture = () => {
      const api = useSidebar();
      sidebarApiOk = typeof api.toggleSidebar === "function";
      return null;
    };
    const { root, unmount } = mountUi(() => (
      <>
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="none">
            <SidebarHeader>H</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>G</SidebarGroupLabel>
                <SidebarGroupAction>+</SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Home</SidebarMenuButton>
                      <SidebarMenuAction>…</SidebarMenuAction>
                      <SidebarMenuBadge>1</SidebarMenuBadge>
                      <SidebarMenuSkeleton />
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Sub</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>F</SidebarFooter>
            <SidebarSeparator />
            <SidebarRail />
          </Sidebar>
          <Sidebar variant="floating" collapsible="icon">
            <SidebarMenuButton tooltip="Tip">With tip</SidebarMenuButton>
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
            <SidebarInput placeholder="search" />
          </SidebarInset>
          <Capture />
        </SidebarProvider>
        <Avatar>
          <AvatarImage src="https://example.test/a.png" />
          <AvatarFallback>AB</AvatarFallback>
          <AvatarBadge>!</AvatarBadge>
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
        <ScrollArea>
          long content
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <AttachmentGroup>
          <Attachment>
            <AttachmentMedia>📄</AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>file.pdf</AttachmentTitle>
              <AttachmentDescription>1kb</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction>X</AttachmentAction>
            </AttachmentActions>
            <AttachmentTrigger>Open</AttachmentTrigger>
          </Attachment>
        </AttachmentGroup>
        <MessageGroup>
          <Message>
            <MessageAvatar>U</MessageAvatar>
            <MessageHeader>Name</MessageHeader>
            <MessageContent>Hello</MessageContent>
            <MessageFooter>now</MessageFooter>
          </Message>
        </MessageGroup>
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem>msg</MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton>↓</MessageScrollerButton>
          </MessageScroller>
        </MessageScrollerProvider>
        <SonnerToaster />
        <DirectionProvider dir="rtl">
          {(() => {
            const Child = () => <span data-slot="dir-child">{useDirection()}</span>;
            return <Child />;
          })()}
        </DirectionProvider>
      </>
    ));
    expect(sidebarApiOk).toBe(true);
    expect(
      root.querySelector('[data-slot="sidebar"]') ||
        root.querySelector('[data-slot="sidebar-trigger"]'),
    ).toBeTruthy();
    expect(root.querySelector('[data-slot="dir-child"]')?.textContent).toBe(
      "rtl",
    );
    expect(typeof sonnerToast).toBe("function");
    expect(() => withSetup(() => useMessageScroller())).toThrow();
    unmount();
  });
});
