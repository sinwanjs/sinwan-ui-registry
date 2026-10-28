import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { RowData } from "@tanstack/table-core";
import { cc } from "sinwan/component";

import {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
  DataTableSelectAll,
  DataTableSelectRow,
  useDataTable,
  type DataTableReturn,
} from "../src/components/ui/data-table";
import { mountUi, setupDom, teardownDom } from "./helpers";

type Payment = {
  id: string;
  email: string;
};

const helper = createDataTableColumnHelper<Payment>();

const payments: Payment[] = Array.from({ length: 12 }, (_, index) => ({
  id: `id-${index}`,
  email: `user${String(index).padStart(2, "0")}@mail.test`,
}));

const columns = helper.columns([
  helper.display({
    id: "select",
    header: ({ table }) => <DataTableSelectAll table={table} />,
    cell: ({ row }) => <DataTableSelectRow row={row} />,
    enableSorting: false,
    enableHiding: false,
  }),
  helper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    filterFn: "includesString",
    sortFn: "text",
  }),
]);

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((r) => setTimeout(r, 20));
}

function emailTrigger(root: ParentNode): Element {
  const match = Array.from(
    root.querySelectorAll('[data-slot="dropdown-menu-trigger"]'),
  ).find((node) => node.textContent?.includes("Email"));
  if (!match) throw new Error("missing Email trigger");
  return match;
}

function sortIcon(root: ParentNode): string {
  return emailTrigger(root).querySelector("svg")?.innerHTML ?? "";
}

async function sortBy(root: ParentNode, label: "Asc" | "Desc"): Promise<void> {
  emailTrigger(root).dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await flush();
  const item = Array.from(
    document.querySelectorAll('[data-slot="dropdown-menu-item"]'),
  ).find((node) => node.textContent?.includes(label));
  if (!item) throw new Error(`missing menu item ${label}`);
  item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await flush();
}

beforeEach(() => setupDom());
afterEach(() => teardownDom());

describe("data-table hooks", () => {
  test("column header sort icon follows the sorted direction", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable columns={columns} data={payments} getRowId={(row) => row.id} />
    ));

    const unsorted = sortIcon(root);
    await sortBy(root, "Asc");
    const ascending = sortIcon(root);
    expect(ascending).not.toBe(unsorted);
    expect(root.querySelector('[data-slot="table-body"] [data-column-id="email"]')?.textContent).toBe(
      "user00@mail.test",
    );

    await sortBy(root, "Desc");
    const descending = sortIcon(root);
    expect(descending).not.toBe(ascending);
    expect(descending).not.toBe(unsorted);
    expect(root.querySelector('[data-slot="table-body"] [data-column-id="email"]')?.textContent).toBe(
      "user11@mail.test",
    );
    unmount();
  });

  test("row selection updates the row state and the row checkbox", async () => {
    const { root, click, unmount } = mountUi(() => (
      <DataTable columns={columns} data={payments} getRowId={(row) => row.id} />
    ));

    const firstRow = root.querySelector('[data-slot="table-body"] [data-slot="table-row"]');
    const rowBox = root.querySelector('button[aria-label="Select row"]');
    expect(firstRow?.getAttribute("data-state")).toBeNull();
    expect(rowBox?.getAttribute("data-state")).toBe("unchecked");

    click('button[aria-label="Select row"]');
    await flush();
    expect(firstRow?.getAttribute("data-state")).toBe("selected");
    expect(rowBox?.getAttribute("data-state")).toBe("checked");

    click('button[aria-label="Select row"]');
    await flush();
    expect(firstRow?.getAttribute("data-state")).toBeNull();
    expect(rowBox?.getAttribute("data-state")).toBe("unchecked");
    unmount();
  });

  test("pagination status, buttons, and page size follow the table state", async () => {
    const { root, click, unmount } = mountUi(() => (
      <DataTable columns={columns} data={payments} pageSizes={[5, 10]} />
    ));

    const status = () =>
      root.querySelector('[data-slot="data-table-page-status"]')?.textContent;
    const button = (slot: string) =>
      root.querySelector(`[data-slot="${slot}"]`) as HTMLButtonElement;
    const pageSize = () =>
      root.querySelector('[data-slot="data-table-page-size"]') as HTMLSelectElement;

    expect(status()).toBe("Page 1 of 2");
    expect(button("data-table-previous-page").disabled).toBe(true);
    expect(button("data-table-next-page").disabled).toBe(false);

    click('[data-slot="data-table-next-page"]');
    await flush();
    expect(status()).toBe("Page 2 of 2");
    expect(button("data-table-previous-page").disabled).toBe(false);
    expect(button("data-table-next-page").disabled).toBe(true);

    const select = pageSize();
    select.value = "5";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(pageSize().value).toBe("5");
    expect(status()).toBe("Page 3 of 3");
    expect(root.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]').length).toBe(2);
    unmount();
  });

  test("filter input mirrors the column filter value", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable columns={columns} data={payments} filterColumnId="email" />
    ));

    const input = root.querySelector(
      '[data-slot="data-table-filter"]',
    ) as HTMLInputElement;
    expect(input.value).toBe("");
    input.value = "user03";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(input.value).toBe("user03");
    expect(root.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]').length).toBe(1);
    unmount();
  });

  test("empty state spans the visible leaf columns", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable columns={columns} data={[]} />
    ));
    await flush();
    const empty = root.querySelector('[data-slot="data-table-empty"]');
    expect(empty?.getAttribute("colspan")).toBe("2");
    unmount();
  });

  test("without filterColumnId the filter reads and writes never look up a column", () => {
    const untypedColumns = [createDataTableColumnHelper<RowData>().display({ id: "row", header: "Row" })];
    const nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const warn = spyOn(console, "warn");
    let api: DataTableReturn | undefined;
    const Host = cc(() => {
      api = useDataTable({
        columns: untypedColumns,
        data: payments,
        filterPlaceholder: "Filter...",
        empty: null,
        hideToolbar: false,
        hidePagination: false,
        hideViewOptions: false,
      });
      return null;
    });
    const { unmount } = mountUi(() => <Host />);
    const input = document.createElement("input");
    input.value = "user";
    input.addEventListener("input", (event) => api?.onFilterInput(event));
    input.dispatchEvent(new Event("input"));
    expect(api?.showFilter).toBe(false);
    expect(api?.filterValue.value).toBe("");
    expect(api?.rows.value.length).toBe(10);
    const columnWarnings = warn.mock.calls.filter((call) => String(call[0]).includes("Column with id"));
    warn.mockRestore();
    process.env.NODE_ENV = nodeEnv;
    expect(columnWarnings).toEqual([]);
    unmount();
  });
});
