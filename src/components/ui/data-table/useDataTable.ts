import { onUnmounted, type SinwanNode } from "sinwan/component";
import {
  computed,
  effect,
  signal,
  type Computed,
  type Signal,
} from "sinwan/reactivity";
import {
  constructTable,
  functionalUpdate,
  type HeaderGroup,
  type PaginationState,
  type RowData,
  type SortDirection,
  type SortingState,
} from "@tanstack/table-core";

import {
  dataTableFeatures,
  type DataTableColumn,
  type DataTableColumnDef,
  type DataTableFeatures,
  type DataTableInstance,
  type DataTableRow,
} from "./data-table-features";
import { notifyTableOptions, useTableRevision } from "./data-table-node";

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
   * Server-side pagination: the number of rows across every page. When set,
   * `data` is the current page only and the table does not paginate it again
   * (TanStack `manualPagination`). Pair it with `pagination` and
   * `onPaginationChange`, and load the page the callback asks for.
   */
  rowCount?: number;
  /** Controlled pagination (`pageIndex` from 0). */
  pagination?: PaginationState;
  /** Called with the next pagination when the user changes page or page size. */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Controlled sorting. */
  sorting?: SortingState;
  /** Called with the next sorting when the user sorts a column. */
  onSortingChange?: (sorting: SortingState) => void;
  /** `data` arrives sorted (server-side): the table only reports `sorting` changes. */
  manualSorting?: boolean;
  /** Adds a "Custom" rows-per-page choice: any whole number from 1 to this. */
  maxPageSize?: number;
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
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;
  maxPageSize?: number;
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
  /** Adds a "Custom" rows-per-page choice: any whole number from 1 to this. */
  maxPageSize?: number;
  class?: string;
};

export type DataTablePaginationHostProps = {
  table: DataTableInstance;
  pageSizes: readonly number[];
  maxPageSize?: number;
  class?: string;
};

export type DataTablePaginationReturn = {
  revision: Signal<number>;
  selectedText: Computed<string>;
  /** "21–40 of 57" with server-side pagination (`rowCount`), else `null`. */
  rangeText: Computed<string | null>;
  /** The select's value: the page size, or `CUSTOM_PAGE_SIZE` for a size outside `pageSizes`. */
  pageSize: Computed<string>;
  /** Whether the custom size field shows (chosen, or the size is not one of `pageSizes`). */
  showCustomSize: Computed<boolean>;
  /** Applies the custom size field's value (Enter or blur), clamped to 1…`maxPageSize`. */
  onCustomSizeCommit: (event: Event) => void;
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

/** The rows-per-page select's value for "Custom". */
export const CUSTOM_PAGE_SIZE = "custom";

/** TanStack options for server-side pagination and sorting; callbacks only when given. */
function controlledOptions(props: DataTableHostProps, table: () => DataTableInstance) {
  const state: { pagination?: PaginationState; sorting?: SortingState } = {};
  if (props.pagination) state.pagination = props.pagination;
  if (props.sorting) state.sorting = props.sorting;
  const onPaginationChange = props.onPaginationChange;
  const onSortingChange = props.onSortingChange;
  return {
    manualPagination: props.rowCount !== undefined,
    rowCount: props.rowCount,
    manualSorting: props.manualSorting ?? false,
    state,
    ...(onPaginationChange
      ? {
          onPaginationChange: (updater: PaginationState | ((old: PaginationState) => PaginationState)) =>
            onPaginationChange(functionalUpdate(updater, table().store.get().pagination)),
        }
      : {}),
    ...(onSortingChange
      ? {
          onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) =>
            onSortingChange(functionalUpdate(updater, table().store.get().sorting)),
        }
      : {}),
  };
}

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
  const getTable = () => table;
  const table: DataTableInstance = constructTable({
    features: dataTableFeatures,
    columns: props.columns,
    data: resolveTableData(props.data),
    getRowId: props.getRowId,
    ...controlledOptions(props, getTable),
  });
  const revision = useTableRevision(table);
  const stopData = effect(() => {
    const next = resolveTableData(props.data);
    const controlled = controlledOptions(props, getTable);
    table.setOptions((current) => ({
      ...current,
      ...controlled,
      data: next,
      columns: props.columns,
    }));
    notifyTableOptions(table);
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
  pageSizes: readonly number[] = DEFAULT_DATA_TABLE_PAGE_SIZES,
  maxPageSize?: number,
): DataTablePaginationReturn {
  const revision = useTableRevision(table);
  const customChosen = signal(false);
  const currentSize = () => table.store.get().pagination.pageSize;
  const outsideList = () => maxPageSize !== undefined && !pageSizes.includes(currentSize());
  return {
    revision,
    rangeText: computed(() => {
      void revision.value;
      if (!table.options.manualPagination) return null;
      const { pageIndex, pageSize } = table.store.get().pagination;
      const total = table.getRowCount();
      if (total === 0) return "No rows";
      const first = Math.min(pageIndex * pageSize + 1, total);
      const last = Math.min((pageIndex + 1) * pageSize, total);
      return `${first}–${last} of ${total}`;
    }),
    showCustomSize: computed(() => (revision.value, customChosen.value || outsideList())),
    onCustomSizeCommit: (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const size = Math.floor(Number(input.value));
      if (!Number.isFinite(size) || size < 1) {
        input.value = String(currentSize());
        return;
      }
      const next = Math.min(size, maxPageSize ?? size);
      input.value = String(next);
      customChosen.value = !pageSizes.includes(next);
      table.setPageSize(next);
    },
    selectedText: computed(
      () => (
        revision.value,
        `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
      ),
    ),
    pageSize: computed(() => {
      void revision.value;
      return customChosen.value || outsideList() ? CUSTOM_PAGE_SIZE : String(currentSize());
    }),
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
      if (select.value === CUSTOM_PAGE_SIZE) {
        customChosen.value = true;
        return;
      }
      customChosen.value = false;
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
