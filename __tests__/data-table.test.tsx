import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { constructTable } from "@tanstack/table-core";
import { signal } from "sinwan/reactivity";

import { Badge } from "../src/components/ui/badge";
import {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
  dataTableFeatures,
  DataTableFlexRender,
  DataTablePagination,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableViewOptions,
  toTableNode,
} from "../src/components/ui/data-table";
import { mountUi, setupDom, teardownDom } from "./helpers";

type Payment = {
  id: string;
  amount: number;
  status: string;
  email: string;
};

const helper = createDataTableColumnHelper<Payment>();

const payments: Payment[] = Array.from({ length: 12 }, (_, index) => ({
  id: `id-${index}`,
  amount: (index + 1) * 10,
  status: index % 2 === 0 ? "pending" : "success",
  email: index === 0 ? "m@example.com" : `user${index}@mail.test`,
}));

const columns = helper.columns([
  helper.display({
    id: "select",
    header: ({ table }) => <DataTableSelectAll table={table} />,
    cell: ({ row }) => <DataTableSelectRow row={row} />,
    enableSorting: false,
    enableHiding: false,
  }),
  helper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableHiding: false,
  }),
  helper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    filterFn: "includesString",
    sortFn: "text",
    footer: "Emails",
  }),
  helper.accessor("amount", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue<number>("amount");
      return <span data-slot="amount-cell">{amount}</span>;
    },
    sortFn: "alphanumeric",
  }),
  helper.display({
    id: "note",
    header: "Note",
    cell: () => null,
    enableSorting: false,
  }),
]);

const lockedHelper = createDataTableColumnHelper<Payment>();
const unsortableColumns = lockedHelper.columns([
  lockedHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
]);

const groupHelper = createDataTableColumnHelper<Payment>();
const groupedColumns = groupHelper.columns([
  groupHelper.group({
    id: "info",
    header: "Info",
    columns: groupHelper.columns([
      groupHelper.accessor("email", { header: "Email" }),
      groupHelper.accessor("status", { header: "Status" }),
    ]),
  }),
]);

const specialHelper = createDataTableColumnHelper<Payment>();
const specialColumns = specialHelper.columns([
  specialHelper.accessor("email", { header: "Email" }),
  specialHelper.display({
    id: "kinds",
    header: () => 0,
    cell: ({ row }) => {
      if (row.original.id === "id-0") return false;
      if (row.original.id === "id-1") return 1n;
      if (row.original.id === "id-2") return Symbol("cell");
      return <Badge>{row.original.status}</Badge>;
    },
  }),
]);

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((r) => setTimeout(r, 20));
}

function triggerByText(root: ParentNode, text: string): Element {
  const match = Array.from(
    root.querySelectorAll('[data-slot="dropdown-menu-trigger"]'),
  ).find((node) => node.textContent?.includes(text));
  if (!match) throw new Error(`missing trigger ${text}`);
  return match;
}

function clickMenuItem(label: string): void {
  const item = Array.from(
    document.querySelectorAll('[data-slot="dropdown-menu-item"]'),
  ).find((node) => node.textContent?.includes(label));
  if (!item) throw new Error(`missing menu item ${label}`);
  item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

beforeEach(() => setupDom());
afterEach(() => teardownDom());

describe("DataTable", () => {
  test("renders rows, empty state, and custom empty copy", async () => {
    const filled = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        getRowId={(row) => row.id}
      />
    ));
    expect(filled.root.querySelector('[data-slot="data-table"]')).toBeTruthy();
    expect(filled.root.textContent).toContain("m@example.com");
    expect(filled.root.querySelector('[data-slot="data-table-empty"]')).toBeNull();
    filled.unmount();

    const empty = mountUi(() => (
      <DataTable columns={columns} data={[]} empty="Nothing here." />
    ));
    expect(empty.root.querySelector('[data-slot="data-table-empty"]')?.textContent).toBe(
      "Nothing here.",
    );
    empty.unmount();
  });

  test("filters emails, ignores a missing filter column, and tracks signal data", async () => {
    const rows = signal(payments);
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={rows.value}
        filterColumnId="email"
        filterPlaceholder="Filter emails..."
        getRowId={(row) => row.id}
      />
    ));
    const input = root.querySelector(
      '[data-slot="data-table-filter"]',
    ) as HTMLInputElement;
    expect(input.placeholder).toBe("Filter emails...");
    input.value = "m@example";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(root.textContent).toContain("m@example.com");
    expect(root.textContent).not.toContain("user5@mail.test");

    rows.value = payments.slice(0, 3);
    await flush();
    unmount();

    const missing = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments.slice(0, 2)}
        filterColumnId="missing"
        hidePagination
        hideViewOptions
      />
    ));
    const missingInput = missing.root.querySelector(
      '[data-slot="data-table-filter"]',
    ) as HTMLInputElement;
    missingInput.value = "nope";
    missingInput.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    missing.unmount();

    const invalid = mountUi(() => (
      <DataTable
        columns={columns}
        data={1 as unknown as Payment[]}
        hideToolbar
        hidePagination
      />
    ));
    expect(invalid.root.querySelector('[data-slot="data-table-empty"]')).toBeTruthy();
    invalid.unmount();
  });

  test("keeps a single empty state while typing a filter with no matches", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        filterColumnId="email"
        getRowId={(row) => row.id}
      />
    ));
    const input = root.querySelector(
      '[data-slot="data-table-filter"]',
    ) as HTMLInputElement;
    for (const ch of "hfj") {
      input.value += ch;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await flush();
    }
    expect(input.value).toBe("hfj");
    expect(root.querySelectorAll('[data-slot="data-table-empty"]').length).toBe(
      1,
    );
    expect(root.textContent).toContain("No results.");
    unmount();
  });

  test("virtual filter empty → clear → empty again remounts the empty state", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        filterColumnId="email"
        filterPlaceholder="Filter emails..."
        virtual={{ itemHeight: 40, containerHeight: 120, overscan: 1 }}
        getRowId={(row) => row.id}
      />
    ));
    const input = root.querySelector(
      '[data-slot="data-table-filter"]',
    ) as HTMLInputElement;

    const typeFilter = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await flush();
    };

    await typeFilter("zzzz");
    expect(root.querySelectorAll('[data-slot="data-table-empty"]').length).toBe(
      1,
    );

    await typeFilter("");
    expect(root.querySelectorAll('[data-slot="data-table-empty"]').length).toBe(
      0,
    );
    expect(
      root.querySelectorAll(
        '[data-slot="data-table-virtual-body"] [data-slot="table-row"]',
      ).length,
    ).toBeGreaterThan(0);

    await typeFilter("yyyy");
    expect(root.querySelectorAll('[data-slot="data-table-empty"]').length).toBe(
      1,
    );
    expect(root.textContent).toContain("No results.");
    unmount();
  });

  test("sorts, hides a column from the header menu, and paginates", async () => {
    const { root, click, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        filterColumnId="email"
        getRowId={(row) => row.id}
        pageSizes={[10, 20]}
      />
    ));

    triggerByText(root, "Email").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    clickMenuItem("Asc");
    await flush();
    triggerByText(root, "Email").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    clickMenuItem("Desc");
    await flush();
    triggerByText(root, "Email").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    clickMenuItem("Hide");
    await flush();
    expect(
      root.querySelector('[data-slot="table-header"] [data-column-id="email"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="amount"]'),
    ).toBeTruthy();

    const next = root.querySelector(
      '[data-slot="data-table-next-page"]',
    ) as HTMLButtonElement;
    expect(next.disabled).toBe(false);
    click('[data-slot="data-table-next-page"]');
    await flush();
    click('[data-slot="data-table-first-page"]');
    await flush();
    click('[data-slot="data-table-last-page"]');
    await flush();
    click('[data-slot="data-table-previous-page"]');
    await flush();

    const select = root.querySelector(
      '[data-slot="data-table-page-size"]',
    ) as HTMLSelectElement;
    select.value = "20";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(root.querySelector('[data-slot="data-table-page-status"]')?.textContent).toContain(
      "Page 1",
    );

    unmount();
  });

  test("selects rows, mixed header state, and column visibility", async () => {
    const { root, click, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        getRowId={(row) => row.id}
      />
    ));

    click('button[aria-label="Select row"]');
    await flush();
    const selectAll = root.querySelector(
      'button[aria-label="Select all"]',
    ) as HTMLButtonElement;
    expect(selectAll.getAttribute("data-state")).toBe("indeterminate");
    expect(root.querySelector('[data-slot="data-table-selected-count"]')?.textContent).toContain(
      "1 of",
    );

    click('button[aria-label="Select all"]');
    await flush();
    expect(selectAll.getAttribute("data-state")).toBe("checked");
    click('button[aria-label="Select all"]');
    await flush();

    triggerByText(root, "View").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    const amountItem = Array.from(
      document.querySelectorAll('[data-slot="dropdown-menu-checkbox-item"]'),
    ).find((node) => node.textContent?.toLowerCase().includes("amount"));
    expect(amountItem).toBeTruthy();
    amountItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    expect(
      root.querySelector('[data-slot="table-header"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeTruthy();
    expect(amountItem?.getAttribute("aria-checked")).toBe("false");

    amountItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    expect(
      root.querySelector('[data-slot="table-header"] [data-column-id="amount"]'),
    ).toBeTruthy();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="amount"]'),
    ).toBeTruthy();
    expect(amountItem?.getAttribute("aria-checked")).toBe("true");

    unmount();
  });

  test("toolbar and pagination flags, unsortable header, and grouped placeholders", async () => {
    const hidden = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments.slice(0, 2)}
        hideToolbar
        hidePagination
        class="max-w-xl"
      />
    ));
    expect(hidden.root.querySelector('[data-slot="data-table-filter"]')).toBeNull();
    expect(hidden.root.querySelector('[data-slot="data-table-pagination"]')).toBeNull();
    hidden.unmount();

    const noView = mountUi(() => (
      <DataTable
        columns={unsortableColumns}
        data={payments.slice(0, 2)}
        hideViewOptions
        hidePagination
      />
    ));
    expect(noView.root.querySelector('[data-slot="data-table-column-title"]')?.textContent).toBe(
      "Email",
    );
    noView.unmount();

    const grouped = mountUi(() => (
      <DataTable
        columns={groupedColumns}
        data={payments.slice(0, 2)}
        hideToolbar
        hidePagination
      />
    ));
    expect(grouped.root.textContent).toContain("Info");
    grouped.unmount();

    const rtl = mountUi(() => (
      <div dir="rtl">
        <DataTable
          columns={columns}
          data={payments.slice(0, 2)}
          hidePagination
          getRowId={(row) => row.id}
        />
      </div>
    ));
    const rtlTable = rtl.root.querySelector('[data-slot="data-table"]');
    expect(rtlTable).toBeTruthy();
    expect(rtl.root.textContent).toContain("m@example.com");
    expect(
      rtl.root.querySelector('[data-slot="table-head"]')?.className,
    ).toContain("text-start");
    expect(
      rtl.root.querySelector('[data-slot="table-container"]')?.className,
    ).toContain("min-w-0");
    expect(
      rtl.root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeTruthy();
    expect(
      rtl.root.querySelectorAll('[data-slot="table-body"] [data-column-id]').length,
    ).toBe(
      rtl.root.querySelectorAll('[data-slot="table-header"] [data-column-id]')
        .length * 2,
    );

    triggerByText(rtl.root, "View").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    const rtlAmountItem = Array.from(
      document.querySelectorAll('[data-slot="dropdown-menu-checkbox-item"]'),
    ).find((node) => node.textContent?.toLowerCase().includes("amount"));
    rtlAmountItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    expect(
      rtl.root.querySelector('[data-slot="table-header"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      rtl.root.querySelector('[data-slot="table-body"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      rtl.root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeTruthy();
    rtl.unmount();
  });

  test("flex render covers footer and unusual cell values", async () => {
    expect(toTableNode(null)).toBeNull();
    expect(toTableNode(undefined)).toBeUndefined();
    expect(toTableNode("hi")).toBe("hi");
    expect(toTableNode(3)).toBe(3);
    expect(toTableNode(false)).toBe(false);
    expect(toTableNode(1n)).toBe("1");
    expect(String(toTableNode(Symbol("cell")))).toContain("Symbol");
    const fn = () => "n";
    expect(toTableNode(fn)).toBe(fn);
    const el = { tag: "span", props: {}, children: [] };
    expect(toTableNode(el)).toBe(el);

    const table = constructTable({
      features: dataTableFeatures,
      columns,
      data: payments.slice(0, 1),
    });
    const footer = table.getFooterGroups()[0]?.headers.find(
      (header) => header.column.id === "email",
    );
    expect(footer).toBeTruthy();
    expect(DataTableFlexRender({ footer: footer! })).toBe("Emails");

    const special = mountUi(() => (
      <DataTable
        columns={specialColumns}
        data={payments.slice(0, 3)}
        hideToolbar
        hidePagination
        getRowId={(row) => row.id}
      />
    ));
    expect(special.root.textContent).toContain("0");
    special.unmount();
  });

  test("view options and pagination wrappers accept a live table instance", async () => {
    const table = constructTable({
      features: dataTableFeatures,
      columns,
      data: payments,
    });
    const { click, unmount } = mountUi(() => (
      <div>
        <DataTableViewOptions table={table} />
        <DataTablePagination table={table} pageSizes={[5, 10]} />
      </div>
    ));
    triggerByText(document.body, "View").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    click('[data-slot="data-table-next-page"]');
    await flush();
    unmount();
  });

  test("windows body rows with Sinwan Virtual and keeps hide in sync", async () => {
    const many = Array.from({ length: 80 }, (_, index) => ({
      id: `virt-${index}`,
      amount: index,
      status: "pending",
      email: `user${index}@mail.test`,
    }));
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={many}
        virtual={{ itemHeight: 40, containerHeight: 120, overscan: 1 }}
        getRowId={(row) => row.id}
      />
    ));
    await flush();
    expect(root.querySelector('[data-slot="data-table-pagination"]')).toBeNull();
    expect(root.querySelector('[data-slot="data-table-virtual-body"]')).toBeTruthy();
    const frame = root.querySelector('[data-slot="data-table-frame"]');
    expect(frame?.className).toContain("rounded-md");
    expect(frame?.className).toContain("overflow-hidden");
    expect(
      root.querySelector("[data-virtual-header]")?.className,
    ).toContain("bg-muted/50");
    const renderedRows = root.querySelectorAll(
      '[data-slot="data-table-virtual-body"] [data-slot="table-row"]',
    );
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(many.length);
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeTruthy();

    const scroller = root.querySelector(
      '[data-slot="data-table-virtual-body"] > div',
    ) as HTMLElement;
    scroller.scrollTop = 400;
    scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
    await flush();
    expect(
      root.querySelector('[data-slot="data-table-virtual-body"] [data-slot="table-row"]'),
    ).toBeTruthy();

    triggerByText(root, "View").dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    await flush();
    const amountItem = Array.from(
      document.querySelectorAll('[data-slot="dropdown-menu-checkbox-item"]'),
    ).find((node) => node.textContent?.toLowerCase().includes("amount"));
    amountItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    expect(
      root.querySelector('[data-slot="table-header"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="amount"]'),
    ).toBeNull();
    expect(
      root.querySelector('[data-slot="table-body"] [data-column-id="email"]'),
    ).toBeTruthy();
    unmount();

    const empty = mountUi(() => (
      <DataTable
        columns={columns}
        data={[]}
        virtual
        hideToolbar
        empty="No virtual rows."
      />
    ));
    expect(
      empty.root.querySelector('[data-slot="data-table-empty"]')?.textContent,
    ).toBe("No virtual rows.");
    const defaultScroller = empty.root.querySelector(
      '[data-slot="data-table-virtual-body"] > div',
    ) as HTMLElement;
    expect(defaultScroller.style.height).toBe("384px");
    empty.unmount();

    const fallbacks = mountUi(() => (
      <DataTable
        columns={columns}
        data={many.slice(0, 8)}
        virtual={{
          itemHeight: 0,
          containerHeight: Number.NaN,
          overscan: -2,
          minRendered: -1,
        }}
        hideToolbar
        getRowId={(row) => row.id}
      />
    ));
    const fallbackScroller = fallbacks.root.querySelector(
      '[data-slot="data-table-virtual-body"] > div',
    ) as HTMLElement;
    expect(fallbackScroller.style.height).toBe("384px");
    fallbacks.unmount();

    const minRendered = mountUi(() => (
      <DataTable
        columns={columns}
        data={many.slice(0, 6)}
        virtual={{
          itemHeight: 40,
          containerHeight: 40,
          overscan: 0,
          minRendered: 4,
        }}
        hideToolbar
        getRowId={(row) => row.id}
      />
    ));
    expect(
      minRendered.root.querySelectorAll(
        '[data-slot="data-table-virtual-body"] [data-slot="table-row"]',
      ).length,
    ).toBeGreaterThanOrEqual(4);
    minRendered.unmount();

    const grouped = mountUi(() => (
      <DataTable
        columns={groupedColumns}
        data={payments.slice(0, 2)}
        virtual={{ itemHeight: 40, containerHeight: 80, overscan: 0 }}
        hideToolbar
      />
    ));
    expect(grouped.root.textContent).toContain("Info");
    grouped.unmount();

    const off = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments.slice(0, 2)}
        virtual={false}
        hideToolbar
        hidePagination
      />
    ));
    expect(off.root.querySelector('[data-slot="data-table-virtual-body"]')).toBeNull();
    expect(off.root.querySelector("table")).toBeTruthy();
    expect(off.root.querySelector('[data-slot="data-table-frame"]')?.className).toContain(
      "overflow-hidden",
    );
    off.unmount();
  });
});
