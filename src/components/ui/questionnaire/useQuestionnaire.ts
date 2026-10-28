import {
  getRawProps,
  inject,
  onMounted,
  onUnmounted,
  provide,
  type InjectionKey,
  type SinwanElement,
  type SinwanNode,
} from "sinwan/component";
import { computed, effect, signal } from "sinwan/reactivity";

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

export type QuestionnaireShortcutMode = "letters" | "numbers";

export type QuestionnaireChoiceDefinition = {
  value: string;
  disabled?: boolean;
};

export type QuestionnaireItemDefinition = {
  name: string;
  required?: boolean;
  disabled?: boolean;
  choices?: readonly QuestionnaireChoiceDefinition[];
};

export type QuestionnaireCollection = {
  items: readonly QuestionnaireItemDefinition[];
  enabledItems: readonly QuestionnaireItemDefinition[];
  itemByName: ReadonlyMap<string, QuestionnaireItemDefinition>;
};

export type QuestionnaireProgressState = {
  current: number;
  total: number;
  first: boolean;
  last: boolean;
};

export type QuestionnaireNavigationState = {
  visible: boolean;
  disabled: boolean;
  shortcut: "Enter" | null;
  status: QuestionnaireItemStatus | null;
};

export type RenderedQuestionnaireItem = {
  name: string;
  disabled: boolean;
  required: boolean;
  choices: readonly { value: string; disabled: boolean }[];
};

export type QuestionnaireInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

export type QuestionnaireRender<State> =
  | SinwanElement
  | ((props: Record<string, unknown>, state: State) => SinwanNode);

export type QuestionnaireValue<T> = { readonly value: T };

export type QuestionnaireAnswerControl = {
  id: string;
  type: "choice" | "input";
  value: string;
  element: HTMLInputElement;
  inputType: string;
  disabled: boolean;
  ownDisabled: boolean;
};

export type QuestionnaireItemContext = {
  name: string;
  element: HTMLElement | null;
  required: QuestionnaireValue<boolean>;
  multiple: QuestionnaireValue<boolean>;
  disabled: QuestionnaireValue<boolean>;
  externalInvalid: QuestionnaireValue<boolean>;
  status: QuestionnaireValue<QuestionnaireItemStatus>;
  showInvalid: QuestionnaireValue<boolean>;
  active: QuestionnaireValue<boolean>;
  selected: QuestionnaireValue<string[]>;
  controls: QuestionnaireValue<QuestionnaireAnswerControl[]>;
  descriptionIds: QuestionnaireValue<string[]>;
  errorIds: QuestionnaireValue<string[]>;
  shortcutByValue: QuestionnaireValue<Map<string, string> | null>;
  shortcutById: QuestionnaireValue<Map<string, string>>;
  hasInput: QuestionnaireValue<boolean>;
  registerDefault: (id: string, selectedByDefault: boolean) => void;
  interact: (id: string, selected: boolean) => void;
  syncControlled: (id: string, selected: boolean) => void;
  upsertControl: (control: QuestionnaireAnswerControl) => void;
  removeControl: (id: string) => void;
  addDescription: (id: string) => void;
  removeDescription: (id: string) => void;
  addError: (id: string) => void;
  removeError: (id: string) => void;
  validate: () => boolean;
  focus: () => void;
  focusInvalid: () => void;
  reset: () => void;
  skip: () => void;
  moveAnswerFocus: (
    target: EventTarget | null,
    direction: "next" | "previous",
  ) => boolean;
  controlFromTarget: (
    target: EventTarget | null,
  ) => QuestionnaireAnswerControl | null;
  controlIsSelected: (control: QuestionnaireAnswerControl) => boolean;
  answerForShortcut: (key: string) => QuestionnaireAnswerControl | null;
  snapshot: () => RenderedQuestionnaireItem;
};

export type QuestionnaireContext = {
  activeName: QuestionnaireValue<string | null>;
  progress: QuestionnaireValue<QuestionnaireProgressState>;
  shortcuts: QuestionnaireValue<QuestionnaireShortcutMode | null>;
  activeStatus: QuestionnaireValue<QuestionnaireItemStatus | null>;
  activeRequired: QuestionnaireValue<boolean | null>;
  nativeValidation: QuestionnaireValue<boolean>;
  registerItem: (item: QuestionnaireItemContext) => void;
  unregisterItem: (item: QuestionnaireItemContext) => void;
  bumpDom: () => void;
  goNext: () => void;
  goPrevious: () => void;
  skipCurrent: () => void;
  flowNames: QuestionnaireValue<string[]>;
  definitions: () => readonly QuestionnaireItemDefinition[] | undefined;
};

export type QuestionnaireProps = Omit<
  JSX.IntrinsicElements["form"],
  "children" | "onsubmit" | "onreset"
> & {
  children?: SinwanNode;
  item?: string;
  defaultItem?: string;
  items?: readonly QuestionnaireItemDefinition[];
  onItemChange?: (item: string) => void;
  shortcuts?: QuestionnaireShortcutMode;
  onSubmit?: (event: Event) => void;
  onReset?: (event: Event) => void;
};

export type QuestionnaireRootReturn = {
  rest: Omit<
    QuestionnaireProps,
    | "children"
    | "class"
    | "item"
    | "defaultItem"
    | "items"
    | "onItemChange"
    | "shortcuts"
    | "onSubmit"
    | "onReset"
    | "onkeydown"
    | "noValidate"
    | "ref"
  >;
  progress: QuestionnaireValue<QuestionnaireProgressState>;
  shortcuts: QuestionnaireValue<QuestionnaireShortcutMode | null>;
  setForm: (element: HTMLFormElement | null) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onSubmit: (event: Event) => void;
  onReset: (event: Event) => void;
};

export type QuestionnaireItemProps = Omit<
  JSX.IntrinsicElements["fieldset"],
  "children" | "name"
> & {
  children?: SinwanNode;
  name: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
};

export type QuestionnaireItemRootReturn = {
  rest: Omit<
    QuestionnaireItemProps,
    | "children"
    | "class"
    | "name"
    | "required"
    | "multiple"
    | "disabled"
    | "invalid"
    | "onStatusChange"
    | "ref"
  >;
  item: QuestionnaireItemContext;
  setFieldset: (element: HTMLElement | null) => void;
};

export type QuestionnaireChoiceState = {
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  shortcut: string | null;
  type: "checkbox" | "radio";
};

export type QuestionnaireChoiceProps = Omit<
  JSX.IntrinsicElements["label"],
  "children"
> & {
  children?: SinwanNode;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onchange?: (event: Event) => void;
  render?: QuestionnaireRender<QuestionnaireChoiceState>;
};

export type QuestionnaireChoiceReturn = {
  rest: Omit<
    QuestionnaireChoiceProps,
    | "children"
    | "class"
    | "value"
    | "checked"
    | "defaultChecked"
    | "disabled"
    | "onchange"
    | "render"
  >;
  item: QuestionnaireItemContext;
  checked: QuestionnaireValue<boolean>;
  disabled: QuestionnaireValue<boolean>;
  invalid: QuestionnaireValue<boolean>;
  shortcut: QuestionnaireValue<string | null>;
  type: QuestionnaireValue<"checkbox" | "radio">;
  name: QuestionnaireValue<string>;
  required: QuestionnaireValue<boolean>;
  keyShortcuts: QuestionnaireValue<string | undefined>;
  state: QuestionnaireValue<QuestionnaireChoiceState>;
  setInput: (element: HTMLInputElement | null) => void;
  onChange: (event: Event) => void;
};

export type QuestionnaireInputState = {
  disabled: boolean;
  filled: boolean;
  invalid: boolean;
};

export type QuestionnaireInputProps = Omit<
  JSX.IntrinsicElements["input"],
  "children" | "name" | "type" | "form"
> & {
  type?: QuestionnaireInputType;
  render?: QuestionnaireRender<QuestionnaireInputState>;
};

export type QuestionnaireInputReturn = {
  rest: Omit<
    QuestionnaireInputProps,
    | "class"
    | "type"
    | "value"
    | "defaultValue"
    | "disabled"
    | "onchange"
    | "render"
    | "id"
  >;
  item: QuestionnaireItemContext;
  id: NonNullable<QuestionnaireInputProps["id"]>;
  type: QuestionnaireInputType;
  disabled: QuestionnaireValue<boolean>;
  filled: QuestionnaireValue<boolean>;
  selected: QuestionnaireValue<boolean>;
  value: (() => unknown) | undefined;
  defaultValue: unknown;
  state: QuestionnaireValue<QuestionnaireInputState>;
  setInput: (element: HTMLInputElement | null) => void;
  onChange: (event: Event) => void;
};

export type QuestionnaireErrorReturn = {
  id: string;
  invalid: QuestionnaireValue<boolean>;
  message: (children: SinwanNode | undefined) => SinwanNode;
};

export type QuestionnaireNavigationAction =
  | "previous"
  | "skip"
  | "next"
  | "submit";

export type QuestionnaireNavigationReturn = {
  visible: QuestionnaireValue<boolean>;
  status: QuestionnaireValue<QuestionnaireItemStatus | null>;
  shortcut: boolean;
  activate: () => void;
};

const TEXT_LIKE_INPUTS = new Set([
  "email",
  "password",
  "search",
  "tel",
  "text",
  "url",
]);

const NON_TEXT_ENTRY_INPUTS = new Set([
  "button",
  "checkbox",
  "radio",
  "reset",
  "submit",
]);

export function buildCollection(
  items: readonly QuestionnaireItemDefinition[] | undefined,
): QuestionnaireCollection | null {
  if (!items) return null;
  const itemByName = new Map(items.map((item) => [item.name, item]));
  return {
    items,
    enabledItems: items.filter((item) => !item.disabled),
    itemByName,
  };
}

export function resolveInitialItem(
  collection: QuestionnaireCollection | null,
  defaultItem: string | undefined,
): string | null {
  if (!collection) return defaultItem ?? null;
  if (defaultItem) {
    const match = collection.itemByName.get(defaultItem);
    if (match && !match.disabled) return match.name;
  }
  return collection.enabledItems[0]?.name ?? null;
}

export function shortcutAlphabet(
  mode: QuestionnaireShortcutMode | null | undefined,
): string[] {
  if (mode === "letters") {
    return Array.from({ length: 26 }, (_, index) =>
      String.fromCharCode(65 + index),
    );
  }
  if (mode === "numbers") return Array.from({ length: 9 }, (_, index) => String(index + 1));
  return [];
}

export function normalizeShortcutKey(
  key: string,
  mode: QuestionnaireShortcutMode,
): string | null {
  const normalized = mode === "letters" ? key.toUpperCase() : key;
  return shortcutAlphabet(mode).includes(normalized) ? normalized : null;
}

export function shortcutsForChoices(
  choices: readonly QuestionnaireChoiceDefinition[] | undefined,
  mode: QuestionnaireShortcutMode | null,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!choices || !mode) return map;
  const keys = shortcutAlphabet(mode);
  let index = 0;
  for (const choice of choices) {
    if (choice.disabled) continue;
    const key = keys[index];
    if (!key) break;
    map.set(choice.value, key);
    index += 1;
  }
  return map;
}

export function hasFilledValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => String(entry).trim().length > 0);
  }
  return value != null && String(value).trim().length > 0;
}

function isDomElement(target: EventTarget | null): target is Element {
  return (
    !!target &&
    typeof target === "object" &&
    "tagName" in target &&
    typeof (target as { tagName?: unknown }).tagName === "string"
  );
}

export function isInputElement(
  target: EventTarget | null,
): target is HTMLInputElement {
  return isDomElement(target) && target.tagName === "INPUT";
}

export function isTextEntryElement(target: EventTarget | null): boolean {
  if (!isDomElement(target)) return false;
  if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") return true;
  if (isInputElement(target)) {
    return !NON_TEXT_ENTRY_INPUTS.has(target.type);
  }
  return (
    "isContentEditable" in target &&
    (target as HTMLElement).isContentEditable === true
  );
}

export function isRadioElement(target: EventTarget | null): boolean {
  return isInputElement(target) && target.type === "radio";
}

export function isEmptyTextLikeInput(target: EventTarget | null): boolean {
  return (
    isInputElement(target) &&
    TEXT_LIKE_INPUTS.has(target.type) &&
    !hasFilledValue(target.value)
  );
}

export function compareElements(
  a: HTMLElement | null,
  b: HTMLElement | null,
): number {
  if (!a || !b || a === b) return 0;
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

export function joinIds(
  values: readonly (string | undefined | null | false)[],
): string | undefined {
  const joined = values.filter((value): value is string => Boolean(value)).join(" ");
  return joined.length > 0 ? joined : undefined;
}

export function defaultErrorMessage(required: boolean): string {
  return required
    ? "Choose an answer to continue."
    : "Choose an answer or skip this question.";
}

export function itemIsValid(input: {
  disabled: boolean;
  required: boolean;
  status: QuestionnaireItemStatus;
  externalInvalid: boolean;
}): boolean {
  if (input.disabled) return true;
  if (input.status === "skipped" && !input.required) return true;
  return !input.externalInvalid && input.status === "answered";
}

export function itemShowsInvalid(input: {
  disabled: boolean;
  required: boolean;
  status: QuestionnaireItemStatus;
  externalInvalid: boolean;
  attempted: boolean;
}): boolean {
  const skippedOptional = input.status === "skipped" && !input.required;
  if (input.disabled || skippedOptional) return false;
  if (input.externalInvalid) return true;
  return input.attempted && !itemIsValid(input);
}

export function progressState(
  names: readonly string[],
  activeName: string | null,
): QuestionnaireProgressState {
  const total = names.length;
  const index = activeName == null ? -1 : names.indexOf(activeName);
  return {
    current: index < 0 ? 0 : index + 1,
    total,
    first: total > 0 && index === 0,
    last: total > 0 && index === total - 1,
  };
}

export function keyShortcuts(
  parts: readonly (string | null | undefined | false)[],
): string | undefined {
  const joined = parts.filter((part): part is string => Boolean(part)).join(" ");
  return joined.length > 0 ? joined : undefined;
}

export type AnswerMove = {
  id: string;
  type: "choice" | "input";
  inputType: string;
  element: HTMLElement;
};

/**
 * Returns the answer that should receive focus, or null when native
 * radio behavior or text editing should keep the key.
 */
export function answerMoveTarget(
  answers: readonly AnswerMove[],
  target: EventTarget | null,
  itemElement: HTMLElement | null,
  direction: "next" | "previous",
): AnswerMove | null {
  if (answers.length === 0) return null;
  const index = answers.findIndex((answer) => answer.element === target);
  if (isTextEntryElement(target) && !isEmptyTextLikeInput(target)) return null;
  if (index < 0 && target !== itemElement) return null;
  const selectedIndex = answers.findIndex(
    (answer) =>
      answer.type === "choice" &&
      isInputElement(answer.element) &&
      answer.element.checked,
  );
  const start =
    index >= 0
      ? index
      : selectedIndex >= 0
        ? selectedIndex
        : direction === "next"
          ? 0
          : answers.length - 1;
  const nextIndex =
    index < 0
      ? start
      : (index + (direction === "next" ? 1 : -1) + answers.length) %
        answers.length;
  const next = answers[nextIndex];
  if (!next || next.element === target) return null;
  if (
    index >= 0 &&
    isRadioElement(target) &&
    next.type === "choice" &&
    next.inputType === "radio"
  ) {
    return null;
  }
  return next;
}

export function collectDefinitionWarnings(
  collection: QuestionnaireCollection,
  defaultItem: string | undefined,
): string[] {
  const warnings: string[] = [];
  const names = new Set<string>();
  for (const item of collection.items) {
    if (names.has(item.name)) {
      warnings.push(`Item name "${item.name}" is defined more than once.`);
    }
    names.add(item.name);
    const values = new Set<string>();
    for (const choice of item.choices ?? []) {
      if (values.has(choice.value)) {
        warnings.push(
          `Choice value "${choice.value}" is defined more than once in item "${item.name}".`,
        );
      }
      values.add(choice.value);
    }
  }
  if (defaultItem) {
    const match = collection.itemByName.get(defaultItem);
    if (!match || match.disabled) {
      warnings.push(
        `defaultItem "${defaultItem}" does not identify an enabled item. The first enabled item will be used instead.`,
      );
    }
  }
  return warnings;
}

declare const process: { readonly env: { readonly NODE_ENV?: string } };

/**
 * Bun and Vite replace `process.env.NODE_ENV` at build time. An unbundled
 * browser page has no `process`, so the read throws and warnings stay on.
 */
function isProductionBuild(): boolean {
  try {
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}

export function reportQuestionnaireWarnings(
  warnings: readonly string[],
): void {
  if (isProductionBuild()) return;
  for (const warning of warnings) {
    console.warn(`[Questionnaire] ${warning}`);
  }
}

export function collectRenderWarnings(
  collection: QuestionnaireCollection,
  rendered: readonly RenderedQuestionnaireItem[],
  shortcuts: QuestionnaireShortcutMode | null,
): string[] {
  const warnings: string[] = [];
  const renderedByName = new Map(rendered.map((item) => [item.name, item]));
  for (const defined of collection.items) {
    const match = renderedByName.get(defined.name);
    if (!match) {
      if (!defined.disabled) {
        warnings.push(
          `Item "${defined.name}" is defined but has no rendered QuestionnaireItem.`,
        );
      }
      continue;
    }
    if (match.disabled !== !!defined.disabled) {
      warnings.push(
        `Item "${defined.name}" has different disabled values in items and QuestionnaireItem.`,
      );
    }
    if (match.required !== !!defined.required) {
      warnings.push(
        `Item "${defined.name}" has different required values in items and QuestionnaireItem.`,
      );
    }
    const definedChoices = defined.choices ?? [];
    const definedByValue = new Map(
      definedChoices.map((choice) => [choice.value, choice]),
    );
    const renderedByValue = new Map(
      match.choices.map((choice) => [choice.value, choice]),
    );
    for (const choice of definedChoices) {
      const renderedChoice = renderedByValue.get(choice.value);
      if (!renderedChoice) {
        warnings.push(
          `Choice "${choice.value}" is defined for item "${defined.name}" but has no rendered QuestionnaireChoice.`,
        );
        continue;
      }
      if (renderedChoice.disabled !== !!choice.disabled) {
        warnings.push(
          `Choice "${choice.value}" in item "${defined.name}" has different disabled values in items and QuestionnaireChoice.`,
        );
      }
    }
    if (shortcuts) {
      for (const choice of match.choices) {
        if (!definedByValue.has(choice.value)) {
          warnings.push(
            `Rendered choice "${choice.value}" in item "${defined.name}" is missing from items and will not receive a shortcut.`,
          );
        }
      }
      const definedOrder = definedChoices
        .filter((choice) => !choice.disabled)
        .map((choice) => choice.value);
      const renderedOrder = match.choices
        .filter((choice) => !choice.disabled)
        .map((choice) => choice.value);
      if (
        definedOrder.length > 0 &&
        definedOrder.length === renderedOrder.length &&
        definedOrder.every((value) => renderedOrder.includes(value)) &&
        definedOrder.some((value, index) => value !== renderedOrder[index])
      ) {
        warnings.push(
          `Choice order for item "${defined.name}" differs between items and the rendered QuestionnaireChoice elements.`,
        );
      }
    }
  }
  for (const item of rendered) {
    if (!item.disabled && !collection.itemByName.has(item.name)) {
      warnings.push(
        `Rendered item "${item.name}" is missing from items and is excluded from the questionnaire collection.`,
      );
    }
  }
  return warnings;
}

const QuestionnaireKey: InjectionKey<QuestionnaireContext> = Symbol(
  "sinwan-ui.questionnaire",
);
const QuestionnaireItemKey: InjectionKey<QuestionnaireItemContext> = Symbol(
  "sinwan-ui.questionnaire-item",
);

let idSequence = 0;

export function nextQuestionnaireId(prefix: string): string {
  idSequence += 1;
  return `${prefix}-${idSequence.toString(36)}`;
}

function eventInput(event: Event): HTMLInputElement | null {
  if (isInputElement(event.target)) return event.target;
  if (isInputElement(event.currentTarget)) return event.currentTarget;
  return null;
}

function requestFormSubmit(form: HTMLFormElement | null): void {
  if (!form) return;
  if (typeof form.requestSubmit === "function") {
    form.requestSubmit();
    return;
  }
  form.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true }),
  );
}

function enabledControls(
  item: QuestionnaireItemContext,
): QuestionnaireAnswerControl[] {
  return item.controls.value
    .filter((control) => !control.disabled)
    .slice()
    .sort((a, b) => compareElements(a.element, b.element));
}

function assignRef<T>(ref: unknown, element: T | null): void {
  if (typeof ref === "function") ref(element);
  else if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: T | null }).current = element;
  }
}

/**
 * Questionnaire flow, validation, keyboard navigation, and context without
 * default styles. Call from a root form component; parts use
 * `useQuestionnaire()`.
 */
export function useQuestionnaireRoot(
  props: QuestionnaireProps,
): QuestionnaireRootReturn {
  const raw = getRawProps(props);
  const {
    children: _children,
    class: _className,
    item: _item,
    defaultItem: _defaultItem,
    items: _items,
    onItemChange: _onItemChange,
    shortcuts: _shortcuts,
    onSubmit: _onSubmit,
    onReset: _onReset,
    onkeydown: _onkeydown,
    noValidate: _noValidate,
    ref: _ref,
    ...rest
  } = raw;

  const items = signal<QuestionnaireItemContext[]>([]);
  const domTick = signal(0);
  const uncontrolled = signal(
    resolveInitialItem(buildCollection(props.items), props.defaultItem),
  );
  let form: HTMLFormElement | null = null;
  let pendingFocus: "item" | "invalid" = "item";
  let focusArmed = false;

  const activeName = computed(() =>
    props.item !== undefined ? props.item : uncontrolled.value,
  );
  const shortcuts = computed(() => props.shortcuts ?? null);
  const nativeValidation = computed(() => props.noValidate === false);
  const flowNames = computed(() => {
    domTick.value;
    const collection = buildCollection(props.items);
    if (collection) return collection.enabledItems.map((item) => item.name);
    return items.value
      .filter((item) => !item.disabled.value)
      .slice()
      .sort((a, b) => compareElements(a.element, b.element))
      .map((item) => item.name);
  });
  const progress = computed(() =>
    progressState(flowNames.value, activeName.value),
  );
  const activeItem = computed(() =>
    items.value.find(
      (item) => item.name === activeName.value && !item.disabled.value,
    ) ?? null,
  );
  const activeStatus = computed<QuestionnaireItemStatus | null>(() => {
    const item = activeItem.value;
    if (item) return item.status.value;
    if (activeName.value && flowNames.value.includes(activeName.value)) {
      return "unanswered";
    }
    return null;
  });
  const activeRequired = computed<boolean | null>(() => {
    const name = activeName.value;
    if (!name || !flowNames.value.includes(name)) return null;
    const defined = buildCollection(props.items)?.itemByName.get(name);
    if (defined) return !!defined.required;
    return activeItem.value ? activeItem.value.required.value : null;
  });

  function findItem(name: string): QuestionnaireItemContext | null {
    return (
      items.value.find((item) => item.name === name && !item.disabled.value) ??
      null
    );
  }

  function goTo(name: string, target: "item" | "invalid" = "item"): void {
    if (name === activeName.value) {
      if (target === "invalid") {
        queueMicrotask(() => findItem(name)?.focusInvalid());
      }
      return;
    }
    pendingFocus = target;
    if (props.item === undefined) uncontrolled.value = name;
    props.onItemChange?.(name);
  }

  function goNext(): void {
    const item = activeItem.value;
    const names = flowNames.value;
    const index = item ? names.indexOf(item.name) : -1;
    if (!item || index < 0 || index >= names.length - 1) return;
    if (!item.validate()) {
      queueMicrotask(() => item.focusInvalid());
      return;
    }
    const next = names[index + 1];
    if (next) goTo(next);
  }

  function goPrevious(): void {
    const names = flowNames.value;
    const index = names.indexOf(activeName.value ?? "");
    if (index <= 0) return;
    const previous = names[index - 1];
    if (previous) goTo(previous);
  }

  function confirm(): void {
    const item = activeItem.value;
    if (!item) return;
    if (!item.validate()) {
      queueMicrotask(() => item.focusInvalid());
      return;
    }
    const names = flowNames.value;
    const index = names.indexOf(item.name);
    if (index >= 0 && index === names.length - 1) {
      requestFormSubmit(form);
      return;
    }
    const next = names[index + 1];
    if (next) goTo(next);
  }

  function skipCurrent(): void {
    const item = activeItem.value;
    if (!item || item.required.value) return;
    item.skip();
    const names = flowNames.value;
    const index = names.indexOf(item.name);
    if (index >= 0 && index < names.length - 1) {
      const next = names[index + 1];
      if (next) goTo(next);
      return;
    }
    queueMicrotask(() => requestFormSubmit(form));
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229) {
      return;
    }
    const item = activeItem.value;
    if (!item || !event.target || typeof event.target !== "object") return;
    if (!("tagName" in event.target)) return;
    if (
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault();
      if (!event.repeat) confirm();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (
        item.moveAnswerFocus(
          event.target,
          event.key === "ArrowDown" ? "next" : "previous",
        )
      ) {
        event.preventDefault();
      }
      return;
    }
    if (
      (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      !isTextEntryElement(event.target) &&
      !isRadioElement(event.target)
    ) {
      event.preventDefault();
      if (event.repeat) return;
      if (event.key === "ArrowLeft") goPrevious();
      else if (item.status.value !== "unanswered") goNext();
      return;
    }
    if (event.key === "Enter") {
      const answer = item.controlFromTarget(event.target);
      if (!answer) return;
      event.preventDefault();
      if (!event.repeat && item.controlIsSelected(answer)) confirm();
      return;
    }
    const mode = shortcuts.value;
    if (!mode || isTextEntryElement(event.target)) return;
    const key = normalizeShortcutKey(event.key, mode);
    if (!key) return;
    const answer = item.answerForShortcut(key);
    if (!answer) return;
    event.preventDefault();
    if (event.repeat) return;
    answer.element.focus();
    if (answer.type === "choice") answer.element.click();
  }

  effect(() => {
    const names = flowNames.value;
    if (names.length === 0) return;
    const current = activeName.value;
    if (current != null && names.includes(current)) return;
    const next = names[0];
    if (!next) return;
    if (props.item === undefined) {
      uncontrolled.value = next;
      return;
    }
    props.onItemChange?.(next);
  });

  effect(() => {
    const name = activeName.value;
    const target = pendingFocus;
    pendingFocus = "item";
    if (!focusArmed) {
      focusArmed = true;
      return;
    }
    queueMicrotask(() => {
      const item = findItem(name ?? "");
      if (!item) return;
      if (target === "invalid") item.focusInvalid();
      else item.focus();
    });
  });

  const context: QuestionnaireContext = {
    activeName,
    progress,
    shortcuts,
    activeStatus,
    activeRequired,
    nativeValidation,
    flowNames,
    registerItem: (item) => {
      items.value = [
        ...items.value.filter((entry) => entry !== item && entry.name !== item.name),
        item,
      ];
    },
    unregisterItem: (item) => {
      items.value = items.value.filter((entry) => entry !== item);
    },
    bumpDom: () => {
      domTick.value += 1;
    },
    goNext,
    goPrevious,
    skipCurrent,
    definitions: () => props.items,
  };
  provide(QuestionnaireKey, context);

  onMounted(() => {
    const collection = buildCollection(props.items);
    if (!collection) return;
    reportQuestionnaireWarnings([
      ...collectDefinitionWarnings(collection, props.defaultItem),
      ...collectRenderWarnings(
        collection,
        items.value.map((item) => item.snapshot()),
        props.shortcuts ?? null,
      ),
    ]);
  });

  return {
    rest,
    progress,
    shortcuts,
    setForm(element) {
      form = element;
      if (element) element.noValidate = props.noValidate !== false;
      assignRef(props.ref, element);
    },
    onKeyDown(event) {
      const notify = props.onkeydown as
        | ((keyEvent: KeyboardEvent) => void)
        | undefined;
      notify?.(event);
      handleKeyDown(event);
    },
    onSubmit(event) {
      const names = flowNames.value;
      for (const name of names) {
        const item = findItem(name);
        if (!item || item.validate()) continue;
        event.preventDefault();
        goTo(item.name, "invalid");
        return;
      }
      props.onSubmit?.(event);
    },
    onReset(event) {
      props.onReset?.(event);
      if (event.defaultPrevented) return;
      for (const item of items.value) item.reset();
      const next = resolveInitialItem(
        buildCollection(props.items),
        props.defaultItem,
      );
      if (!next || next === activeName.value) return;
      pendingFocus = "item";
      if (props.item === undefined) uncontrolled.value = next;
      else props.onItemChange?.(next);
    },
  };
}

/**
 * Inject the questionnaire context. Must be used under a root that called
 * `useQuestionnaireRoot` (or the default `<Questionnaire />`).
 */
export function useQuestionnaire(
  consumer = "useQuestionnaire",
): QuestionnaireContext {
  const context = inject(QuestionnaireKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a Questionnaire.`);
  }
  return context;
}

/**
 * One question: answers, status, validation, and focus. Parts inside it use
 * `useQuestionnaireItem()`.
 */
export function useQuestionnaireItemRoot(
  props: QuestionnaireItemProps,
): QuestionnaireItemRootReturn {
  const root = useQuestionnaire("QuestionnaireItem");
  const raw = getRawProps(props);
  const {
    children: _children,
    class: _className,
    name: _name,
    required: _required,
    multiple: _multiple,
    disabled: _disabled,
    invalid: _invalid,
    onStatusChange: _onStatusChange,
    ref: _ref,
    ...rest
  } = raw;

  const required = computed(() => props.required === true);
  const multiple = computed(() => props.multiple === true);
  const disabled = computed(() => props.disabled === true);
  const externalInvalid = computed(() => props.invalid === true);
  const selected = signal<string[]>([]);
  const defaults = signal<string[]>([]);
  const skipped = signal(false);
  const attempted = signal(false);
  const controls = signal<QuestionnaireAnswerControl[]>([]);
  const descriptionIds = signal<string[]>([]);
  const errorIds = signal<string[]>([]);
  let fieldset: HTMLElement | null = null;

  const active = computed(
    () => !disabled.value && root.activeName.value === props.name,
  );
  const shortcutByValue = computed(() => {
    const defined = buildCollection(root.definitions());
    if (!defined) return null;
    return shortcutsForChoices(
      defined.itemByName.get(props.name)?.choices,
      root.shortcuts.value,
    );
  });

  const status = computed<QuestionnaireItemStatus>(() => {
    if (skipped.value) return "skipped";
    const ids = selected.value;
    const answered = controls.value.some(
      (control) => !control.disabled && ids.includes(control.id),
    );
    return answered ? "answered" : "unanswered";
  });
  const showInvalid = computed(() =>
    itemShowsInvalid({
      disabled: disabled.value,
      required: required.value,
      status: status.value,
      externalInvalid: externalInvalid.value,
      attempted: attempted.value,
    }),
  );
  const shortcutById = computed(() => {
    if (shortcutByValue.value) return new Map<string, string>();
    const keys = shortcutAlphabet(root.shortcuts.value);
    const choices = controls.value
      .filter((control) => control.type === "choice" && !control.disabled)
      .slice()
      .sort((a, b) => compareElements(a.element, b.element));
    const map = new Map<string, string>();
    choices.forEach((control, index) => {
      const key = keys[index];
      if (key) map.set(control.id, key);
    });
    return map;
  });
  const hasInput = computed(() =>
    controls.value.some(
      (control) => control.type === "input" && !control.disabled,
    ),
  );

  const item: QuestionnaireItemContext = {
    name: props.name,
    element: null,
    required,
    multiple,
    disabled,
    externalInvalid,
    status,
    showInvalid,
    active,
    selected,
    controls,
    descriptionIds,
    errorIds,
    shortcutByValue,
    shortcutById,
    hasInput,
    registerDefault(id, selectedByDefault) {
      if (!selectedByDefault) return;
      if (!defaults.value.includes(id)) {
        defaults.value = [...defaults.value, id];
      }
      if (multiple.value) {
        if (!selected.value.includes(id)) {
          selected.value = [...selected.value, id];
        }
        return;
      }
      if (selected.value.length === 0) selected.value = [id];
    },
    interact(id, on) {
      skipped.value = false;
      setSelected(id, on);
    },
    syncControlled(id, on) {
      if (on) skipped.value = false;
      setSelected(id, on);
    },
    upsertControl(control) {
      controls.value = [
        ...controls.value.filter((entry) => entry.id !== control.id),
        control,
      ];
      syncNames();
      root.bumpDom();
    },
    removeControl(id) {
      controls.value = controls.value.filter((entry) => entry.id !== id);
      selected.value = selected.value.filter((entry) => entry !== id);
      defaults.value = defaults.value.filter((entry) => entry !== id);
    },
    addDescription(id) {
      if (!descriptionIds.value.includes(id)) {
        descriptionIds.value = [...descriptionIds.value, id];
      }
    },
    removeDescription(id) {
      descriptionIds.value = descriptionIds.value.filter((entry) => entry !== id);
    },
    addError(id) {
      if (!errorIds.value.includes(id)) errorIds.value = [...errorIds.value, id];
    },
    removeError(id) {
      errorIds.value = errorIds.value.filter((entry) => entry !== id);
    },
    validate() {
      attempted.value = true;
      const valid = itemIsValid({
        disabled: disabled.value,
        required: required.value,
        status: status.value,
        externalInvalid: externalInvalid.value,
      });
      if (!valid) return false;
      if (!root.nativeValidation.value) return true;
      const invalid = enabledControls(item).find(
        (control) =>
          item.controlIsSelected(control) &&
          control.element.willValidate &&
          !control.element.validity.valid,
      );
      if (!invalid) return true;
      invalid.element.focus();
      invalid.element.reportValidity();
      return false;
    },
    focus() {
      fieldset?.focus();
    },
    focusInvalid() {
      const filled = fieldset?.querySelector(
        "input[data-filled][name]:not(:disabled)",
      );
      const first = fieldset?.querySelector(
        "input:not([type=hidden]):not(:disabled), textarea:not(:disabled)",
      );
      const target = filled ?? first ?? fieldset;
      if (target && "focus" in target && typeof target.focus === "function") {
        target.focus();
      }
    },
    reset() {
      attempted.value = false;
      skipped.value = false;
      const initial = defaults.value;
      selected.value = multiple.value ? [...initial] : initial.slice(0, 1);
      syncNames();
    },
    skip() {
      if (required.value) return;
      selected.value = [];
      skipped.value = true;
      syncNames();
    },
    moveAnswerFocus(target, direction) {
      const answers = enabledControls(item).map((control) => ({
        id: control.id,
        type: control.type,
        inputType: control.inputType,
        element: control.element,
      }));
      const next = answerMoveTarget(answers, target, fieldset, direction);
      if (!next) return false;
      next.element.focus();
      if (
        next.type === "choice" &&
        next.inputType === "radio" &&
        isInputElement(next.element)
      ) {
        next.element.click();
      }
      return true;
    },
    controlFromTarget(target) {
      if (!isInputElement(target)) return null;
      return controls.value.find((control) => control.element === target) ?? null;
    },
    controlIsSelected(control) {
      if (control.type === "choice") return control.element.checked;
      return (
        control.element.hasAttribute("name") &&
        hasFilledValue(control.element.value)
      );
    },
    answerForShortcut(key) {
      const byValue = shortcutByValue.value;
      if (byValue) {
        const value = [...byValue.entries()].find(
          ([, shortcut]) => shortcut === key,
        )?.[0];
        if (!value) return null;
        return (
          enabledControls(item).find(
            (control) => control.type === "choice" && control.value === value,
          ) ?? null
        );
      }
      const id = [...shortcutById.value.entries()].find(
        ([, shortcut]) => shortcut === key,
      )?.[0];
      return controls.value.find((control) => control.id === id) ?? null;
    },
    snapshot() {
      return {
        name: props.name,
        disabled: disabled.value,
        required: required.value,
        choices: controls.value
          .filter((control) => control.type === "choice")
          .map((control) => ({
            value: control.value,
            disabled: control.ownDisabled,
          })),
      };
    },
  };

  function syncNames(): void {
    const activeIds = skipped.value ? [] : selected.value;
    for (const control of controls.value) {
      const included = activeIds.includes(control.id);
      if (included) {
        control.element.name = props.name;
        control.element.setAttribute("name", props.name);
      } else {
        control.element.name = "";
        control.element.removeAttribute("name");
      }
      if (control.type === "choice") {
        control.element.checked = included;
        if (included) control.element.setAttribute("checked", "");
        else control.element.removeAttribute("checked");
      }
      control.element.removeAttribute("form");
    }
    const next = status.value;
    if (previousStatus !== null && previousStatus !== next) {
      previousStatus = next;
      props.onStatusChange?.(next);
    }
  }

  function setSelected(id: string, on: boolean): void {
    if (on) {
      selected.value = multiple.value
        ? selected.value.includes(id)
          ? selected.value
          : [...selected.value, id]
        : [id];
    } else {
      selected.value = selected.value.filter((entry) => entry !== id);
    }
    syncNames();
  }

  effect(() => {
    if (multiple.value || selected.value.length <= 1) return;
    const first = enabledControls(item).find((control) =>
      selected.value.includes(control.id),
    );
    selected.value = first ? [first.id] : selected.value.slice(0, 1);
  });

  let previousStatus: QuestionnaireItemStatus | null = null;
  effect(() => {
    const next = status.value;
    if (previousStatus === null) {
      previousStatus = next;
      return;
    }
    if (previousStatus === next) return;
    previousStatus = next;
    props.onStatusChange?.(next);
  });

  root.registerItem(item);
  onUnmounted(() => root.unregisterItem(item));
  provide(QuestionnaireItemKey, item);

  function syncAria(): void {
    if (!fieldset) return;
    const passed = props["aria-describedby"];
    const describedBy = joinIds([
      typeof passed === "string" ? passed : undefined,
      ...descriptionIds.value,
      ...(showInvalid.value ? errorIds.value : []),
    ]);
    if (describedBy) fieldset.setAttribute("aria-describedby", describedBy);
    else fieldset.removeAttribute("aria-describedby");
    const passedKeys = props["aria-keyshortcuts"];
    const keys = keyShortcuts([
      typeof passedKeys === "string" ? passedKeys : undefined,
      active.value ? "Meta+Enter Control+Enter" : null,
      active.value && enabledControls(item).length > 0
        ? "ArrowUp ArrowDown"
        : null,
      active.value && !root.progress.value.first ? "ArrowLeft" : null,
      active.value &&
      !root.progress.value.last &&
      status.value !== "unanswered"
        ? "ArrowRight"
        : null,
    ]);
    if (keys) fieldset.setAttribute("aria-keyshortcuts", keys);
    else fieldset.removeAttribute("aria-keyshortcuts");
  }

  effect(() => {
    descriptionIds.value;
    errorIds.value;
    showInvalid.value;
    active.value;
    status.value;
    root.progress.value;
    controls.value;
    syncAria();
  });
  onMounted(syncAria);

  return {
    rest,
    item,
    setFieldset(element) {
      fieldset = element;
      item.element = element;
      syncAria();
      root.bumpDom();
      assignRef(props.ref, element);
    },
  };
}

/**
 * Inject the current item context. Must be used under a root that called
 * `useQuestionnaireItemRoot` (or the default `<QuestionnaireItem />`).
 */
export function useQuestionnaireItem(
  consumer = "useQuestionnaireItem",
): QuestionnaireItemContext {
  const context = inject(QuestionnaireItemKey);
  if (!context) {
    throw new Error(`${consumer} must be used within a QuestionnaireItem.`);
  }
  return context;
}

/**
 * One fixed answer: checked state, shortcut, and the native radio or
 * checkbox wiring. Style the label and indicator yourself.
 */
export function useQuestionnaireChoice(
  props: QuestionnaireChoiceProps,
): QuestionnaireChoiceReturn {
  const item = useQuestionnaireItem("QuestionnaireChoice");
  const raw = getRawProps(props);
  const {
    children: _children,
    class: _className,
    value: _value,
    checked: _checked,
    defaultChecked: _defaultChecked,
    disabled: _disabled,
    onchange: _onchange,
    render: _render,
    ...rest
  } = raw;
  const controlId = nextQuestionnaireId("q-choice");
  let inputEl: HTMLInputElement | null = null;
  const controlled = props.checked !== undefined;
  item.registerDefault(controlId, props.defaultChecked === true);

  function publish(): void {
    if (!inputEl) return;
    item.upsertControl({
      id: controlId,
      type: "choice",
      value: props.value,
      element: inputEl,
      inputType: item.multiple.value ? "checkbox" : "radio",
      disabled: item.disabled.value || props.disabled === true,
      ownDisabled: props.disabled === true,
    });
  }

  effect(() => {
    item.multiple.value;
    item.disabled.value;
    props.disabled;
    publish();
  });
  effect(() => {
    if (props.checked === undefined) return;
    item.syncControlled(controlId, props.checked === true);
  });
  onMounted(publish);
  onUnmounted(() => item.removeControl(controlId));

  const checked = computed(() => {
    if (controlled) {
      if (item.status.value === "skipped") return false;
      return props.checked === true;
    }
    return item.selected.value.includes(controlId);
  });
  const disabled = computed(
    () => item.disabled.value || props.disabled === true,
  );
  const shortcut = computed(() => {
    const byValue = item.shortcutByValue.value;
    if (byValue) return byValue.get(props.value) ?? null;
    return item.shortcutById.value.get(controlId) ?? null;
  });
  const type = computed<"checkbox" | "radio">(() =>
    item.multiple.value ? "checkbox" : "radio",
  );

  return {
    rest,
    item,
    checked,
    disabled,
    invalid: item.showInvalid,
    shortcut,
    type,
    name: computed(() => (item.status.value === "skipped" ? "" : item.name)),
    required: computed(
      () =>
        item.required.value &&
        !item.multiple.value &&
        !item.hasInput.value &&
        item.status.value !== "skipped",
    ),
    keyShortcuts: computed(() =>
      keyShortcuts([
        shortcut.value,
        !disabled.value && checked.value ? "Enter" : null,
      ]),
    ),
    state: computed(() => ({
      checked: checked.value,
      disabled: disabled.value,
      invalid: item.showInvalid.value,
      shortcut: shortcut.value,
      type: type.value,
    })),
    setInput(element) {
      inputEl = element;
      publish();
    },
    onChange(event) {
      const notify = props.onchange as
        | ((changeEvent: Event) => void)
        | undefined;
      notify?.(event);
      if (event.defaultPrevented) return;
      const target = eventInput(event);
      if (!target) return;
      if (!controlled) {
        item.interact(controlId, target.checked);
        return;
      }
      const restoreSkipped =
        item.status.value === "skipped" && props.checked === target.checked;
      if (restoreSkipped) item.interact(controlId, props.checked === true);
    },
  };
}

/**
 * A freeform answer: filled state, form naming, and change tracking.
 */
export function useQuestionnaireInput(
  props: QuestionnaireInputProps,
): QuestionnaireInputReturn {
  const item = useQuestionnaireItem("QuestionnaireInput");
  const raw = getRawProps(props);
  const {
    class: _className,
    type: _type,
    value: _value,
    defaultValue: _defaultValue,
    disabled: _disabled,
    onchange: _onchange,
    render: _render,
    id: _id,
    ...rest
  } = raw;
  const controlId = nextQuestionnaireId("q-input");
  const inputType = props.type ?? "text";
  const controlled = props.value !== undefined;
  const filledValue = signal(hasFilledValue(props.defaultValue));
  let inputEl: HTMLInputElement | null = null;
  item.registerDefault(controlId, hasFilledValue(props.defaultValue));

  function publish(): void {
    if (!inputEl) return;
    item.upsertControl({
      id: controlId,
      type: "input",
      value: inputEl.value,
      element: inputEl,
      inputType,
      disabled: item.disabled.value || props.disabled === true,
      ownDisabled: props.disabled === true,
    });
  }

  effect(() => {
    item.disabled.value;
    props.disabled;
    publish();
  });
  effect(() => {
    if (props.value === undefined) return;
    item.syncControlled(controlId, hasFilledValue(props.value));
  });
  onUnmounted(() => item.removeControl(controlId));

  const disabled = computed(
    () => item.disabled.value || props.disabled === true,
  );
  const filled = computed(() =>
    controlled ? hasFilledValue(props.value) : filledValue.value,
  );
  const selected = computed(
    () => item.selected.value.includes(controlId) && item.status.value !== "skipped",
  );

  return {
    rest,
    item,
    id: props.id ?? controlId,
    type: inputType,
    disabled,
    filled,
    selected,
    value: controlled ? () => props.value : undefined,
    defaultValue: controlled ? undefined : props.defaultValue,
    state: computed(() => ({
      disabled: disabled.value,
      filled: filled.value,
      invalid: item.showInvalid.value,
    })),
    setInput(element) {
      inputEl = element;
      publish();
    },
    onChange(event) {
      const notify = props.onchange as
        | ((changeEvent: Event) => void)
        | undefined;
      notify?.(event);
      if (event.defaultPrevented) return;
      const target = eventInput(event);
      if (!target) return;
      if (controlled) return;
      const next = hasFilledValue(target.value);
      filledValue.value = next;
      item.interact(controlId, next);
    },
  };
}

/**
 * Registers a description id on the current item for `aria-describedby`.
 */
export function useQuestionnaireDescription(id: unknown): string {
  const item = useQuestionnaireItem("QuestionnaireDescription");
  const descriptionId =
    typeof id === "string" ? id : nextQuestionnaireId("q-desc");
  onMounted(() => item.addDescription(descriptionId));
  onUnmounted(() => item.removeDescription(descriptionId));
  return descriptionId;
}

/**
 * Registers an error id on the current item and exposes its invalid state.
 */
export function useQuestionnaireError(id: unknown): QuestionnaireErrorReturn {
  const item = useQuestionnaireItem("QuestionnaireError");
  const errorId = typeof id === "string" ? id : nextQuestionnaireId("q-error");
  onMounted(() => item.addError(errorId));
  onUnmounted(() => item.removeError(errorId));
  return {
    id: errorId,
    invalid: item.showInvalid,
    message: (children) => children ?? defaultErrorMessage(item.required.value),
  };
}

const NAVIGATION: Record<
  QuestionnaireNavigationAction,
  {
    consumer: string;
    shortcut: boolean;
    visible: (root: QuestionnaireContext) => boolean;
    activate: (root: QuestionnaireContext) => void;
  }
> = {
  previous: {
    consumer: "QuestionnairePrevious",
    shortcut: false,
    visible: (root) => root.progress.value.total > 1 && !root.progress.value.first,
    activate: (root) => root.goPrevious(),
  },
  skip: {
    consumer: "QuestionnaireSkip",
    shortcut: false,
    visible: (root) => root.activeRequired.value === false,
    activate: (root) => root.skipCurrent(),
  },
  next: {
    consumer: "QuestionnaireNext",
    shortcut: true,
    visible: (root) => root.progress.value.total > 1 && !root.progress.value.last,
    activate: (root) => root.goNext(),
  },
  submit: {
    consumer: "QuestionnaireSubmit",
    shortcut: true,
    visible: (root) => root.progress.value.total > 0 && root.progress.value.last,
    activate: () => {},
  },
};

/**
 * Visibility and action for a navigation button. Submit has no action; the
 * native submit button submits the form.
 */
export function useQuestionnaireNavigation(
  action: QuestionnaireNavigationAction,
): QuestionnaireNavigationReturn {
  const config = NAVIGATION[action];
  const root = useQuestionnaire(config.consumer);
  return {
    visible: computed(() => config.visible(root)),
    status: root.activeStatus,
    shortcut: config.shortcut,
    activate: () => config.activate(root),
  };
}
