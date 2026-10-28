import {
  cc,
  getRawProps,
  type SinwanComponent,
  type SinwanElement,
  type SinwanNode,
} from "sinwan/component";
import { Dynamic, Show } from "sinwan/control-flow";
import { resolve } from "sinwan/reactivity";
import { Check } from "lucide";

import { Icon } from "../../../lib/icons";
import { isSinwanElement } from "sinwan-ui-core/types";
import { cn } from "../../../lib/utils";
import { buttonVariants, type ButtonProps } from "../button";
import {
  useQuestionnaire,
  useQuestionnaireChoice,
  useQuestionnaireDescription,
  useQuestionnaireError,
  useQuestionnaireInput,
  useQuestionnaireItem,
  useQuestionnaireItemRoot,
  useQuestionnaireNavigation,
  useQuestionnaireRoot,
  type QuestionnaireChoiceProps,
  type QuestionnaireInputProps,
  type QuestionnaireItemProps,
  type QuestionnaireNavigationAction,
  type QuestionnaireNavigationState,
  type QuestionnaireProgressState,
  type QuestionnaireProps,
  type QuestionnaireRender,
  type QuestionnaireShortcutMode,
} from "./useQuestionnaire";

type ButtonStyle = Pick<ButtonProps, "size" | "variant">;

function flag(on: boolean): "" | undefined {
  return on ? "" : undefined;
}

type PartRender = (
  partProps: Record<string, unknown>,
  partState: unknown,
) => SinwanNode;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function liveState(read: () => unknown): unknown {
  const initial = read();
  if (!isRecord(initial)) return initial;
  const view: Record<string, unknown> = {};
  for (const key of Object.keys(initial)) {
    Object.defineProperty(view, key, {
      enumerable: true,
      get: () => {
        const current = read();
        return isRecord(current) ? current[key] : undefined;
      },
    });
  }
  return view;
}

function hostedTag(
  render: unknown,
  fallback: string,
): string | SinwanElement["tag"] {
  if (!isSinwanElement(render as SinwanNode)) return fallback;
  const tag = (render as SinwanElement).tag;
  if (typeof tag === "string" || typeof tag === "function") return tag;
  return fallback;
}

const QuestionnaireHost = cc(function QuestionnaireHost(props: {
  tag: string;
  partProps: Record<string, unknown>;
  children?: SinwanNode;
  render?: unknown;
  state?: unknown;
}) {
  const renderValue = resolve(props.render);
  const renderFn = typeof renderValue === "function" ? renderValue : false;
  const hosted = isSinwanElement(renderValue as SinwanNode)
    ? (renderValue as SinwanElement)
    : null;
  const hostedClass =
    hosted && typeof hosted.props.class === "string" ? hosted.props.class : undefined;
  const partClass =
    typeof props.partProps.class === "string" ? props.partProps.class : undefined;
  return (
    <Show
      when={renderFn}
      fallback={
        <Dynamic
          component={hostedTag(renderValue, props.tag)}
          {...(hosted?.props ?? {})}
          {...props.partProps}
          class={cn(hostedClass, partClass)}
        >
          {props.children}
        </Dynamic>
      }
    >
      {(render) =>
        (render as PartRender)(
          { ...props.partProps, children: props.children },
          liveState(() => props.state),
        )
      }
    </Show>
  );
});

const choiceClass = [
  "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none",
  "hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/50",
  "data-invalid:border-destructive dark:bg-input/20 data-checked:border-primary/40 data-checked:bg-muted dark:data-checked:bg-muted",
  "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
].join(" ");

const inputClass = [
  "h-8 min-h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,background-color] outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm",
  "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
].join(" ");

const Questionnaire = cc(function Questionnaire(props: QuestionnaireProps) {
  const root = useQuestionnaireRoot(props);

  return (
    <form
      {...root.rest}
      ref={root.setForm}
      data-slot="questionnaire"
      data-current={root.progress.value.current}
      data-total={root.progress.value.total}
      data-first={() => flag(root.progress.value.first)}
      data-last={() => flag(root.progress.value.last)}
      data-shortcuts={root.shortcuts.value ?? undefined}
      noValidate={props.noValidate !== false}
      class={cn("flex w-full min-w-0 flex-col gap-4", props.class)}
      onkeydown={root.onKeyDown}
      onsubmit={root.onSubmit}
      onreset={root.onReset}
    >
      {props.children}
    </form>
  );
});

type QuestionnaireProgressProps = Omit<
  JSX.IntrinsicElements["div"],
  "children"
> & {
  children?: SinwanNode;
  render?: QuestionnaireRender<QuestionnaireProgressState>;
};

const QuestionnaireProgress = cc(function QuestionnaireProgress(
  props: QuestionnaireProgressProps,
) {
  const root = useQuestionnaire("QuestionnaireProgress");
  const raw = getRawProps(props);
  const {
    children: _children,
    class: _className,
    render: _render,
    ...rest
  } = raw;

  return () => {
    const state = root.progress.value;
    const text =
      state.total > 0 ? `Question ${state.current} of ${state.total}` : undefined;
    const partProps: Record<string, unknown> = {
      ...rest,
      "data-slot": "questionnaire-progress",
      role: "progressbar",
      "aria-label": props["aria-label"] ?? "Questionnaire progress",
      "aria-live": "polite",
      "aria-valuemin": state.total ? 1 : undefined,
      "aria-valuemax": state.total || undefined,
      "aria-valuenow": state.total ? state.current : undefined,
      "aria-valuetext": text,
      "data-current": state.current,
      "data-total": state.total,
      "data-first": flag(state.first),
      "data-last": flag(state.last),
      class: cn(
        "min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums",
        props.class,
      ),
    };
    if (props.render) {
      return (
        <QuestionnaireHost
          tag="div"
          partProps={partProps}
          render={props.render}
          state={state}
        >
          {props.children ?? text}
        </QuestionnaireHost>
      );
    }
    return (
      <div {...partProps}>
        {props.children ?? text}
      </div>
    );
  };
});

const QuestionnaireItem = cc(function QuestionnaireItem(
  props: QuestionnaireItemProps,
) {
  const { rest, item, setFieldset } = useQuestionnaireItemRoot(props);

  return (
    <fieldset
      {...rest}
      ref={setFieldset}
      data-slot="questionnaire-item"
      data-active={() => flag(item.active.value)}
      data-status={item.status.value}
      data-required={() => flag(item.required.value)}
      data-multiple={() => flag(item.multiple.value)}
      data-disabled={() => flag(item.disabled.value)}
      data-invalid={() => flag(item.showInvalid.value)}
      aria-invalid={item.showInvalid.value ? "true" : undefined}
      hidden={!item.active.value}
      inert={!item.active.value}
      disabled={item.disabled.value}
      tabIndex={-1}
      class={cn(
        "flex min-w-0 flex-col gap-4 border-0 p-0 outline-none",
        props.class,
      )}
    >
      {props.children}
    </fieldset>
  );
});

type QuestionnaireTitleProps = Omit<JSX.IntrinsicElements["legend"], "children"> & {
  children?: SinwanNode;
  render?: QuestionnaireRender<Record<string, never>>;
};

const QuestionnaireTitle = cc(function QuestionnaireTitle(
  props: QuestionnaireTitleProps,
) {
  useQuestionnaireItem("QuestionnaireTitle");
  const raw = getRawProps(props);
  const { children: _children, class: _className, render: _render, ...rest } = raw;
  const partProps: Record<string, unknown> = {
    ...rest,
    "data-slot": "questionnaire-title",
    class: cn(
      "font-heading text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
      props.class,
    ),
  };
  return () => {
    if (props.render) {
      return (
        <QuestionnaireHost tag="legend" partProps={partProps} render={props.render}>
          {props.children}
        </QuestionnaireHost>
      );
    }
    return (
      <legend {...partProps}>
        {props.children}
      </legend>
    );
  };
});

type QuestionnaireDescriptionProps = Omit<JSX.IntrinsicElements["p"], "children"> & {
  children?: SinwanNode;
  render?: QuestionnaireRender<Record<string, never>>;
};

const QuestionnaireDescription = cc(function QuestionnaireDescription(
  props: QuestionnaireDescriptionProps,
) {
  const raw = getRawProps(props);
  const { children: _children, class: _className, render: _render, id, ...rest } =
    raw;
  const descriptionId = useQuestionnaireDescription(id);
  const partProps: Record<string, unknown> = {
    ...rest,
    id: descriptionId,
    "data-slot": "questionnaire-description",
    class: cn("text-sm text-pretty text-muted-foreground", props.class),
  };
  if (props.render) {
    return (
      <QuestionnaireHost tag="p" partProps={partProps} render={props.render}>
        {props.children}
      </QuestionnaireHost>
    );
  }
  return <p {...partProps}>{props.children}</p>;
});

type QuestionnaireChoicesProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: SinwanNode;
  render?: QuestionnaireRender<{ shortcuts: QuestionnaireShortcutMode | null }>;
};

const QuestionnaireChoices = cc(function QuestionnaireChoices(
  props: QuestionnaireChoicesProps,
) {
  useQuestionnaireItem("QuestionnaireChoices");
  const root = useQuestionnaire("QuestionnaireChoices");
  const raw = getRawProps(props);
  const { children: _children, class: _className, render: _render, ...rest } = raw;
  const partProps: Record<string, unknown> = {
    ...rest,
    "data-slot": "questionnaire-choices",
    "data-shortcuts": () => root.shortcuts.value ?? undefined,
    class: cn("group/questionnaire-choices grid min-w-0 gap-2", props.class),
  };
  if (props.render) {
    return () =>
      <QuestionnaireHost
        tag="div"
        partProps={partProps}
        render={props.render}
        state={{ shortcuts: root.shortcuts.value }}
      >
        {props.children}
      </QuestionnaireHost>
  }
  return <div {...partProps}>{props.children}</div>;
});

const QuestionnaireChoice = cc(function QuestionnaireChoice(
  props: QuestionnaireChoiceProps,
) {
  const choice = useQuestionnaireChoice(props);

  const field = (
    <>
      <input
        ref={choice.setInput}
        data-slot="questionnaire-choice-input"
        class="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        type={choice.type.value}
        name={choice.name.value}
        value={props.value}
        checked={choice.checked.value}
        disabled={choice.disabled.value}
        required={choice.required.value}
        aria-invalid={choice.invalid.value ? "true" : undefined}
        aria-keyshortcuts={choice.keyShortcuts.value}
        onchange={choice.onChange}
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        class="pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary"
      >
        <Show
          when={choice.type.value === "checkbox"}
          fallback={
            <span
              data-slot="questionnaire-choice-indicator-dot"
              class="hidden size-2 rounded-full bg-primary-foreground group-data-checked/questionnaire-choice:block"
            />
          }
        >
          <Icon
            icon={Check}
            size={14}
            data-slot="questionnaire-choice-indicator-check"
            class="hidden size-3.5 group-data-checked/questionnaire-choice:block"
          />
        </Show>
      </span>
      <span
        data-slot="questionnaire-choice-label"
        class="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {props.children}
      </span>
      <span
        data-slot="questionnaire-choice-shortcut"
        aria-hidden="true"
        hidden={choice.shortcut.value == null}
        class="pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-md border border-input bg-background font-mono text-[0.625rem] leading-none font-medium text-muted-foreground group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
      >
        {choice.shortcut.value ?? ""}
      </span>
    </>
  );

  const partProps: Record<string, unknown> = {
    ...choice.rest,
    "data-slot": "questionnaire-choice",
    "data-type": () => choice.type.value,
    "data-state": () => (choice.checked.value ? "checked" : "unchecked"),
    "data-checked": () => flag(choice.checked.value),
    "data-unchecked": () => (choice.checked.value ? undefined : ""),
    "data-disabled": () => flag(choice.disabled.value),
    "data-invalid": () => flag(choice.invalid.value),
    "data-shortcut": () => choice.shortcut.value ?? undefined,
    class: cn(choiceClass, props.class),
  };

  if (props.render) {
    return () => (
      <QuestionnaireHost
        tag="label"
        partProps={partProps}
        render={props.render}
        state={choice.state.value}
      >
        {field}
      </QuestionnaireHost>
    );
  }
  return <label {...partProps}>{field}</label>;
});

const QuestionnaireInput = cc(function QuestionnaireInput(
  props: QuestionnaireInputProps,
) {
  const input = useQuestionnaireInput(props);

  const partProps: Record<string, unknown> = {
    ...input.rest,
    id: input.id,
    "data-slot": "questionnaire-input",
    type: input.type,
    name: () => (input.selected.value ? input.item.name : ""),
    disabled: () => input.disabled.value,
    "aria-invalid": () => (input.item.showInvalid.value ? "true" : undefined),
    "aria-keyshortcuts": () =>
      !input.disabled.value && input.filled.value && input.selected.value
        ? "Enter"
        : undefined,
    "data-filled": () => flag(input.filled.value),
    "data-empty": () => (input.filled.value ? undefined : ""),
    "data-disabled": () => flag(input.disabled.value),
    "data-invalid": () => flag(input.item.showInvalid.value),
    value: input.value,
    defaultValue: input.defaultValue,
    class: cn(inputClass, props.class),
    ref: input.setInput,
    onchange: input.onChange,
  };
  return (
    <div
      data-slot="questionnaire-input-wrapper"
      class="group/questionnaire-input relative w-full min-w-0"
    >
      {props.render
        ? (
            <QuestionnaireHost
              tag="input"
              partProps={partProps}
              render={props.render}
              state={input.state.value}
            />
          )
        : <input {...partProps} />}
    </div>
  );
});

type QuestionnaireErrorProps = Omit<JSX.IntrinsicElements["p"], "children"> & {
  children?: SinwanNode;
  render?: QuestionnaireRender<{ invalid: boolean }>;
};

const QuestionnaireError = cc(function QuestionnaireError(
  props: QuestionnaireErrorProps,
) {
  const raw = getRawProps(props);
  const { children: _children, class: _className, render: _render, id, ...rest } =
    raw;
  const error = useQuestionnaireError(id);

  return () => {
    const invalid = error.invalid.value;
    const message = error.message(props.children);
    const partProps: Record<string, unknown> = {
      ...rest,
      id: error.id,
      "data-slot": "questionnaire-error",
      "data-invalid": flag(invalid),
      role: invalid ? "alert" : undefined,
      hidden: !invalid,
      class: cn("mt-2 text-sm text-destructive", props.class),
    };
    if (props.render) {
      return (
        <QuestionnaireHost
          tag="p"
          partProps={partProps}
          render={props.render}
          state={{ invalid }}
        >
          {message}
        </QuestionnaireHost>
      );
    }
    return <p {...partProps}>{message}</p>;
  };
});

type QuestionnaireActionsProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: SinwanNode;
};

function QuestionnaireActions(props: QuestionnaireActionsProps) {
  const { class: className, ...rest } = props;
  return (
    <div
      {...rest}
      data-slot="questionnaire-actions"
      class={cn(
        "grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8",
        className,
      )}
    />
  );
}

type NavigationButtonProps = Omit<
  JSX.IntrinsicElements["button"],
  "children" | "type"
> &
  ButtonStyle & {
    children?: SinwanNode;
    render?: QuestionnaireRender<QuestionnaireNavigationState>;
  };

function navigationButton(
  action: QuestionnaireNavigationAction,
  slot: string,
  label: string,
  column: string,
  options: {
    variant: NonNullable<ButtonStyle["variant"]>;
    type: "button" | "submit";
  },
) {
  return cc(function NavigationButton(props: NavigationButtonProps) {
    const navigation = useQuestionnaireNavigation(action);
    const raw = getRawProps(props);
    const {
      children: _children,
      class: _className,
      size: _size,
      variant: _variant,
      render: _render,
      disabled: _disabled,
      onclick: _onclick,
      ...rest
    } = raw;
    const size = props.size ?? "default";
    const variant = props.variant ?? options.variant;

    return () => {
      const visible = navigation.visible.value;
      const disabled = props.disabled === true;
      const state: QuestionnaireNavigationState = {
        visible,
        disabled,
        shortcut: visible && !disabled && navigation.shortcut ? "Enter" : null,
        status: navigation.status.value,
      };
      const partProps: Record<string, unknown> = {
        ...rest,
        "data-slot": slot,
        "data-size": size,
        "data-variant": variant,
        "data-visible": flag(visible),
        "data-hidden": visible ? undefined : "",
        "data-disabled": flag(disabled),
        "data-shortcut": state.shortcut ?? undefined,
        "data-status": state.status ?? undefined,
        type: options.type,
        disabled,
        hidden: !visible,
        inert: visible ? undefined : true,
        "aria-hidden": visible ? undefined : true,
        "aria-keyshortcuts": state.shortcut ?? undefined,
        tabIndex: visible ? props.tabIndex : -1,
        class: cn(
          buttonVariants({ size, variant }),
          column,
          "min-h-11 sm:min-h-0",
          props.class,
        ),
        onclick: (event: MouseEvent) => {
          const notify = props.onclick as
            | ((clickEvent: MouseEvent) => void)
            | undefined;
          notify?.(event);
          if (event.defaultPrevented) return;
          navigation.activate();
        },
      };
      const children = props.children ?? label;
      if (props.render) {
        return (
          <QuestionnaireHost
            tag="button"
            partProps={partProps}
            render={props.render}
            state={state}
          >
            {children}
          </QuestionnaireHost>
        );
      }
      return <button {...partProps}>{children}</button>;
    };
  });
}

const QuestionnairePrevious = navigationButton(
  "previous",
  "questionnaire-previous",
  "Previous",
  "col-start-1 row-start-1 justify-self-start",
  { variant: "outline", type: "button" },
);

const QuestionnaireSkip = navigationButton(
  "skip",
  "questionnaire-skip",
  "Skip",
  "col-start-2 row-start-1 justify-self-end",
  { variant: "outline", type: "button" },
);

const QuestionnaireNext = navigationButton(
  "next",
  "questionnaire-next",
  "Next",
  "col-start-3 row-start-1 justify-self-end",
  { variant: "default", type: "button" },
);

const QuestionnaireSubmit = navigationButton(
  "submit",
  "questionnaire-submit",
  "Submit",
  "col-start-3 row-start-1 justify-self-end",
  { variant: "default", type: "submit" },
);

export type QuestionnaireChoiceDescriptionProps = JSX.IntrinsicElements["span"];

const QuestionnaireChoiceDescription: SinwanComponent<QuestionnaireChoiceDescriptionProps> =
  cc(function QuestionnaireChoiceDescription(
    props: QuestionnaireChoiceDescriptionProps,
  ) {
    const { class: className, ...rest } = props;
    return (
      <span
        {...rest}
        data-slot="questionnaire-choice-description"
        class={cn("text-muted-foreground", className)}
      />
    );
  },
);

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
