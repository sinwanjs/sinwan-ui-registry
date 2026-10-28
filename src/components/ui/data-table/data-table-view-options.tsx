import { cc, type SinwanNode } from "sinwan/component";
import { For } from "sinwan/control-flow";
import { Settings2 } from "lucide";
import type { RowData } from "@tanstack/table-core";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "../button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  type DataTableColumn,
  type DataTableInstance,
} from "./data-table-features";
import {
  useDataTableColumnToggle,
  useDataTableViewOptions,
  type DataTableViewOptionsProps,
} from "./useDataTable";

const DataTableColumnToggle = cc<{ column: DataTableColumn }>((props) => {
  const toggle = useDataTableColumnToggle(props.column);
  return (
    <DropdownMenuCheckboxItem
      class="capitalize"
      checked={toggle.checked.value}
      onCheckedChange={toggle.setVisible}
    >
      {props.column.id}
    </DropdownMenuCheckboxItem>
  );
});

const DataTableViewOptionsHost = cc<{ table: DataTableInstance }>(
  ({ table }) => {
    const viewOptions = useDataTableViewOptions(table);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          class={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "ms-auto gap-1",
          )}
        >
          <Icon icon={Settings2} class="size-4" />
          View
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <For each={viewOptions.columns.value}>
            {(column) => <DataTableColumnToggle column={column} />}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

export function DataTableViewOptions<TData extends RowData>(
  props: DataTableViewOptionsProps<TData>,
): SinwanNode {
  return <DataTableViewOptionsHost table={props.table as DataTableInstance} />;
}
