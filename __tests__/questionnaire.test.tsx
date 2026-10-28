import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { signal } from "sinwan/reactivity";
import {
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
  type QuestionnaireItemStatus,
} from "../src/components/ui/questionnaire";
import {
  answerMoveTarget,
  buildCollection,
  collectDefinitionWarnings,
  collectRenderWarnings,
  compareElements,
  hasFilledValue,
  isEmptyTextLikeInput,
  isRadioElement,
  isTextEntryElement,
  itemIsValid,
  itemShowsInvalid,
  normalizeShortcutKey,
  progressState,
  reportQuestionnaireWarnings,
  resolveInitialItem,
  shortcutAlphabet,
} from "../src/components/ui/questionnaire/useQuestionnaire";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const items = [
  {
    name: "direction",
    required: true,
    choices: [
      { value: "delegation" },
      { value: "questions" },
      { value: "both" },
    ],
  },
  {
    name: "detail",
    required: false,
    choices: [{ value: "focused" }, { value: "complete" }],
  },
] as const;

function BasicForm(props: {
  onSubmit?: (event: Event) => void;
  shortcuts?: "letters" | "numbers";
  onStatus?: (status: QuestionnaireItemStatus) => void;
}) {
  return (
    <Questionnaire items={items} shortcuts={props.shortcuts} onSubmit={props.onSubmit}>
      <QuestionnaireProgress />
      <QuestionnaireItem
        name="direction"
        required
        onStatusChange={props.onStatus}
      >
        <QuestionnaireTitle>What should we prototype next?</QuestionnaireTitle>
        <QuestionnaireDescription>Choose a direction.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="delegation">
            <span>Delegation</span>
            <QuestionnaireChoiceDescription>
              Show how work moves.
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="questions">Questions</QuestionnaireChoice>
          <QuestionnaireChoice value="both">Both</QuestionnaireChoice>
          <QuestionnaireInput
            aria-label="Another answer"
            placeholder="Type another answer…"
          />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="detail">
        <QuestionnaireTitle>How much detail?</QuestionnaireTitle>
        <QuestionnaireDescription>Skip this if you are not sure.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="focused">Focused</QuestionnaireChoice>
          <QuestionnaireChoice value="complete">Complete</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

function activeItem(): HTMLElement {
  const item = document.querySelector(
    "[data-slot=questionnaire-item][data-active]",
  );
  if (!(item instanceof HTMLElement)) throw new Error("missing active item");
  return item;
}

function clickChoice(value: string): void {
  const input = activeItem().querySelector(`input[value="${value}"]`);
  if (!input || input.tagName !== "INPUT") {
    throw new Error(`missing choice ${value}`);
  }
  (input as HTMLInputElement).click();
}

describe("questionnaire", () => {
  test("walks required, freeform, skip, previous, and submit", async () => {
    const statuses: QuestionnaireItemStatus[] = [];
    let submitted: FormData | null = null;
    const view = mountUi(() => (
      <BasicForm
        shortcuts="letters"
        onStatus={(status) => {
          statuses.push(status);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const FormDataCtor = (globalThis as unknown as { FormData: typeof FormData })
            .FormData;
          submitted = new FormDataCtor(event.currentTarget as HTMLFormElement);
        }}
      />
    ));

    const form = view.query("[data-slot=questionnaire]");
    const currentAttr = form ? form.getAttribute("data-current") : null;
    const totalAttr = form ? form.getAttribute("data-total") : null;
    if (currentAttr !== "1" || totalAttr !== "2") {
      throw new Error(`attrs ${typeof currentAttr}:${currentAttr} ${typeof totalAttr}:${totalAttr}`);
    }
    const first = form?.hasAttribute("data-first");
    expect(first).toBe(true);
    const novalidate = form?.getAttribute("novalidate");
    expect(novalidate).not.toBeNull();
    const progress = view.query("[data-slot=questionnaire-progress]")?.textContent;
    expect(progress).toBe("Question 1 of 2");
    const previousHidden = view
      .query("[data-slot=questionnaire-previous]")
      ?.hasAttribute("hidden");
    const skipHidden = view
      .query("[data-slot=questionnaire-skip]")
      ?.hasAttribute("hidden");
    const submitHidden = view
      .query("[data-slot=questionnaire-submit]")
      ?.hasAttribute("hidden");
    expect(previousHidden).toBe(true);
    expect(skipHidden).toBe(true);
    const submitMarkup = view.query("[data-slot=questionnaire-submit]")?.outerHTML ?? "";
    if (submitHidden !== true) {
      throw new Error("submit visible " + submitMarkup.slice(0, 300));
    }
    const describedBy = activeItem().getAttribute("aria-describedby") ?? "";
    const descriptionId =
      activeItem().querySelector("[data-slot=questionnaire-description]")?.id ??
      "";
    if (!describedBy.includes(descriptionId) || descriptionId.length === 0) {
      throw new Error("describedby " + describedBy + " id " + descriptionId);
    }

    view.click("[data-slot=questionnaire-next]");
    const errorText = activeItem().querySelector(
      "[data-slot=questionnaire-error]",
    )?.textContent;
    expect(errorText).toBe("Choose an answer to continue.");
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    const invalidChoice = activeItem()
      .querySelector('input[value="delegation"]')
      ?.getAttribute("aria-invalid");
    expect(invalidChoice).toBe("true");
    const stillFirst = form?.getAttribute("data-current");
    expect(stillFirst).toBe("1");

    clickChoice("delegation");
    expect(statuses).toContain("answered");
    const shortcut = activeItem()
      .querySelector("[data-shortcut]")
      ?.getAttribute("data-shortcut");
    expect(shortcut).toBe("A");
    view.click("[data-slot=questionnaire-next]");
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    const second = form?.getAttribute("data-current");
    const last = form?.hasAttribute("data-last");
    expect(second).toBe("2");
    expect(last).toBe(true);
    const skipShown = view
      .query("[data-slot=questionnaire-skip]")
      ?.hasAttribute("hidden");
    const nextHidden = view
      .query("[data-slot=questionnaire-next]")
      ?.hasAttribute("hidden");
    expect(skipShown).toBe(false);
    expect(nextHidden).toBe(true);

    view.click("[data-slot=questionnaire-previous]");
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    const back = form?.getAttribute("data-current");
    expect(back).toBe("1");
    const freeform = activeItem().querySelector(
      "[data-slot=questionnaire-input]",
    );
    if (!freeform || freeform.tagName !== "INPUT") throw new Error("missing input");
    const field = freeform as HTMLInputElement;
    field.value = "Custom direction";
    field.dispatchEvent(new Event("change", { bubbles: true }));
    view.click("[data-slot=questionnaire-next]");
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    view.click("[data-slot=questionnaire-skip]");
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    const saved: { data: FormData | null } = { data: submitted };
    const direction = saved.data ? saved.data.get("direction") : null;
    const detail = saved.data ? saved.data.get("detail") : null;
    expect(direction).toBe("Custom direction");
    expect(detail).toBeNull();
    view.unmount();
  });

  test("submits multiple answers and blocks an empty required submit", async () => {
    let values: string[] = [];
    const view = mountUi(() => (
      <Questionnaire
        items={[{ name: "signals", required: true, choices: [] }]}
        onSubmit={(event) => {
          event.preventDefault();
          const ctor = (globalThis as unknown as { FormData: typeof FormData }).FormData;
          values = new ctor(event.currentTarget as HTMLFormElement)
            .getAll("signals")
            .map(String);
        }}
      >
        <QuestionnaireItem name="signals" multiple required>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="progress">Progress</QuestionnaireChoice>
            <QuestionnaireChoice value="risks">Risks</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>Pick at least one.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireSubmit />
      </Questionnaire>
    ));
    view.click("[data-slot=questionnaire-submit]");
    const before = values.slice();
    expect(before).toEqual([]);
    const customError = view.query("[data-slot=questionnaire-error]")?.textContent;
    expect(customError).toBe("Pick at least one.");
    const boxes = view.queryAll("[data-slot=questionnaire-choice-input]");
    for (const box of boxes) {
      if (box.tagName !== "INPUT") continue;
      const input = box as HTMLInputElement;
      input.click();
    }
    const liveForm = document.querySelector("form");
    if (liveForm && "requestSubmit" in liveForm) {
      (liveForm as HTMLFormElement).requestSubmit();
    }
    const after = values.slice().sort();
    expect(after).toEqual(["progress", "risks"]);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    const checkedStates = boxes.map((box) =>
      box.closest("[data-slot=questionnaire-choice]")?.getAttribute("data-state"),
    );
    expect(checkedStates).toEqual(["checked", "checked"]);
    const checkChoice = view.query("[data-slot=questionnaire-choice]");
    expect(
      checkChoice?.querySelectorAll("[data-slot=questionnaire-choice-indicator-check]")
        .length,
    ).toBe(1);
    expect(
      checkChoice?.querySelector("[data-slot=questionnaire-choice-indicator-dot]"),
    ).toBeNull();
    view.unmount();
  });

  test("selected radio exposes data-state checked for the choice styles", async () => {
    const view = mountUi(() => <BasicForm />);
    const before = activeItem()
      .querySelector("[data-slot=questionnaire-choice]")
      ?.getAttribute("data-state");
    expect(before).toBe("unchecked");
    clickChoice("questions");
    const input = activeItem().querySelector(
      'input[value="questions"]',
    ) as HTMLInputElement;
    const choice = input.closest("[data-slot=questionnaire-choice]");
    expect(input.checked).toBe(true);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    expect(choice?.getAttribute("data-state")).toBe("checked");
    const other = activeItem()
      .querySelector('input[value="delegation"]')
      ?.closest("[data-slot=questionnaire-choice]");
    expect(other?.getAttribute("data-state")).toBe("unchecked");
    expect(
      choice?.querySelectorAll("[data-slot=questionnaire-choice-indicator-dot]")
        .length,
    ).toBe(1);
    expect(
      choice?.querySelector("[data-slot=questionnaire-choice-indicator-check]"),
    ).toBeNull();
    view.unmount();
  });

  test("restores defaults on reset and honors controlled navigation", () => {
    const current = signal("detail");
    const view = mountUi(() => (
      <Questionnaire
        item={current.value}
        defaultItem="detail"
        items={[
          {
            name: "direction",
            required: true,
            choices: [{ value: "delegation" }],
          },
          { name: "detail" },
        ]}
        onItemChange={(name) => {
          current.value = name;
        }}
        onReset={(event) => {
          event.preventDefault();
        }}
      >
        <QuestionnaireItem name="direction" required>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="delegation" defaultChecked>
              Delegation
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="detail">
          <QuestionnaireInput aria-label="Notes" defaultValue="Saved note" />
        </QuestionnaireItem>
        <QuestionnairePrevious />
        <QuestionnaireNext />
      </Questionnaire>
    ));
    const start = view.query("[data-slot=questionnaire]")?.getAttribute("data-current");
    expect(start).toBe("2");
    const notes = view.query("[data-slot=questionnaire-input]");
    expect(notes).toBeTruthy();
    view.click("[data-slot=questionnaire-previous]");
    const moved = current.value;
    expect(moved).toBe("direction");
    const checked = view.query(
      "[data-slot=questionnaire-choice-input]",
    ) as HTMLInputElement;
    const isChecked = checked.checked;
    expect(isChecked).toBe(true);
    const form = view.query("form");
    form?.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    expect(current.value).toBe("direction");
    view.unmount();
  });

  test("shortcuts, disabled items, custom progress, and hosted title", async () => {
    const view = mountUi(() => (
      <Questionnaire
        shortcuts="letters"
        items={[
          {
            name: "review",
            required: true,
            choices: [{ value: "api" }, { value: "tests" }],
          },
          { name: "hidden", disabled: true, required: true },
        ]}
      >
        <QuestionnaireProgress
          render={(partProps, state) => (
            <output {...partProps}>
              Checkpoint {state.current} of {state.total}
            </output>
          )}
        />
        <QuestionnaireItem name="review" required>
          <QuestionnaireTitle render={(partProps) => <span {...partProps} />}>
            Review
          </QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="api">Public API</QuestionnaireChoice>
            <QuestionnaireChoice value="tests">Test coverage</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="hidden" required disabled>
          <QuestionnaireTitle>Hidden</QuestionnaireTitle>
        </QuestionnaireItem>
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </Questionnaire>
    ));
    const total = view.query("[data-slot=questionnaire]")?.getAttribute("data-total");
    expect(total).toBe("1");
    const label = view.query("output")?.textContent;
    expect(label).toBe("Checkpoint 1 of 1");
    const form = view.query("form");
    form?.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
    const selected = view.query('input[value="tests"]') as HTMLInputElement | null;
    expect(selected?.checked).toBe(true);
    const current = view.query("[data-slot=questionnaire]")?.getAttribute("data-current");
    expect(current).toBe("1");
    view.unmount();
  });
});

describe("questionnaire model", () => {
  test("covers collection, validity, shortcuts, and warnings", () => {
    const collection = buildCollection([
      { name: "a", required: true, choices: [{ value: "1" }, { value: "1" }] },
      { name: "a" },
      { name: "off", disabled: true },
    ]);
    expect(resolveInitialItem(collection, "off")).toBe("a");
    expect(resolveInitialItem(null, undefined)).toBeNull();
    expect(shortcutAlphabet("numbers")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ]);
    expect(normalizeShortcutKey("a", "letters")).toBe("A");
    expect(normalizeShortcutKey("0", "numbers")).toBeNull();
    expect(hasFilledValue(["", " ok "])).toBe(true);
    expect(hasFilledValue("   ")).toBe(false);
    expect(itemIsValid({
      disabled: true,
      required: true,
      status: "unanswered",
      externalInvalid: true,
    })).toBe(true);
    expect(itemShowsInvalid({
      disabled: false,
      required: false,
      status: "skipped",
      externalInvalid: true,
      attempted: true,
    })).toBe(false);
    expect(progressState(["a"], null)).toEqual({
      current: 0,
      total: 1,
      first: false,
      last: false,
    });
    expect(collectDefinitionWarnings(collection!, "missing")).toEqual([
      'Choice value "1" is defined more than once in item "a".',
      'Item name "a" is defined more than once.',
      'defaultItem "missing" does not identify an enabled item. The first enabled item will be used instead.',
    ]);
    const rendered = [
      {
        name: "a",
        disabled: true,
        required: false,
        choices: [{ value: "2", disabled: true }, { value: "1", disabled: false }],
      },
      { name: "extra", disabled: false, required: false, choices: [] },
    ];
    const warnings = collectRenderWarnings(
      buildCollection([
        {
          name: "a",
          required: true,
          choices: [{ value: "1" }, { value: "2" }],
        },
        { name: "gone", choices: [{ value: "z" }] },
      ])!,
      rendered,
      "letters",
    );
    expect(warnings.some((warning) => warning.includes("gone"))).toBe(true);
    expect(warnings.some((warning) => warning.includes("extra"))).toBe(true);
    expect(warnings.some((warning) => warning.includes("disabled"))).toBe(true);
    const host = document.createElement("div");
    const first = document.createElement("span");
    const second = document.createElement("span");
    host.append(first, second);
    expect(compareElements(null, first)).toBe(0);
    expect(compareElements(second, first)).toBe(1);
    expect(isTextEntryElement(document.createElement("textarea"))).toBe(true);
    const select = document.createElement("select");
    expect(isTextEntryElement(select)).toBe(true);
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    expect(isTextEntryElement(editable)).toBe(true);
    expect(isTextEntryElement(null)).toBe(false);
    const radio = document.createElement("input");
    radio.type = "radio";
    expect(isRadioElement(radio)).toBe(true);
    const text = document.createElement("input");
    text.type = "text";
    expect(isEmptyTextLikeInput(text)).toBe(true);
    text.value = "filled";
    expect(isEmptyTextLikeInput(text)).toBe(false);
    const button = document.createElement("button");
    const movedFromRadio = answerMoveTarget(
      [
        { id: "a", type: "choice", inputType: "radio", element: radio },
        { id: "b", type: "input", inputType: "text", element: text },
      ],
      radio,
      host,
      "next",
    );
    expect(movedFromRadio?.id).toBe("b");
    const secondRadio = document.createElement("input");
    secondRadio.type = "radio";
    const stayedOnRadios = answerMoveTarget(
      [
        { id: "a", type: "choice", inputType: "radio", element: radio },
        { id: "c", type: "choice", inputType: "radio", element: secondRadio },
      ],
      radio,
      host,
      "next",
    );
    expect(stayedOnRadios).toBeNull();
    expect(
      answerMoveTarget(
        [{ id: "b", type: "input", inputType: "text", element: text }],
        text,
        host,
        "next",
      ),
    ).toBeNull();
    expect(answerMoveTarget([], button, host, "next")).toBeNull();
    const fromItem = answerMoveTarget(
      [{ id: "b", type: "input", inputType: "text", element: text }],
      host,
      host,
      "previous",
    );
    expect(fromItem?.id).toBe("b");
    const outside = answerMoveTarget(
      [{ id: "b", type: "input", inputType: "text", element: text }],
      button,
      host,
      "previous",
    );
    expect(outside).toBeNull();
    const warn = console.warn;
    const seen: unknown[] = [];
    console.warn = (...args: unknown[]) => {
      seen.push(args[0]);
    };
    reportQuestionnaireWarnings(["One"]);
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    reportQuestionnaireWarnings(["Hidden"]);
    process.env.NODE_ENV = previous;
    console.warn = warn;
    expect(seen).toEqual(["[Questionnaire] One"]);
  });

  test("warnings still report when the page has no process global", () => {
    const warn = console.warn;
    const seen: unknown[] = [];
    console.warn = (...args: unknown[]) => {
      seen.push(args[0]);
    };
    const saved = Object.getOwnPropertyDescriptor(globalThis, "process");
    Object.defineProperty(globalThis, "process", {
      configurable: true,
      value: undefined,
    });
    try {
      reportQuestionnaireWarnings(["Browser"]);
    } finally {
      if (saved) Object.defineProperty(globalThis, "process", saved);
      console.warn = warn;
    }
    expect(seen).toEqual(["[Questionnaire] Browser"]);
  });
});
