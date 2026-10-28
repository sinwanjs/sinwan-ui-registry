import { onUnmounted, type SinwanNode } from "sinwan/component";
import {
  computed,
  effect,
  type Computed,
  type Signal,
} from "sinwan/reactivity";
import {
  constructTable,
  type HeaderGroup,
  type RowData,
  type SortDirection,
} from "@tanstack/table-core";

import {
  dataTableFeatures,
  type DataTableColumn,
  type DataTableColumnDef,
  type DataTableFeatures,
  type DataTableInstance,
  type DataTableRow,
} from "./data-table-features";
import { useTableRevision } from "./data-table-node";

export type DataTableVirtualOptions = {
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  minRendered?: number;
};

export type DataTableProps<TData extends RowData = RowData> = {
  columns: ReadonlyArray<DataTableColumnDef<TData>>;
  data: TData[];
  filterColumnId?: string;
  filterPlaceholder?: string;
  getRowId?: (originalRow: TData, index: number) => string;
  empty?: SinwanNode;
  class?: string;
  hideToolbar?: boolean;
  hidePagination?: boolean;
  hideViewOptions?: boolean;
  pageSizes?: readonly number[];
  /**
   * Window body rows with Sinwan `<Virtual>`. Uses the pre-pagination row
   * model so filtering/sorting still apply. Pagination is hidden while this
   * is on — `<Virtual>` owns a dedicated scrollport and cannot live in `<tbody>`.
   */
  virtual?: boolean | DataTableVirtualOptions;
};

export type ResolvedDataTableVirtual = {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
  minRendered: number;
};

export type DataTableHostProps = {
  columns: ReadonlyArray<DataTableColumnDef>;
  data: RowData[];
  filterColumnId?: string;
  filterPlaceholder: string;
  getRowId?: (originalRow: RowData, index: number) => string;
  empty: SinwanNode;
  class?: string;
  hideToolbar: boolean;
  hidePagination: boolean;
  hideViewOptions: boolean;
  pageSizes?: readonly number[];
  virtual?: boolean | DataTableVirtualOptions;
};

export type DataTableHeaderGroup = HeaderGroup<DataTableFeatures, RowData>;

export type DataTableReturn = {
  table: DataTableInstance;
  revision: Signal<number>;
  virtual: ResolvedDataTableVirtual | null;
  showToolbar: boolean;
  showFilter: boolean;
  showView: boolean;
  hidePagination: boolean;
  filterValue: Computed<string>;
  onFilterInput: (event: Event) => void;
  headerGroups: Computed<DataTableHeaderGroup[]>;
  rows: Computed<DataTableRow[]>;
  emptyColSpan: Computed<number>;
};

export type DataTableVirtualSheetProps = {
  table: DataTableInstance;
  revision: Signal<number>;
  empty: SinwanNode;
  itemHeight: number;
  containerHeight: number;
  overscan: number;
  minRendered: number;
};

export type DataTableVirtualSheetReturn = {
  headerGroups: Computed<DataTableHeaderGroup[]>;
  rows: Computed<DataTableRow[]>;
  rowStyle: Computed<Record<string, string>>;
  headerRowStyle: Computed<Record<string, string>>;
};

export type DataTableColumnHeaderProps<
  TData extends RowData = RowData,
  TValue = unknown,
> = {
  column: DataTableColumn<TData, TValue>;
  title: string;
  class?: string;
};

export type DataTableColumnHeaderHostProps = {
  column: DataTableColumn;
  title: string;
  class?: string;
};

export type DataTableColumnHeaderReturn = {
  canSort: boolean;
  canHide: boolean;
  sorted: Computed<false | SortDirection>;
  sortAscending: () => void;
  sortDescending: () => void;
  hide: () => void;
};

export type DataTablePaginationProps<TData extends RowData = RowData> = {
  table: DataTableInstance<TData>;
  pageSizes?: readonly number[];
  class?: string;
};

export type DataTablePaginationHostProps = {
  table: DataTableInstance;
  pageSizes: readonly number[];
  class?: string;
};

export type DataTablePaginationReturn = {
  revision: Signal<number>;
  selectedText: Computed<string>;
  pageSize: Computed<string>;
  pageStatus: Computed<string>;
  canPreviousPage: Computed<boolean>;
  canNextPage: Computed<boolean>;
  onPageSizeChange: (event: Event) => void;
  firstPage: () => void;
  previousPage: () => void;
  nextPage: () => void;
  lastPage: () => void;
};

export type DataTableViewOptionsProps<TData extends RowData = RowData> = {
  table: DataTableInstance<TData>;
};

export type DataTableViewOptionsReturn = {
  columns: Computed<DataTableColumn[]>;
};

export type DataTableColumnToggleReturn = {
  checked: Computed<boolean>;
  setVisible: (value: boolean) => void;
};

export type DataTableSelectAllReturn = {
  checked: Computed<boolean>;
  indeterminate: Computed<boolean>;
  toggle: (value: boolean) => void;
};

export type DataTableSelectRowReturn = {
  checked: Computed<boolean>;
  toggle: (value: boolean) => void;
};

export const DEFAULT_DATA_TABLE_PAGE_SIZES = [10, 20, 25, 30, 40, 50];

const DEFAULT_VIRTUAL_ITEM_HEIGHT = 48;
const DEFAULT_VIRTUAL_CONTAINER_HEIGHT = 384;
const DEFAULT_VIRTUAL_OVERSCAN = 8;

function resolveTableData(data: unknown): RowData[] {
  return Array.isArray(data) ? data : [];
}

function toFiniteCount(value: unknown, fallback: number, allowZero: boolean): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  if (allowZero ? value < 0 : value <= 0) return fallback;
  return Math.floor(value);
}

function resolveDataTableVirtual(
  virtual: boolean | DataTableVirtualOptions | undefined,
): ResolvedDataTableVirtual | null {
  if (!virtual) return null;
  const options = virtual === true ? {} : virtual;
  return {
    itemHeight: toFiniteCount(
      options.itemHeight,
      DEFAULT_VIRTUAL_ITEM_HEIGHT,
      false,
    ),
    containerHeight: toFiniteCount(
      options.containerHeight,
      DEFAULT_VIRTUAL_CONTAINER_HEIGHT,
      false,
    ),
    overscan: toFiniteCount(options.overscan, DEFAULT_VIRTUAL_OVERSCAN, true),
    minRendered: toFiniteCount(options.minRendered, 0, true),
  };
}

function leafGridStyle(
  columns: ReadonlyArray<{ accessorFn?: unknown }>,
): Record<string, string> {
  const tracks =
    columns.length === 0
      ? ["minmax(0, 1fr)"]
      : columns.map((column) =>
          column.accessorFn === undefined ? "3rem" : "minmax(6rem, 1fr)",
        );
  return {
    display: "grid",
    width: "100%",
    minWidth: "100%",
    gridTemplateColumns: tracks.join(" "),
  };
}

export function useDataTable(props: DataTableHostProps): DataTableReturn {
  const table = constructTable({
    features: dataTableFeatures,
    columns: props.columns,
    data: resolveTableData(props.data),
    getRowId: props.getRowId,
  });
  const revision = useTableRevision(table);
  const stopData = effect(() => {
    const next = resolveTableData(props.data);
    table.setOptions((current) => ({
      ...current,
      data: next,
      columns: props.columns,
    }));
  });
  onUnmounted(stopData);

  const virtual = resolveDataTableVirtual(props.virtual);
  const showFilter = Boolean(props.filterColumnId);
  const showView = !props.hideViewOptions;
  const filterColumn = () =>
    props.filterColumnId ? table.getColumn(props.filterColumnId) : undefined;

  return {
    table,
    revision,
    virtual,
    showToolbar: !props.hideToolbar && (showFilter || showView),
    showFilter,
    showView,
    hidePagination: props.hidePagination || virtual != null,
    filterValue: computed(() => {
      const column = (revision.value, filterColumn());
      const filterValue = column?.getFilterValue();
      return typeof filterValue === "string" ? filterValue : "";
    }),
    onFilterInput: (event) => {
      const input = event.currentTarget as HTMLInputElement;
      filterColumn()?.setFilterValue(input.value);
    },
    headerGroups: computed(() => (revision.value, table.getHeaderGroups())),
    rows: computed(() => (revision.value, table.getRowModel().rows)),
    emptyColSpan: computed(
      () => (revision.value, Math.max(table.getVisibleLeafColumns().length, 1)),
    ),
  };
}

export function useDataTableVirtualSheet(
  props: DataTableVirtualSheetProps,
): DataTableVirtualSheetReturn {
  const { table, revision } = props;
  const rowStyle = computed(
    () => (revision.value, leafGridStyle(table.getVisibleLeafColumns())),
  );
  return {
    headerGroups: computed(() => (revision.value, table.getHeaderGroups())),
    rows: computed(() => (revision.value, table.getPrePaginatedRowModel().rows)),
    rowStyle,
    headerRowStyle: computed(() => ({
      ...rowStyle.value,
      height: `${props.itemHeight}px`,
    })),
  };
}

export function useDataTableColumnHeader(
  column: DataTableColumn,
): DataTableColumnHeaderReturn {
  const revision = useTableRevision(column.table);
  return {
    canSort: column.getCanSort(),
    canHide: column.getCanHide(),
    sorted: computed(() => (revision.value, column.getIsSorted())),
    sortAscending: () => column.toggleSorting(false),
    sortDescending: () => column.toggleSorting(true),
    hide: () => column.toggleVisibility(false),
  };
}

export function useDataTablePagination(
  table: DataTableInstance,
): DataTablePaginationReturn {
  const revision = useTableRevision(table);
  return {
    revision,
    selectedText: computed(
      () => (
        revision.value,
        `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
      ),
    ),
    pageSize: computed(
      () => (revision.value, String(table.store.get().pagination.pageSize)),
    ),
    pageStatus: computed(
      () => (
        revision.value,
        `Page ${table.store.get().pagination.pageIndex + 1} of ${Math.max(table.getPageCount(), 1)}`
      ),
    ),
    canPreviousPage: computed(() => (revision.value, table.getCanPreviousPage())),
    canNextPage: computed(() => (revision.value, table.getCanNextPage())),
    onPageSizeChange: (event) => {
      const select = event.currentTarget as HTMLSelectElement;
      table.setPageSize(Number(select.value));
    },
    firstPage: () => table.firstPage(),
    previousPage: () => table.previousPage(),
    nextPage: () => table.nextPage(),
    lastPage: () => table.lastPage(),
  };
}

export function useDataTableViewOptions(
  table: DataTableInstance,
): DataTableViewOptionsReturn {
  const revision = useTableRevision(table);
  return {
    columns: computed(() => (
      revision.value,
      table
        .getAllColumns()
        .filter(
          (column) => column.accessorFn !== undefined && column.getCanHide(),
        )
    )),
  };
}

export function useDataTableColumnToggle(
  column: DataTableColumn,
): DataTableColumnToggleReturn {
  const revision = useTableRevision(column.table);
  return {
    checked: computed(() => (revision.value, column.getIsVisible())),
    setVisible: (value) => column.toggleVisibility(value),
  };
}

export function useDataTableSelectAll(
  table: DataTableInstance,
): DataTableSelectAllReturn {
  const revision = useTableRevision(table);
  return {
    checked: computed(() => (revision.value, table.getIsAllPageRowsSelected())),
    indeterminate: computed(
      () => (
        revision.value,
        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
      ),
    ),
    toggle: (value) => table.toggleAllPageRowsSelected(value),
  };
}

export function useDataTableSelectRow(
  row: DataTableRow,
): DataTableSelectRowReturn {
  const revision = useTableRevision(row.table);
  return {
    checked: computed(() => (revision.value, row.getIsSelected())),
    toggle: (value) => row.toggleSelected(value),
  };
}
