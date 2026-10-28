import { cn } from "../../lib/utils";

function MessageGroup({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="message-group"
      class={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

function Message({
  class: className,
  align = "start",
  ...props
}: JSX.IntrinsicElements["div"] & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      class={cn(
        "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse",
        className,
      )}
      {...props}
    />
  );
}

function MessageAvatar({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="message-avatar"
      class={cn(
        "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="message-content"
      class={cn(
        "flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className,
      )}
      {...props}
    />
  );
}

function MessageHeader({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="message-header"
      class={cn(
        "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
        className,
      )}
      {...props}
    />
  );
}

function MessageFooter({
  class: className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      data-slot="message-footer"
      class={cn(
        "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
};
