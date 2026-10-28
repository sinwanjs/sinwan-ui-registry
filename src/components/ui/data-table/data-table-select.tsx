import { cc, type SinwanNode } from "sinwan/component";
import type { RowData } from "@tanstack/table-core";

import { Checkbox } from "../checkbox";
import {
  type DataTableInstance,
  type DataTableRow,
} from "./data-table-features";
import { useDataTableSelectAll, useDataTableSelectRow } from "./useDataTable";

const DataTableSelectAllHost = cc<{ table: DataTableInstance }>(({ table }) => {
  const selectAll = useDataTableSelectAll(table);
  return (
    <Checkbox
      aria-label="Select all"
      checked={selectAll.checked.value}
      indeterminate={selectAll.indeterminate.value}
      onCheckedChange={selectAll.toggle}
    />
  );
});

const DataTableSelectRowHost = cc<{ row: DataTableRow }>(({ row }) => {
  const selectRow = useDataTableSelectRow(row);
  return (
    <Checkbox
      aria-label="Select row"
      checked={selectRow.checked.value}
      onCheckedChange={selectRow.toggle}
    />
  );
});

export function DataTableSelectAll<TData extends RowData>(props: {
  table: DataTableInstance<TData>;
}): SinwanNode {
  return <DataTableSelectAllHost table={props.table as DataTableInstance} />;
}

export function DataTableSelectRow<TData extends RowData>(props: {
  row: DataTableRow<TData>;
}): SinwanNode {
  return <DataTableSelectRowHost row={props.row as DataTableRow} />;
}
