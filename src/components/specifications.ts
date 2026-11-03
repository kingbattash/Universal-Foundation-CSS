import type { ComponentContractName } from "./contracts.js";

export type SupportStatus = "guidance" | "native-primitive" | "custom-pattern";
export interface ComponentSpecification {
  readonly id: ComponentContractName;
  readonly task: string;
  readonly web: string;
  readonly native: string;
  readonly keyboard: readonly string[];
  readonly screenReader: readonly string[];
  readonly stateReview: readonly ("idle"|"loading"|"success"|"error"|"empty"|"disabled")[];
  readonly constraints: readonly string[];
  readonly support: SupportStatus;
}
/** Specifications do not ship rendered components or an implicit framework. */
export const componentSpecifications = {
  button: {
    id:"button",task:"Perform a discrete user action",
    web:"Native <button type='button|submit'>. Keep the label and keyboard activation; use disabled or guarded busy logic based on the task.",
    native:"Pressable/Button with accessibilityRole='button', accessible label and disabled/busy state when applicable.",
    keyboard:["Enter or Space activates a focused native button","No keyboard focus for a natively disabled button; make reasons discoverable nearby"],
    screenReader:["Accessible name states what the action does","Busy feedback is announced separately; do not label it completed until confirmed"],
    stateReview:["idle","loading","success","error","disabled"],
    constraints:["Prevent unintended duplicate submissions while in progress","Avoid icon-only controls without an accessible label"],support:"native-primitive",
  },
  textField: {
    id:"textField",task:"Receive and validate textual data",
    web:"Use label-for/input-id pairing, autocomplete when appropriate and aria-describedby for hints/errors.",
    native:"TextInput with accessibilityLabel or visible accessible label, relevant keyboardType and clear error text.",
    keyboard:["Native text editing and tab navigation","Do not swallow Escape/Enter arbitrarily"],
    screenReader:["Announce name, value and required/invalid state when true","Connect help/error message to the field"],
    stateReview:["idle","error","disabled"],
    constraints:["Never depend on placeholder text as the only label","Do not discard entered values on validation error"],support:"native-primitive",
  },
  select: {
    id:"select",task:"Choose a predefined value",
    web:"Prefer <select> with an explicit <label>. If custom combobox, implement APG keyboard behavior and popup ownership.",
    native:"Platform picker or explicitly accessible custom selection interface; expose selected value and state.",
    keyboard:["Native select supports platform keyboard behavior","Custom combobox requires separately designed arrow/escape/selection keyboard logic"],
    screenReader:["Label the current value and invalid state","Expose option availability and selected choice"],
    stateReview:["idle","error","disabled"],
    constraints:["Never use a clickable div as an unlabeled select replacement","Avoid complex custom popup controls when native picker meets the task"],support:"native-primitive",
  },
  feedback: {
    id:"feedback",task:"Communicate progress, result or validation",
    web:"Use status/live-region or alert semantics when necessary, but do not add duplicate announcements on first render.",
    native:"Visible text and platform accessibility announcement/live-region strategy when supported.",
    keyboard:["Allow action to remain reachable after message appears","On invalid form submission, focus a useful error/field where appropriate"],
    screenReader:["Use appropriate urgency for announcement","Success only after completion is confirmed by the underlying operation"],
    stateReview:["idle","loading","success","error","empty"],
    constraints:["Color alone is insufficient","Do not promise a successful action before the host/server reports it"],support:"custom-pattern",
  },
  dialog: {
    id:"dialog",task:"Focus a modal decision while preventing background interaction",
    web:"Prefer <dialog>.showModal() with a named heading, focus management and explicit close decision; custom role=dialog needs full modal handling.",
    native:"Platform modal presentation with accessibility focus and screen-reader isolation; return focus to a logical trigger if possible.",
    keyboard:["Tab and Shift+Tab remain within modal focusables","Escape generally closes cancellable modal","Return focus to triggering element or logical next step"],
    screenReader:["Supply title accessible name and description when useful","Modal content is announced as distinct from inert background"],
    stateReview:["idle","loading","success","error","disabled"],
    constraints:["Do not falsely set aria-modal when background remains interactive","Do not permit accidental dismissal during irreversible confirmation"],support:"native-primitive",
  },
  tabs: {
    id:"tabs",task:"Select a local panel without navigating away",
    web:"Implement tablist/tab/tabpanel ARIA associations and roving tabindex. Manual activation when panels may load slowly.",
    native:"Tabs or segmented controls with selected accessibilityState, focus/selection behavior appropriate to the platform.",
    keyboard:["Tab enters and exits tablist","Horizontal ArrowLeft/ArrowRight move focus; Home/End optionally move endpoints","Manual activation uses Enter/Space; arrow focus alone does not select"],
    screenReader:["Announce tab name and selected state","Associate the selected tab with its visible panel"],
    stateReview:["idle","loading","error","disabled"],
    constraints:["Do not mix focus and selection in manual-activation mode","Use only one selected tab in single-selection tablist"],support:"custom-pattern",
  },
  navigation: {
    id:"navigation",task:"Navigate destinations with clear location context",
    web:"Use <nav aria-label> and semantic links for routes; mark current page with aria-current='page'.",
    native:"Platform navigation component; accessible route names and current selection state.",
    keyboard:["Links activate with Enter","Ensure keyboard reading/focus sequence matches meaningful route order"],
    screenReader:["Landmarks have distinctive labels if multiple","Current route is identifiable beyond color"],
    stateReview:["idle","loading","disabled"],
    constraints:["Do not replace navigation links with unrelated button events","Responsive menus must stay keyboard reachable"],support:"native-primitive",
  },
  list: {
    id:"list",task:"Read an ordered or unordered collection",
    web:"Use <ul>/<ol>/<li>, not grid rows pretending to be lists.",
    native:"Accessible list items (FlatList/SectionList as appropriate), with meaningful item names and reading order.",
    keyboard:["Items are read in document order; actionable children have natural focus order"],
    screenReader:["Expose list structure when supported","Empty state describes absence and any next action"],
    stateReview:["idle","loading","empty","error"],
    constraints:["Do not omit list semantics for visual convenience","Virtualization must preserve meaningful item identity"],support:"native-primitive",
  },
  table: {
    id:"table",task:"Compare structured relational data",
    web:"Native <table>, caption when useful, proper th scope and aria-sort only for actively sorted header.",
    native:"Accessible rows with column names communicated in each row if real table accessibility semantics are not available.",
    keyboard:["Sort controls must be reachable and activatable","If horizontally scrollable, provide an operable scroll region"],
    screenReader:["Associate row/column headers with cells","Announce sort direction and loading/empty states without color alone"],
    stateReview:["idle","loading","empty","success","error"],
    constraints:["Do not turn a data table into inaccessible decorative cards by default","Sorting must not silently destroy focused context"],support:"native-primitive",
  },
  card: {
    id:"card",task:"Group information without implying interaction",
    web:"Semantic article/section/div based on content, with separate real links/buttons inside.",
    native:"Container with appropriate accessibility grouping; interactive children remain independent.",
    keyboard:["Do not add a fake click target to an inert container"],
    screenReader:["Heading and action labels retain semantic meaning"],
    stateReview:["idle","empty"],constraints:["Avoid nested independent controls inside a single fake link"],support:"guidance",
  },
} as const satisfies Record<ComponentContractName,ComponentSpecification>;
export function getComponentSpecification(id: ComponentContractName): ComponentSpecification {
  return componentSpecifications[id];
}
