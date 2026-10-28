import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireTitle,
  type QuestionnaireChoiceState,
  type QuestionnaireInputState,
} from "../src/components/ui/questionnaire";
import { mountUi, setupDom, teardownDom } from "./helpers";

beforeEach(() => {
  setupDom();
});

afterEach(() => {
  teardownDom();
});

describe("questionnaire render hosts", () => {
  test("title and description renders keep their part props", () => {
    const view = mountUi(() => (
      <Questionnaire>
        <QuestionnaireItem name="first">
          <QuestionnaireTitle
            class="custom-title"
            render={(partProps) => <h2 {...partProps} />}
          >
            First
          </QuestionnaireTitle>
          <QuestionnaireDescription
            id="first-help"
            render={{ tag: "div", props: {}, children: [] }}
          >
            Help
          </QuestionnaireDescription>
        </QuestionnaireItem>
      </Questionnaire>
    ));
    const title = view.query("h2");
    expect(title?.getAttribute("data-slot")).toBe("questionnaire-title");
    expect(title?.classList.contains("custom-title")).toBe(true);
    expect(title?.textContent).toBe("First");
    const description = view.query('[data-slot="questionnaire-description"]');
    expect(description?.tagName).toBe("DIV");
    expect(description?.getAttribute("id")).toBe("first-help");
    expect(view.query("fieldset")?.getAttribute("aria-describedby")).toContain(
      "first-help",
    );
    view.unmount();
  });

  test("choices, choice, and input renders receive live state objects", async () => {
    const choicesStates: unknown[] = [];
    const choiceStates: QuestionnaireChoiceState[] = [];
    const inputStates: QuestionnaireInputState[] = [];
    const view = mountUi(() => (
      <Questionnaire shortcuts="letters">
        <QuestionnaireItem name="pick">
          <QuestionnaireChoices
            render={(partProps, state) => {
              choicesStates.push(state);
              return <div {...partProps} />;
            }}
          >
            <QuestionnaireChoice
              value="yes"
              render={(partProps, state) => {
                choiceStates.push(state);
                return <label {...partProps} />;
              }}
            >
              Yes
            </QuestionnaireChoice>
            <QuestionnaireInput
              aria-label="Other"
              render={(partProps, state) => {
                inputStates.push(state);
                return <input {...partProps} />;
              }}
            />
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>
    ));
    await Promise.resolve();

    expect(choiceStates).toHaveLength(1);
    expect(choicesStates.at(-1)).toEqual({ shortcuts: "letters" });
    expect(choiceStates.at(-1)).toMatchObject({
      checked: false,
      disabled: false,
      type: "radio",
    });
    expect(inputStates.at(-1)).toEqual({
      disabled: false,
      filled: false,
      invalid: false,
    });
    expect(view.query('[data-slot="questionnaire-choices"]')?.textContent).toContain(
      "Yes",
    );

    view.click('input[value="yes"]');
    await Promise.resolve();
    expect(choiceStates.at(-1)?.checked).toBe(true);
    expect(
      view.query('[data-slot="questionnaire-choice"]')?.getAttribute("data-state"),
    ).toBe("checked");

    const field = view.query('[data-slot="questionnaire-input"]');
    if (!(field instanceof HTMLElement)) throw new Error("missing input");
    Object.defineProperty(field, "value", { value: "maybe", configurable: true });
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    expect(view.query('[data-slot="questionnaire-input"]')).toBe(field);
    expect(inputStates).toHaveLength(1);
    expect(inputStates[0]?.filled).toBe(true);
    view.unmount();
  });
});
