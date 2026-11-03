/**
 * Historical page-construction methods are REFERENCES only. Different authors
 * reconstruct them differently. No automatically generated universal geometry
 * or accessibility claim is implied.
 */
export const classicalCanonReferences = [
  { id:"golden-canon", attribution:"General name for historical proportional page constructions",
    note:"Not a single agreed algorithm; do not substitute a golden ratio for a documented historical method." },
  { id:"van-de-graaf", attribution:"Van de Graaf's page construction",
    note:"Study the published diagonal construction before producing a measured implementation; margins vary by reconstruction." },
  { id:"rosarivo", attribution:"Raúl Rosarivo's reconstructed page canon",
    note:"Often described with ninths; manuscript proportions and interpretations vary." },
  { id:"villard", attribution:"Villard de Honnecourt geometric divisions",
    note:"Historical attribution and exact practical typography use require source-critical interpretation." },
] as const;
export type ClassicalCanonId = typeof classicalCanonReferences[number]["id"];
