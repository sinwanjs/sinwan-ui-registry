import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cc, type SinwanNode } from "sinwan/component";
import { signal } from "sinwan/reactivity";

import {
  Questionnaire,
  QuestionnaireChoice,
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
} from "../src/components/ui/questionnaire";
import {
  buildCollection,
  collectRenderWarnings,
  isTextEntryElement,
  useQuestionnaire,
  useQuestionnaireChoice,
  useQuestionnaireItem,
} from "../src/components/ui/questionnaire/useQuestionnaire";
import { mountUi, setupDom, teardownDom, withSetup } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

const flush = () => new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

type Field = HTMLElement & {
  checked: boolean;
  value: string;
  reportValidity: () => boolean;
};

function isRenderedChild(value: unknown): value is SinwanNode {
  return (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "object"
  );
}

function changeEvent(target: EventTarget, current: EventTarget): Event {
  const event = new Event("change", { bubbles: true });
  Object.defineProperty(event, "target", { configurable: true, value: target });
  Object.defineProperty(event, "currentTarget", {
    configurable: true,
    value: current,
  });
  return event;
}

function field(node: Element | null): Field {
  if (!node || node.tagName !== "INPUT") throw new Error("missing input");
  return node as Field;
}

function key(
  target: Element,
  name: string,
  init: KeyboardEventInit = {},
): void {
  const event = new KeyboardEvent("keydown", {
    key: name,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
}

function activeItem(): HTMLElement {
  const item = document.querySelector(
    "[data-slot=questionnaire-item][data-active]",
  );
  if (!(item instanceof HTMLElement)) throw new Error("missing active item");
  return item;
}

describe("questionnaire coverage", () => {
  test("hooks throw outside their providers", () => {
    expect(() => withSetup(() => useQuestionnaire())).toThrow(
      "useQuestionnaire must be used within a Questionnaire.",
    );
    expect(() => withSetup(() => useQuestionnaireItem())).toThrow(
      "useQuestionnaireItem must be used within a QuestionnaireItem.",
    );
  });

  test("render warnings cover missing choices, extras, and order", () => {
    const warnings = collectRenderWarnings(
      buildCollection([
        {
          name: "a",
          choices: [{ value: "1" }, { value: "2" }, { value: "gone" }],
        },
      ])!,
      [
        {
          name: "a",
          disabled: false,
          required: false,
          choices: [
            { value: "2", disabled: false },
            { value: "1", disabled: false },
            { value: "extra", disabled: false },
          ],
        },
      ],
      "letters",
    );
    expect(warnings.some((warning) => warning.includes("gone"))).toBe(true);
    expect(warnings.some((warning) => warning.includes("extra"))).toBe(true);
    const order = collectRenderWarnings(
      buildCollection([
        { name: "a", choices: [{ value: "1" }, { value: "2" }] },
      ])!,
      [
        {
          name: "a",
          disabled: false,
          required: false,
          choices: [
            { value: "2", disabled: false },
            { value: "1", disabled: false },
          ],
        },
      ],
      "letters",
    );
    expect(order.some((warning) => warning.includes("Choice order"))).toBe(true);
  });

  test("keyboard confirm, arrows, and shortcuts follow the active item", async () => {
    let submitted = 0;
    const statuses: string[] = [];
    const view = mountUi(() => (
      <Questionnaire
        shortcuts="numbers"
        items={[
          {
            name: "direction",
            required: true,
            choices: [{ value: "one" }, { value: "two" }],
          },
          { name: "notes", required: false },
          { name: "detail", required: false, choices: [{ value: "later" }] },
        ]}
        onSubmit={(event) => {
          event.preventDefault();
          submitted += 1;
        }}
      >
        <QuestionnaireItem
          name="direction"
          required
          onStatusChange={(status) => {
            statuses.push(status);
          }}
        >
          <QuestionnaireChoices>
            <QuestionnaireChoice value="one">One</QuestionnaireChoice>
            <QuestionnaireChoice value="two">Two</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="notes">
          <QuestionnaireInput aria-label="Notes" />
        </QuestionnaireItem>
        <QuestionnaireItem name="detail">
          <QuestionnaireChoices>
            <QuestionnaireChoice value="later">Later</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </Questionnaire>
    ));
    const form = view.query("form");
    if (!form || form.tagName !== "FORM") throw new Error("missing form");

    key(form, "Enter", { metaKey: true });
    await flush();
    expect(form.getAttribute("data-current")).toBe("1");
    expect(
      activeItem().querySelector("[data-slot=questionnaire-error]")?.textContent,
    ).toBe("Choose an answer to continue.");

    key(activeItem(), "ArrowDown");
    await flush();
    const first = field(activeItem().querySelector('input[value="one"]'));
    expect(first.checked).toBe(true);
    expect(statuses).toContain("answered");
    const second = field(activeItem().querySelector('input[value="two"]'));

    const composing = new KeyboardEvent("keydown", {
      key: "2",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(composing, "isComposing", { value: true });
    first.dispatchEvent(composing);
    expect(first.checked).toBe(true);

    const ime = new KeyboardEvent("keydown", {
      key: "2",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(ime, "keyCode", { value: 229 });
    first.dispatchEvent(ime);
    expect(second.checked).toBe(false);

    key(activeItem(), "ArrowRight");
    expect(form.getAttribute("data-current")).toBe("1");
    key(first, "Enter");
    await flush();
    expect(form.getAttribute("data-current")).toBe("2");

    const notes = field(
      activeItem().querySelector("[data-slot=questionnaire-input]"),
    );
    notes.value = "hello";
    notes.dispatchEvent(new Event("change", { bubbles: true }));
    key(notes, "Enter");
    await flush();
    expect(form.getAttribute("data-current")).toBe("3");

    key(activeItem(), "ArrowLeft");
    await flush();
    expect(form.getAttribute("data-current")).toBe("2");
    view.click("[data-slot=questionnaire-skip]");
    await flush();
    expect(form.getAttribute("data-current")).toBe("3");

    const later = field(activeItem().querySelector('input[value="later"]'));
    key(later, "1");
    expect(later.checked).toBe(true);
    key(later, "1", { repeat: true });
    expect(form.getAttribute("data-current")).toBe("3");

    Object.defineProperty(form, "requestSubmit", {
      configurable: true,
      value: undefined,
    });
    key(form, "Enter", { ctrlKey: true });
    await flush();
    expect(submitted).toBe(1);
    view.unmount();
  });

  test("submit jumps back to an earlier invalid item and reset restores the start", async () => {
    const current = signal("detail");
    const seen: string[] = [];
    const formRef: { current: HTMLFormElement | null } = { current: null };
    const view = mountUi(() => (
      <Questionnaire
        ref={formRef}
        item={current.value}
        defaultItem="direction"
        items={[
          { name: "direction", required: true, choices: [{ value: "one" }] },
          { name: "detail", required: false },
        ]}
        onItemChange={(name) => {
          seen.push(name);
          current.value = name;
        }}
      >
        <QuestionnaireItem name="direction" required>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="one">One</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="detail">
          <QuestionnaireInput aria-label="Detail" defaultValue="note" />
        </QuestionnaireItem>
        <QuestionnaireSubmit />
      </Questionnaire>
    ));
    expect(formRef.current?.tagName).toBe("FORM");
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "2",
    );
    view.click("[data-slot=questionnaire-submit]");
    await flush();
    expect(current.value).toBe("direction");
    expect(seen).toContain("direction");

    current.value = "detail";
    await flush();
    const form = view.query("form");
    form?.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    await flush();
    expect(seen.at(-1)).toBe("direction");
    view.unmount();
  });

  test("an uncontrolled questionnaire follows the rendered items and a removed item", async () => {
    const list = signal([{ name: "alpha" }, { name: "beta" }]);
    const view = mountUi(() => (
      <Questionnaire items={list.value} shortcuts="letters">
        <QuestionnaireItem name="alpha">
          <QuestionnaireChoices
            render={(partProps) => (
              <div {...partProps} data-host="choices">
                {isRenderedChild(partProps.children) ? partProps.children : null}
              </div>
            )}
          >
            <QuestionnaireChoice value="a">A</QuestionnaireChoice>
            <QuestionnaireChoice value="b">B</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="beta">
          <QuestionnaireDescription render={(partProps) => <em {...partProps} />}>
            Optional
          </QuestionnaireDescription>
          <QuestionnaireInput
            aria-label="Beta"
            render={(partProps) => <input {...partProps} data-host="input" />}
          />
        </QuestionnaireItem>
        <QuestionnaireNext onclick={(event) => event.preventDefault()} />
      </Questionnaire>
    ));
    expect(
      view.query("[data-slot=questionnaire-choices]")?.getAttribute("data-host"),
    ).toBe("choices");
    expect(
      view.query("[data-slot=questionnaire-choices]")?.getAttribute("data-shortcuts"),
    ).toBe("letters");
    view.click("[data-slot=questionnaire-next]");
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "1",
    );

    list.value = [{ name: "beta" }];
    await flush();
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "1",
    );
    expect(view.query("[data-slot=questionnaire-input]")?.getAttribute("data-host")).toBe(
      "input",
    );
    view.unmount();
  });

  test("controlled open state, native validity, and multiple defaults stay in sync", async () => {
    const many = signal(true);
    const text = signal("kept");
    const checked = signal(true);
    const statuses: string[] = [];
    let reported = false;
    const view = mountUi(() => (
      <Questionnaire
        noValidate={false}
        items={[
          { name: "mail", required: true },
          {
            name: "picks",
            required: false,
            choices: [{ value: "a" }, { value: "b" }],
          },
        ]}
      >
        <QuestionnaireItem name="mail" required>
          <QuestionnaireInput type="email" aria-label="Email" value={text.value} />
          <QuestionnaireError render={(partProps, state) => (
            <strong {...partProps} data-bad={state.invalid ? "yes" : "no"} />
          )} />
        </QuestionnaireItem>
        <QuestionnaireItem
          name="picks"
          multiple={many.value}
          onStatusChange={(status) => {
            statuses.push(status);
          }}
        >
          <QuestionnaireChoices>
            <QuestionnaireChoice value="a" defaultChecked>
              A
            </QuestionnaireChoice>
            <QuestionnaireChoice value="b" checked={checked.value}>
              B
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </Questionnaire>
    ));
    const email = field(view.query("[data-slot=questionnaire-input]"));
    expect(email.value).toBe("kept");
    Object.defineProperty(email, "willValidate", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(email, "validity", {
      configurable: true,
      get: () => ({ valid: false }),
    });
    email.reportValidity = () => {
      reported = true;
      return false;
    };
    view.click("[data-slot=questionnaire-next]");
    expect(reported).toBe(true);
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "1",
    );

    text.value = "person@example.com";
    Object.defineProperty(email, "validity", {
      configurable: true,
      get: () => ({ valid: true }),
    });
    email.value = "person@example.com";
    view.click("[data-slot=questionnaire-next]");
    await flush();
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "2",
    );

    const boxes = view.queryAll("[data-slot=questionnaire-choice-input]").map((box) => field(box));
    expect(boxes.filter((box) => box.checked)).toHaveLength(2);
    many.value = false;
    await flush();
    const remaining = view
      .queryAll("[data-slot=questionnaire-choice-input]")
      .map((box) => field(box))
      .filter((box) => box.checked);
    expect(remaining).toHaveLength(1);
    expect(statuses).toContain("answered");

    view.unmount();
  });

  test("an unchecked default and an unmounted choice update selection", async () => {
    const present = signal(true);
    const statuses: string[] = [];
    const view = mountUi(() => (
      <Questionnaire
        items={[
          { name: "pick", required: false, choices: [{ value: "a" }, { value: "b" }] },
        ]}
      >
        <QuestionnaireItem
          name="pick"
          multiple
          onStatusChange={(status) => {
            statuses.push(status);
          }}
        >
          <QuestionnaireChoices>
            <QuestionnaireChoice value="a" defaultChecked>
              A
            </QuestionnaireChoice>
            {present.value ? (
              <QuestionnaireChoice value="b" defaultChecked>
                B
              </QuestionnaireChoice>
            ) : null}
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await flush();
    const first = field(view.query('input[value="a"]'));
    first.click();
    await flush();
    expect(first.checked).toBe(false);
    present.value = false;
    await flush();
    expect(statuses).toContain("unanswered");
    view.unmount();
  });

  test("disabling the selected choice reports unanswered", async () => {
    const disabled = signal(false);
    const statuses: string[] = [];
    const view = mountUi(() => (
      <Questionnaire
        items={[{ name: "pick", required: true, choices: [{ value: "a" }] }]}
      >
        <QuestionnaireItem
          name="pick"
          required
          onStatusChange={(status) => {
            statuses.push(status);
          }}
        >
          <QuestionnaireChoices>
            <QuestionnaireChoice value="a" disabled={disabled.value}>
              A
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await flush();
    field(view.query("[data-slot=questionnaire-choice-input]")).click();
    await flush();
    disabled.value = true;
    await flush();
    expect(statuses).toContain("unanswered");
    view.unmount();
  });

  test("a skipped controlled choice ignores a matching change and an empty flow stays put", async () => {
    const hold: { onChange?: (event: Event) => void } = {};
    const Capture = cc((props: { checked?: boolean }) => {
      const choice = useQuestionnaireChoice({
        value: "held",
        checked: props.checked,
      });
      hold.onChange = choice.onChange;
      return <input data-testid="held" ref={choice.setInput} />;
    });
    const names: string[] = [];
    const view = mountUi(() => (
      <Questionnaire
        items={[{ name: "optional" }]}
        onItemChange={(name) => {
          names.push(name);
        }}
      >
        <QuestionnaireItem name="optional">
          <QuestionnaireChoices>
            <Capture checked />
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireSkip />
      </Questionnaire>
    ));
    await flush();
    view.click("[data-slot=questionnaire-skip]");
    await flush();
    const input = field(view.query("[data-testid=held]"));
    input.checked = true;
    const span = document.createElement("span");
    hold.onChange?.(changeEvent(input, input));
    hold.onChange?.(changeEvent(span, input));
    hold.onChange?.(changeEvent(span, span));
    expect(input.isConnected).toBe(true);
    view.unmount();
  });

  test("a controlled item that is not in the flow moves to the first item", async () => {
    const current = signal("missing");
    const view = mountUi(() => (
      <Questionnaire
        item={current.value}
        items={[{ name: "alpha" }]}
        onItemChange={(name) => {
          current.value = name;
        }}
      >
        <QuestionnaireItem name="alpha">
          <QuestionnaireInput aria-label="Alpha" />
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await flush();
    expect(current.value).toBe("alpha");
    view.unmount();
  });

  test("a questionnaire without a collection uses the mounted items", async () => {
    const view = mountUi(() => (
      <Questionnaire shortcuts="letters">
        <QuestionnaireItem name="only">
          <QuestionnaireChoices>
            <QuestionnaireChoice
              value="yes"
              render={(partProps) => (
                <label {...partProps} data-host="choice">
                  {isRenderedChild(partProps.children) ? partProps.children : null}
                </label>
              )}
            >
              Yes
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireSkip />
        <QuestionnaireNext disabled />
        <QuestionnaireSubmit render={(partProps, state) => (
          <button {...partProps} data-visible={state.visible ? "yes" : "no"} />
        )} />
      </Questionnaire>
    ));
    expect(view.query("[data-slot=questionnaire-choice]")?.getAttribute("data-host")).toBe(
      "choice",
    );
    const choice = field(view.query("[data-slot=questionnaire-choice-input]"));
    const form = view.query("form");
    if (!form) throw new Error("missing form");
    await flush();
    key(form, "a");
    expect(choice.checked).toBe(true);
    expect(
      view.query("[data-slot=questionnaire-submit]")?.getAttribute("data-visible"),
    ).toBe("yes");
    view.click("[data-slot=questionnaire-next]");
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-current")).toBe(
      "1",
    );
    view.unmount();
  });

  test("without definitions, flow and shortcuts follow the rendered order", async () => {
    const view = mountUi(() => (
      <Questionnaire shortcuts="numbers">
        <QuestionnaireItem name="first">
          <QuestionnaireChoices>
            <QuestionnaireChoice value="red">Red</QuestionnaireChoice>
            <QuestionnaireChoice value="blue">Blue</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="second">
          <QuestionnaireInput aria-label="Second" />
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await flush();
    expect(view.query("[data-slot=questionnaire]")?.getAttribute("data-total")).toBe(
      "2",
    );
    const shortcuts = view
      .queryAll("[data-slot=questionnaire-choice]")
      .map((choice) => choice.getAttribute("data-shortcut"));
    expect(shortcuts).toEqual(["1", "2"]);
    expect(activeItem().querySelector('input[value="red"]')).not.toBeNull();
    const form = view.query("form");
    if (!form) throw new Error("missing form");
    key(form, "2");
    const blue = field(view.query('input[value="blue"]'));
    expect(blue.checked).toBe(true);
    key(blue, "Enter");
    await flush();
    expect(activeItem().querySelector('[aria-label="Second"]')).not.toBeNull();
    view.unmount();
  });

  test("element renders keep a string or function tag and fall back otherwise", async () => {
    const Host = cc((props: { children?: SinwanNode }) => (
      <article {...props} data-function-host="" />
    ));
    const view = mountUi(() => (
      <Questionnaire items={[{ name: "alpha" }]}>
        <QuestionnaireItem name="alpha">
          <QuestionnaireTitle
            render={{ tag: "section", props: { class: "hosted-title" }, children: [] }}
          >
            Title
          </QuestionnaireTitle>
          <QuestionnaireDescription
            render={{ tag: Host, props: {}, children: [] }}
          >
            Body
          </QuestionnaireDescription>
          <QuestionnaireProgress
            render={{ tag: Symbol("host"), props: {}, children: [] }}
          />
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await flush();
    expect(view.query("section")?.textContent).toContain("Title");
    expect(view.query("section")?.getAttribute("data-slot")).toBe("questionnaire-title");
    expect(view.query("section")?.classList.contains("hosted-title")).toBe(true);
    expect(view.query("[data-function-host]")?.textContent).toContain("Body");
    expect(view.query("[data-slot=questionnaire-progress]")?.tagName).toBe("DIV");
    view.unmount();
  });

  test("text entry detection ignores radios and empty targets", () => {
    const input = document.createElement("input");
    input.type = "text";
    expect(isTextEntryElement(input)).toBe(true);
    input.type = "radio";
    expect(isTextEntryElement(input)).toBe(false);
    expect(isTextEntryElement(null)).toBe(false);
  });
});
