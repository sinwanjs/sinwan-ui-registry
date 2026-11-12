import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { SinwanNode } from "sinwan/component";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "../src/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../src/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "../src/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../src/components/ui/sheet";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => setupDom());
afterEach(() => teardownDom());

const tick = () => Promise.resolve();

const KINDS: { kind: string; role: string; ui: () => SinwanNode }[] = [
  {
    kind: "dialog",
    role: "dialog",
    ui: () => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Notification settings</DialogTitle>
          <DialogDescription>Choose where each kind reaches you.</DialogDescription>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    kind: "alert-dialog",
    role: "alertdialog",
    ui: () => (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>You've reached a plan limit</AlertDialogTitle>
          <AlertDialogDescription>5 of 5 branches used.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    kind: "sheet",
    role: "dialog",
    ui: () => (
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list.</SheetDescription>
        </SheetContent>
      </Sheet>
    ),
  },
  {
    kind: "drawer",
    role: "dialog",
    ui: () => (
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Cart</DrawerTitle>
          <DrawerDescription>Three items.</DrawerDescription>
        </DrawerContent>
      </Drawer>
    ),
  },
];

describe("dialogs are named by their title", () => {
  for (const { kind, role, ui } of KINDS) {
    test(`${kind}: role, aria-labelledby and aria-describedby point at its title and description`, async () => {
      const { query, unmount } = mountUi(ui);
      await tick();
      const content = query(`[data-slot="${kind}-content"]`);
      const title = query(`[data-slot="${kind}-title"]`);
      const description = query(`[data-slot="${kind}-description"]`);
      expect(content?.getAttribute("role")).toBe(role);
      expect(title?.id).toBeTruthy();
      expect(content?.getAttribute("aria-labelledby")).toBe(title?.id ?? "");
      expect(content?.getAttribute("aria-describedby")).toBe(description?.id ?? "");
      expect([title?.tagName, description?.tagName]).toEqual(["H2", "P"]);
      unmount();
    });
  }
});
