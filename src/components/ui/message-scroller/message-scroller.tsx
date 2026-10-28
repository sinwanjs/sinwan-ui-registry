import { cc, type SinwanComponent, type SinwanNode } from "sinwan/component";
import { ArrowDown } from "lucide";

import { Icon } from "../../../lib/icons";
import { cn } from "../../../lib/utils";
import { Button, type ButtonProps } from "../button";
import {
  useMessageScrollerButton,
  useMessageScrollerContent,
  useMessageScrollerRoot,
  useMessageScrollerViewport,
  type MessageScrollerDirection,
  type MessageScrollerProviderProps,
  type MessageScrollerViewportProps,
} from "./useMessageScroller";

export const MessageScrollerProvider: SinwanComponent<MessageScrollerProviderProps> =
  cc(({ children, initialStickToBottom }) => {
    useMessageScrollerRoot({ initialStickToBottom });

    return <>{children}</>;
  });

export type MessageScrollerProps = JSX.IntrinsicElements["div"];

export function MessageScroller({
  class: className,
  ...props
}: MessageScrollerProps) {
  return (
    <div
      data-slot="message-scroller"
      class={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export const MessageScrollerViewport: SinwanComponent<MessageScrollerViewportProps> =
  cc(({ class: className, onscroll, children, ...props }) => {
    const viewport = useMessageScrollerViewport({
      get onscroll() {
        return onscroll;
      },
    });

    return (
      <div
        data-slot="message-scroller-viewport"
        class={cn(
          "size-full min-h-0 min-w-0 scroll-fade-b scrollbar-modern overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-none",
          className,
        )}
        ref={viewport.viewportRef}
        onscroll={viewport.onScroll}
        {...props}
      >
        {children as SinwanNode}
        <div
          data-slot="message-scroller-sentinel"
          class="h-px w-full shrink-0"
          ref={viewport.sentinelRef}
        />
      </div>
    );
  });

export type MessageScrollerContentProps = JSX.IntrinsicElements["div"];

export const MessageScrollerContent: SinwanComponent<MessageScrollerContentProps> =
  cc(({ class: className, children, ...props }) => {
    const content = useMessageScrollerContent();

    return (
      <div
        data-slot="message-scroller-content"
        class={cn("flex h-max min-h-full flex-col gap-6", className)}
        ref={content.contentRef}
        {...props}
      >
        {children}
      </div>
    );
  });

export type MessageScrollerItemProps = JSX.IntrinsicElements["div"] & {
  scrollAnchor?: boolean;
};

export function MessageScrollerItem({
  class: className,
  scrollAnchor = false,
  ...props
}: MessageScrollerItemProps) {
  return (
    <div
      data-slot="message-scroller-item"
      data-scroll-anchor={scrollAnchor ? "" : undefined}
      class={cn(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className,
      )}
      {...props}
    />
  );
}

export type MessageScrollerButtonProps = ButtonProps & {
  direction?: MessageScrollerDirection;
};

export const MessageScrollerButton: SinwanComponent<MessageScrollerButtonProps> =
  cc(({
    direction = "end",
    class: className,
    children,
    variant = "secondary",
    size = "icon-sm",
    ...props
  }) => {
    const button = useMessageScrollerButton({
      get direction() {
        return direction;
      },
    });

    return (
      <Button
        data-slot="message-scroller-button"
        data-direction={direction}
        data-variant={variant}
        data-size={size}
        data-active={button.active.value ? "true" : "false"}
        aria-hidden={button.active.value ? undefined : "true"}
        tabIndex={button.active.value ? 0 : -1}
        variant={variant}
        size={size}
        class={cn(
          "absolute left-1/2 z-10 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full data-[direction=start]:[&_svg]:rotate-180",
          className,
        )}
        onclick={button.onClick}
        {...props}
      >
        {children ?? (
          <>
            <Icon icon={ArrowDown} />
            <span class="sr-only">
              {direction === "end" ? "Scroll to end" : "Scroll to start"}
            </span>
          </>
        )}
      </Button>
    );
  });
