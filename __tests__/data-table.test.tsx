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

describe("DataTable server mode", () => {
  const pageOf = (index: number, size: number) => payments.slice(0, Math.min(size, payments.length)).map((row) => ({
    ...row,
    id: `p${index}-${row.id}`,
  }));

  test("renders the given page as is, shows the range, and reports page and size changes", async () => {
    const page = signal({ pageIndex: 1, pageSize: 5 });
    const changes: Array<{ pageIndex: number; pageSize: number }> = [];
    const { root, click, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={pageOf(page.value.pageIndex, page.value.pageSize)}
        getRowId={(row) => row.id}
        rowCount={57}
        pagination={page.value}
        onPaginationChange={(next) => {
          changes.push(next);
          page.value = next;
        }}
        pageSizes={[5, 10]}
      />
    ));
    const range = () => root.querySelector('[data-slot="data-table-selected-count"]')?.textContent;
    const status = () => root.querySelector('[data-slot="data-table-page-status"]')?.textContent;
    // The table does not slice the page again: all 5 rows of page 2 are shown.
    expect(root.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]').length).toBe(5);
    expect(range()).toBe("6–10 of 57");
    expect(status()).toBe("Page 2 of 12");

    click('[data-slot="data-table-next-page"]');
    await flush();
    expect(changes.at(-1)).toEqual({ pageIndex: 2, pageSize: 5 });
    expect(range()).toBe("11–15 of 57");

    click('[data-slot="data-table-last-page"]');
    await flush();
    expect(changes.at(-1)).toEqual({ pageIndex: 11, pageSize: 5 });
    expect(range()).toBe("56–57 of 57");
    expect((root.querySelector('[data-slot="data-table-next-page"]') as HTMLButtonElement).disabled).toBe(true);

    click('[data-slot="data-table-first-page"]');
    await flush();
    expect(changes.at(-1)).toEqual({ pageIndex: 0, pageSize: 5 });
    click('[data-slot="data-table-next-page"]');
    await flush();
    click('[data-slot="data-table-previous-page"]');
    await flush();
    expect(changes.at(-1)).toEqual({ pageIndex: 0, pageSize: 5 });

    const select = root.querySelector('[data-slot="data-table-page-size"]') as HTMLSelectElement;
    select.value = "10";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(changes.at(-1)?.pageSize).toBe(10);
    expect(status()).toBe("Page 1 of 6");
    unmount();
  });

  test("new data and row count replace the rows and range without a pagination change", async () => {
    const data = signal(payments.slice(0, 3));
    const total = signal(3);
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={data.value}
        getRowId={(row) => row.id}
        rowCount={total.value}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={() => {}}
      />
    ));
    const emails = () =>
      Array.from(root.querySelectorAll('[data-slot="table-body"] [data-column-id="email"]')).map((cell) => cell.textContent);
    const range = () => root.querySelector('[data-slot="data-table-selected-count"]')?.textContent;
    expect(emails()).toEqual(payments.slice(0, 3).map((row) => row.email));
    expect(range()).toBe("1–3 of 3");

    data.value = payments.slice(3, 8);
    total.value = 5;
    await flush();
    expect(emails()).toEqual(payments.slice(3, 8).map((row) => row.email));
    expect(range()).toBe("1–5 of 5");
    unmount();
  });

  test("client mode: new data replaces the rows and the page count", async () => {
    const rows = signal(payments);
    const { root, unmount } = mountUi(() => (
      <DataTable columns={columns} data={rows.value} getRowId={(row) => row.id} />
    ));
    const bodyRows = () => root.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]').length;
    const status = () => root.querySelector('[data-slot="data-table-page-status"]')?.textContent;
    expect(bodyRows()).toBe(10);
    expect(status()).toBe("Page 1 of 2");

    rows.value = payments.slice(0, 3);
    await flush();
    expect(bodyRows()).toBe(3);
    expect(status()).toBe("Page 1 of 1");
    unmount();
  });

  test("an empty server result says so and cannot page", async () => {
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={[]}
        rowCount={0}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={() => {}}
      />
    ));
    expect(root.querySelector('[data-slot="data-table-selected-count"]')?.textContent).toBe("No rows");
    expect((root.querySelector('[data-slot="data-table-next-page"]') as HTMLButtonElement).disabled).toBe(true);
    unmount();
  });

  test("server sorting reports the column and keeps the server's order", async () => {
    const sorting = signal<Array<{ id: string; desc: boolean }>>([]);
    const reported: Array<Array<{ id: string; desc: boolean }>> = [];
    const order = ["user3@mail.test", "m@example.com", "user1@mail.test"];
    const rows = order.map((email, index) => ({ id: `s${index}`, amount: index, status: "pending", email }));
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        manualSorting
        sorting={sorting.value}
        onSortingChange={(next) => {
          reported.push(next);
          sorting.value = next;
        }}
        hidePagination
      />
    ));
    triggerByText(root, "Email").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();
    clickMenuItem("Asc");
    await flush();
    expect(reported.at(-1)).toEqual([{ id: "email", desc: false }]);
    const emails = Array.from(root.querySelectorAll('[data-slot="table-body"] [data-column-id="email"]')).map(
      (cell) => cell.textContent,
    );
    expect(emails).toEqual(order);
    unmount();
  });

  test("custom rows per page: chosen from the list, typed, clamped, and shown for a size outside the list", async () => {
    const page = signal({ pageIndex: 0, pageSize: 10 });
    const { root, unmount } = mountUi(() => (
      <DataTable
        columns={columns}
        data={payments}
        getRowId={(row) => row.id}
        rowCount={240}
        pagination={page.value}
        onPaginationChange={(next) => {
          page.value = next;
        }}
        pageSizes={[10, 20]}
        maxPageSize={100}
      />
    ));
    const select = () => root.querySelector('[data-slot="data-table-page-size"]') as HTMLSelectElement;
    const custom = () => root.querySelector('[data-slot="data-table-custom-page-size"]') as HTMLInputElement | null;
    expect(Array.from(select().options).map((option) => option.value)).toEqual(["10", "20", "custom"]);
    expect(custom()).toBeNull();

    select().value = "custom";
    select().dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(custom()).not.toBeNull();
    expect(page.value.pageSize).toBe(10);

    custom()!.value = "35";
    custom()!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(35);
    expect(select().value).toBe("custom");

    custom()!.value = "500";
    custom()!.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(100);

    custom()!.value = "0";
    custom()!.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(100);
    expect(custom()!.value).toBe("100");

    // Other keys do not commit.
    custom()!.value = "7";
    custom()!.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(100);

    // A size from the list goes back to the list and hides the field.
    custom()!.value = "20";
    custom()!.dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(20);
    expect(select().value).toBe("20");
    expect(custom()).toBeNull();

    select().value = "custom";
    select().dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    select().value = "10";
    select().dispatchEvent(new Event("change", { bubbles: true }));
    await flush();
    expect(page.value.pageSize).toBe(10);
    expect(custom()).toBeNull();

    page.value = { pageIndex: 0, pageSize: 45 };
    await flush();
    expect(select().value).toBe("custom");
    expect(custom()?.value).toBe("45");
    unmount();
  });
});
