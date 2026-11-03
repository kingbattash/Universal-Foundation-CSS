import type { SemanticAction,InteractionState } from "../semantic/semantic.js"

/** API guidance; web/native renderers need not share identical markup. */
export type ComponentContract = Readonly<{
  name:string
  role:string
  states:readonly InteractionState[]
  accessibility:readonly string[]
  slots:readonly string[]
}>
export const componentContracts = {
  button: {
    name:"Button",role:"Trigger an action",states:["rest","hover","focus-visible","pressed","disabled","loading"],
    accessibility:["Accessible name required","Keyboard operable","Focus visible","Explain loading and disabled states"],
    slots:["label","leading-icon","trailing-icon"],
  },
  textField: {
    name:"TextField",role:"Collect textual input",states:["rest","focus-visible","disabled","invalid"],
    accessibility:["Persistent associated label","Associated error text","Native input where possible"],
    slots:["label","control","hint","error"],
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
  card: {
    name:"Card",role:"Group related information",states:["rest"],
    accessibility:["Do not introduce clickable divs","Keep logical heading and link order"],
    slots:["header","body","footer"],
  },
} as const satisfies Record<string,ComponentContract>

export type ComponentContractName=keyof typeof componentContracts
export type ActionPriority=SemanticAction
