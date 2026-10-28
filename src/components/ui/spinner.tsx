import { Loader2 } from "lucide";

import { Icon } from "../../lib/icons";
import { cn } from "../../lib/utils";

function Spinner({
  class: className,
  ...props
}: {
  class?: string;
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
  role?: string;
  [key: string]: unknown;
}) {
  return (
    <Icon
      icon={Loader2}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      class={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
