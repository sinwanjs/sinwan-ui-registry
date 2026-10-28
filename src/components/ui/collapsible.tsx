import type { SinwanNode } from "sinwan/component";
import { cn } from "../../lib/utils";
import {
  CollapsibleContent as CollapsibleContentPrimitive,
  CollapsibleRoot,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "sinwan-ui-core/overlay";

type CollapsibleProps = {
  children?: SinwanNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  class?: string;
};

function Collapsible(props: CollapsibleProps) {
  return <CollapsibleRoot {...props} />;
}

type CollapsibleTriggerProps = {
  children?: SinwanNode;
  class?: string;
  asChild?: boolean;
};

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return <CollapsibleTriggerPrimitive {...props} />;
}

type CollapsibleContentProps = {
  children?: SinwanNode;
  class?: string;
};

function CollapsibleContent({
  class: className,
  children,
}: CollapsibleContentProps) {
  return (
    <CollapsibleContentPrimitive class="overflow-hidden duration-200 data-open:animate-collapsible-down data-closed:animate-collapsible-up data-closed:!fill-mode-forwards">
      <div class={cn(className)}>{children}</div>
    </CollapsibleContentPrimitive>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
