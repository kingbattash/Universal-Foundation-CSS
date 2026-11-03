import type { PatternId } from "./contracts.js";
export interface PatternSpecification {
  readonly id:PatternId;
  readonly webSemantics:string;
  readonly nativeEquivalent:string;
  readonly reviewStates:readonly ("loading"|"success"|"error"|"empty"|"disabled")[];
  readonly responsiveRule:string;
  readonly caution:string;
}
/** A finite reference catalog; product-specific layouts can ignore every entry. */
export const patternSpecifications = {
  hero:{id:"hero",webSemantics:"Primary heading and action in source order",nativeEquivalent:"Screen intro with title, context and action",reviewStates:["loading","error"],responsiveRule:"Stack content in the same reading order",caution:"Never autoplay required instructions"},
  article:{id:"article",webSemantics:"article, section headings, figure/captions and source links",nativeEquivalent:"Reading screen with scaled text and accessible section headings",reviewStates:["loading","error","empty"],responsiveRule:"Constrain reading width only where useful; never clip enlarged text",caution:"Decorative sidebars do not outrank text semantics"},
  dashboard:{id:"dashboard",webSemantics:"Heading, critical exceptions, actionable tasks and reports",nativeEquivalent:"Accessible task overview with independently reachable regions",reviewStates:["loading","error","empty"],responsiveRule:"Reflow regions without DOM/focus order contradiction",caution:"Operational tasks take precedence over decorative metrics"},
  form:{id:"form",webSemantics:"Native form with labels, constraints, errors and explicit submit",nativeEquivalent:"Keyboard-safe form with TextInput and clear validation",reviewStates:["loading","success","error","disabled"],responsiveRule:"Allow zoom and on-screen keyboard without hiding required fields",caution:"Server acknowledgement precedes success feedback"},
  collection:{id:"collection",webSemantics:"List or grid with named heading, controls and status",nativeEquivalent:"Accessible list with stable item identity and pagination or incremental load",reviewStates:["loading","error","empty"],responsiveRule:"Keep filters and item order meaningful at narrow widths",caution:"Cards are optional, not the correct format for every dataset"},
  section:{id:"section",webSemantics:"section or region with accurate heading level when named",nativeEquivalent:"Named content group accessible to assistive technology",reviewStates:["loading","empty"],responsiveRule:"Content grows naturally with language and scale",caution:"No arbitrary heading-level skipping"},
  "editorial-split":{id:"editorial-split",webSemantics:"Narrative first with figure and attribution in useful reading order",nativeEquivalent:"Responsive narrative and media with accessible descriptions",reviewStates:["loading","error"],responsiveRule:"Stack in narrative order; media does not block task completion",caution:"Do not use CSS order to rearrange speech order"},
  filters:{id:"filters",webSemantics:"Form controls with labels, selected-value summary and clear action",nativeEquivalent:"Accessible filter controls or native selection sheet",reviewStates:["loading","error","empty"],responsiveRule:"Wrap controls; never hide active filter state from keyboard users",caution:"Applied filters and results count must be discoverable"},
  table:{id:"table",webSemantics:"table, caption, th scope, named toolbar and appropriate sort state",nativeEquivalent:"Accessible records list with column names repeated for context",reviewStates:["loading","success","error","empty"],responsiveRule:"Use operable horizontal scrolling when preserving table structure",caution:"Do not claim visual cards are equivalent to relational tables"},
  auth:{id:"auth",webSemantics:"Native form, password autocomplete, recovery links and explicit errors",nativeEquivalent:"Secure keyboard-aware login screen with accessible credentials",reviewStates:["loading","success","error","disabled"],responsiveRule:"Keep credentials visible when virtual keyboard opens",caution:"No success until server confirms authentication"},
} as const satisfies Record<PatternId,PatternSpecification>;
export function getPatternSpecification(id:PatternId):PatternSpecification{return patternSpecifications[id];}
