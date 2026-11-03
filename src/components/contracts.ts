import type { SemanticAction, InteractionState } from "../semantic/semantic.js";

/**
 * A component describes a TASK and semantic behavior, not a visual appearance.
 * Web and native implementations may have completely different trees/styles.
 */
export type ComponentContract = Readonly<{
  name:string;
  role:string;
  states:readonly InteractionState[];
  accessibility:readonly string[];
  slots:readonly string[];
}>;
export const componentContracts = {
  button: {
    name:"Button", role:"Trigger an action", states:["rest","hover","focus-visible","pressed","disabled","loading"],
    accessibility:["Accessible name required","Keyboard operable","Focus visible","Explain loading and disabled states"],
    slots:["label","leading-icon","trailing-icon"],
  },
  textField: {
    name:"TextField",role:"Collect textual input",states:["rest","focus-visible","disabled","invalid"],
    accessibility:["Persistent associated label","Associated error text","Native input where possible"],
    slots:["label","control","hint","error"],
  },
  select: {
    name:"Select",role:"Choose an option or value from a group",states:["rest","focus-visible","disabled","invalid","selected"],
    accessibility:["Visible associated label","Use native select/picker when practical","Selection and errors announced without color alone"],
    slots:["label","control","hint","error","options"],
  },
  feedback: {
    name:"Feedback",role:"Communicate results, validation and progress",states:["rest","loading","invalid"],
    accessibility:["Status and error text readable","Polite or assertive announcement chosen by urgency","Never claim success before operation completion"],
    slots:["message","detail","action"],
  },
  tabs: {
    name:"Tabs",role:"Switch local panels",states:["rest","hover","focus-visible","selected","disabled"],
    accessibility:["Correct tab/panel associations","Keyboard tab navigation","Active state not color alone"],
    slots:["list","trigger","panel"],
  },
  dialog: {
    name:"Dialog",role:"Present a modal decision",states:["rest","focus-visible","loading"],
    accessibility:["Label and description","Contained focus while open","Return focus to trigger on close"],
    slots:["title","description","content","actions"],
  },
  navigation: {
    name:"Navigation",role:"Offer meaningful destinations and route context",states:["rest","hover","focus-visible","selected","disabled"],
    accessibility:["Descriptive link names","Navigation landmark label when multiple regions","Current page expressed semantically"],
    slots:["label","links","current-indicator","secondary-links"],
  },
  list: {
    name:"List",role:"Group related ordered or unordered content",states:["rest","selected","loading"],
    accessibility:["Preserve native list semantics","Accessible item actions and names","Keep readable sequence in source order"],
    slots:["heading","items","empty","status"],
  },
  table: {
    name:"Table",role:"Present comparable relational data in rows and columns",states:["rest","selected","loading"],
    accessibility:["Header associations and caption where relevant","Sort state and actions have accessible names","Horizontal overflow retains keyboard access"],
    slots:["caption","headers","rows","toolbar","pagination","empty"],
  },
  card: {
    name:"Card",role:"Group related information",states:["rest"],
    accessibility:["Do not introduce clickable divs","Keep logical heading and link order"],
    slots:["header","body","footer"],
  },
} as const satisfies Record<string,ComponentContract>;

export type ComponentContractName=keyof typeof componentContracts;
export type ActionPriority=SemanticAction;
