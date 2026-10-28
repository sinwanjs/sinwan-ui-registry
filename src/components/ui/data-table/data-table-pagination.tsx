import { cc, type SinwanNode } from "sinwan/component";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide";
import type { RowData } from "@tanstack/table-core";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Button } from "../button";
import { Label } from "../label";
import { NativeSelect, NativeSelectOption } from "../native-select";
import { type DataTableInstance } from "./data-table-features";
import {
  DEFAULT_DATA_TABLE_PAGE_SIZES,
  useDataTablePagination,
  type DataTablePaginationHostProps,
  type DataTablePaginationProps,
} from "./useDataTable";

const DataTablePaginationHost = cc<DataTablePaginationHostProps>(
  ({ table, pageSizes, class: className }) => {
    const pagination = useDataTablePagination(table);
    const { revision } = pagination;

    return (
      <div
        data-slot="data-table-pagination"
        class={cn(
          "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div
          class="flex-1 text-sm text-muted-foreground"
          data-slot="data-table-selected-count"
        >
          {pagination.selectedText.value}
        </div>
        {(revision.value, (
            <div class="flex flex-wrap items-center gap-4 lg:gap-6">
              <div class="flex items-center gap-2">
                <Label class="text-sm font-medium whitespace-nowrap">
                  Rows per page
                </Label>
                <NativeSelect
                  data-slot="data-table-page-size"
                  aria-label="Rows per page"
                  size="sm"
                  value={pagination.pageSize.value}
                  onchange={pagination.onPageSizeChange}
                >
                  {pageSizes.map((size) => (
                    <NativeSelectOption value={String(size)}>
                      {size}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div
                class="text-sm font-medium whitespace-nowrap"
                data-slot="data-table-page-status"
              >
                {pagination.pageStatus.value}
              </div>
              <div class="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  data-slot="data-table-first-page"
                  aria-label="Go to first page"
                  disabled={!pagination.canPreviousPage.value}
                  onclick={pagination.firstPage}
                >
                  <Icon icon={ChevronsLeft} class="rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  data-slot="data-table-previous-page"
                  aria-label="Go to previous page"
                  disabled={!pagination.canPreviousPage.value}
                  onclick={pagination.previousPage}
                >
                  <Icon icon={ChevronLeft} class="rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  data-slot="data-table-next-page"
                  aria-label="Go to next page"
                  disabled={!pagination.canNextPage.value}
                  onclick={pagination.nextPage}
                >
                  <Icon icon={ChevronRight} class="rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  data-slot="data-table-last-page"
                  aria-label="Go to last page"
                  disabled={!pagination.canNextPage.value}
                  onclick={pagination.lastPage}
                >
                  <Icon icon={ChevronsRight} class="rtl:rotate-180" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    );
  },
);

export function DataTablePagination<TData extends RowData>(
  props: DataTablePaginationProps<TData>,
): SinwanNode {
  return (
    <DataTablePaginationHost
      table={props.table as DataTableInstance}
      pageSizes={props.pageSizes ?? DEFAULT_DATA_TABLE_PAGE_SIZES}
      class={props.class}
    />
  );
}
