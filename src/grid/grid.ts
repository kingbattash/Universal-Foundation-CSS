/**
 * Grid theory is opt-in. A registered historical reference does not mean
 * a cross-browser CSS implementation exists.
 */
export type GridFamily = "web" | "editorial" | "geometric" | "classical" | "spacing";
export type GridSupport = "css-recipe" | "mathematical" | "reference";
export interface GridDefinition {
  readonly id: string;
  readonly name: string;
  readonly family: GridFamily;
  readonly support: GridSupport;
  readonly use: string;
  readonly caution: string;
  /** Specific family/entry source and methodology note, not an endorsement. */
  readonly referenceNote: string;
  /** Present only when a tested, opt-in CSS selector is provided. */
  readonly cssSelector?: string;
}
