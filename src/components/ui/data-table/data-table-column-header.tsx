import { cc, type SinwanNode } from "sinwan/component";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide";
import type { RowData } from "@tanstack/table-core";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { type DataTableColumn } from "./data-table-features";
import {
  useDataTableColumnHeader,
  type DataTableColumnHeaderHostProps,
  type DataTableColumnHeaderProps,
} from "./useDataTable";

const DataTableColumnHeaderHost = cc<DataTableColumnHeaderHostProps>(
  ({ column, title, class: className }) => {
    const header = useDataTableColumnHeader(column);
    if (!header.canSort) {
      return (
        <div class={cn("text-sm font-medium", className)} data-slot="data-table-column-title">
          {title}
        </div>
      );
    }

    return (
      <div class={cn("flex items-center gap-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger
            class={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ms-3 h-8 gap-1",
            )}
          >
            <span>{title}</span>
            {header.sorted.value === "desc" ? (
              <Icon icon={ArrowDown} class="size-4" />
            ) : header.sorted.value === "asc" ? (
              <Icon icon={ArrowUp} class="size-4" />
            ) : (
              <Icon icon={ChevronsUpDown} class="size-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onclick={header.sortAscending}>
              <Icon icon={ArrowUp} class="size-4" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onclick={header.sortDescending}>
              <Icon icon={ArrowDown} class="size-4" />
              Desc
            </DropdownMenuItem>
            {header.canHide ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onclick={header.hide}>
                  <Icon icon={EyeOff} class="size-4" />
                  Hide
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

export function DataTableColumnHeader<TData extends RowData, TValue>(
  props: DataTableColumnHeaderProps<TData, TValue>,
): SinwanNode {
  return (
    <DataTableColumnHeaderHost
      column={props.column as DataTableColumn}
      title={props.title}
      class={props.class}
    />
  );
}
