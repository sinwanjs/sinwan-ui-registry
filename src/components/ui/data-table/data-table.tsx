import { cc, type SinwanNode } from "sinwan/component";
import { For, Virtual } from "sinwan/control-flow";
import { type RowData } from "@tanstack/table-core";

import { cn } from "../../../lib/utils";
import { Input } from "../input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import {
  type DataTableColumnDef,
  type DataTableRow,
} from "./data-table-features";
import { DataTableFlexRender } from "./data-table-node";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import {
  useDataTable,
  useDataTableVirtualSheet,
  type DataTableHostProps,
  type DataTableProps,
  type DataTableVirtualSheetProps,
} from "./useDataTable";

const VIRTUAL_ROW_CLASS =
  "grid h-full w-full border-b border-border/80 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted";
const VIRTUAL_HEAD_CLASS =
  "flex h-full min-w-0 items-center px-2 text-start text-sm font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0";
const VIRTUAL_CELL_CLASS =
  "flex h-full min-w-0 items-center overflow-hidden px-2 text-sm whitespace-nowrap [&:has([role=checkbox])]:pe-0";

const DataTableVirtualSheet = cc<DataTableVirtualSheetProps>((props) => {
  const { revision } = props;
  const sheet = useDataTableVirtualSheet(props);

  return (
    <div
      data-slot="table-container"
      class="relative w-full min-w-0 overflow-x-auto"
    >
      <div data-slot="table" class="w-full min-w-0 text-sm">
        <div
          data-slot="table-header"
          data-virtual-header=""
          class="sticky top-0 z-10 border-b bg-muted/50"
        >
          <For each={sheet.headerGroups.value}>
            {(headerGroup) => (
              <div
                role="row"
                data-slot="table-row"
                class={cn(VIRTUAL_ROW_CLASS, "border-b-0")}
                style={sheet.headerRowStyle.value}
              >
                <For
                  each={(revision.value, headerGroup.headers)}
                >
                  {(header) => (
                    <div
                      role="columnheader"
                      data-slot="table-head"
                      data-column-id={header.column.id}
                      class={VIRTUAL_HEAD_CLASS}
                    >
                      {header.isPlaceholder ? null : (
                        <DataTableFlexRender header={header} />
                      )}
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
        <div data-slot="table-body">
          <div data-slot="data-table-virtual-body">
            <Virtual
              each={sheet.rows.value}
              itemHeight={props.itemHeight}
              containerHeight={props.containerHeight}
              overscan={props.overscan}
              minRendered={props.minRendered}
              fallback={
                <div
                  class="flex h-24 items-center justify-center text-center text-sm text-muted-foreground"
                  data-slot="data-table-empty"
                >
                  {props.empty}
                </div>
              }
            >
              {(row: DataTableRow) => (
                <div
                  role="row"
                  data-slot="table-row"
                  class={VIRTUAL_ROW_CLASS}
                  data-state={
                    (revision.value, row.getIsSelected() ? "selected" : undefined)
                  }
                  style={sheet.rowStyle.value}
                >
                  <For
                    each={(revision.value, row.getVisibleCells())}
                  >
                    {(cell) => (
                      <div
                        role="cell"
                        data-slot="table-cell"
                        data-column-id={cell.column.id}
                        class={VIRTUAL_CELL_CLASS}
                      >
                        <DataTableFlexRender cell={cell} />
                      </div>
                    )}
                  </For>
                </div>
              )}
            </Virtual>
          </div>
        </div>
      </div>
    </div>
  );
});

const DataTableHost = cc<DataTableHostProps>((props) => {
  const dataTable = useDataTable(props);
  const { table, revision, virtual } = dataTable;

  return (
    <div data-slot="data-table" class={cn("w-full", props.class)}>
      {dataTable.showToolbar ? (
        <div class="flex items-center gap-2 py-4">
          {dataTable.showFilter ? (
            <Input
              data-slot="data-table-filter"
              placeholder={props.filterPlaceholder}
              class="max-w-sm"
              value={dataTable.filterValue.value}
              oninput={dataTable.onFilterInput}
            />
          ) : null}
          {dataTable.showView ? <DataTableViewOptions table={table} /> : null}
        </div>
      ) : null}
      <div
        data-slot="data-table-frame"
        class="min-w-0 w-full overflow-hidden rounded-md border bg-card"
      >
        {virtual ? (
          <DataTableVirtualSheet
            table={table}
            revision={revision}
            empty={props.empty}
            itemHeight={virtual.itemHeight}
            containerHeight={virtual.containerHeight}
            overscan={virtual.overscan}
            minRendered={virtual.minRendered}
          />
        ) : (
          <Table>
            <TableHeader>
              <For each={dataTable.headerGroups.value}>
                {(headerGroup) => (
                  <TableRow>
                    <For
                      each={(revision.value, headerGroup.headers)}
                    >
                      {(header) => (
                        <TableHead
                          colSpan={header.colSpan}
                          data-column-id={header.column.id}
                        >
                          {header.isPlaceholder ? null : (
                            <DataTableFlexRender header={header} />
                          )}
                        </TableHead>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </TableHeader>
            <TableBody>
              <For
                each={dataTable.rows.value}
                fallback={
                  <TableRow>
                    <TableCell
                      colSpan={dataTable.emptyColSpan.value}
                      class="h-24 text-center"
                      data-slot="data-table-empty"
                    >
                      {props.empty}
                    </TableCell>
                  </TableRow>
                }
              >
                {(row) => (
                  <TableRow
                    data-state={
                      (revision.value, row.getIsSelected() ? "selected" : undefined)
                    }
                  >
                    <For
                      each={(revision.value, row.getVisibleCells())}
                    >
                      {(cell) => (
                        <TableCell data-column-id={cell.column.id}>
                          <DataTableFlexRender cell={cell} />
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
        )}
      </div>
      {dataTable.hidePagination ? null : (
        <DataTablePagination table={table} pageSizes={props.pageSizes} />
      )}
    </div>
  );
});

/**
 * ColumnDef/Table are invariant in the row type. The host only ever renders
 * `columns` against the matching `data` array, so widening TData to RowData is
 * sound at this boundary.
 */
export function DataTable<TData extends RowData>(
  props: DataTableProps<TData>,
): SinwanNode {
  return (
    <DataTableHost
      columns={props.columns as ReadonlyArray<DataTableColumnDef>}
      data={props.data as RowData[]}
      filterColumnId={props.filterColumnId}
      filterPlaceholder={props.filterPlaceholder ?? "Filter..."}
      getRowId={props.getRowId as DataTableHostProps["getRowId"]}
      empty={props.empty ?? "No results."}
      class={props.class}
      hideToolbar={props.hideToolbar ?? false}
      hidePagination={props.hidePagination ?? false}
      hideViewOptions={props.hideViewOptions ?? false}
      pageSizes={props.pageSizes}
      virtual={props.virtual}
    />
  );
}
