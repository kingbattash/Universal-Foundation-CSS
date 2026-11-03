/** Completely creator-owned pattern; no palette, DOM layout or grid inherited. */
export interface CreatorPattern {
  readonly id:string;
  readonly purpose:string;
  readonly readingOrder:readonly string[];
  readonly reviewStates?:readonly string[];
  readonly notes?:string;
}
function printable(value:unknown,name:string):string{
  if(typeof value!=="string"||!value.trim()||value.length>256||/[\u0000-\u001f\u007f]/u.test(value))
    throw new TypeError(name+" must be printable, nonempty and at most 256 characters");
  return value.trim();
}
export function definePattern(input:CreatorPattern):Readonly<CreatorPattern>{
  if(!input||typeof input!=="object")throw new TypeError("pattern must be an object");
  const id=printable(input.id,"id"),purpose=printable(input.purpose,"purpose");
  if(!Array.isArray(input.readingOrder))throw new TypeError("readingOrder must be an array");
  const readingOrder=input.readingOrder.map(s=>printable(s,"readingOrder entry"));
  if(new Set(readingOrder).size!==readingOrder.length)throw new RangeError("duplicate readingOrder entry");
  if(input.reviewStates!==undefined && !Array.isArray(input.reviewStates))throw new TypeError("reviewStates must be an array");
  const reviewStates=input.reviewStates?.map(s=>printable(s,"reviewState"));
  if(reviewStates && new Set(reviewStates).size!==reviewStates.length)throw new RangeError("duplicate reviewState");
  const notes=input.notes===undefined?undefined:printable(input.notes,"notes");
  return Object.freeze({id,purpose,readingOrder:Object.freeze(readingOrder),
    ...(reviewStates===undefined?{}:{reviewStates:Object.freeze(reviewStates)}),
    ...(notes===undefined?{}:{notes})});
}
