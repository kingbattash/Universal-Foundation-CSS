/**
 * Framework-neutral operation state model; no DOM, React, style or network APIs.
 * Success is only reachable after an explicit completion event.
 */
export type OperationStatus = "idle" | "loading" | "success" | "error" | "empty" | "disabled";
export type OperationEvent = "start" | "resolve" | "reject" | "no-results" | "disable" | "enable" | "reset";
export interface OperationTransition {
  readonly previous: OperationStatus;
  readonly event: OperationEvent;
  readonly next: OperationStatus;
}
const transitions: Readonly<Record<OperationStatus,Partial<Record<OperationEvent,OperationStatus>>>> = {
  idle: {start:"loading",disable:"disabled",reset:"idle"},
  loading: {resolve:"success",reject:"error","no-results":"empty",reset:"idle"},
  success: {start:"loading",disable:"disabled",reset:"idle"},
  error: {start:"loading",disable:"disabled",reset:"idle"},
  empty: {start:"loading",disable:"disabled",reset:"idle"},
  disabled: {enable:"idle",reset:"idle"},
};
export function transitionOperation(previous: OperationStatus, event: OperationEvent): OperationTransition {
  const next=transitions[previous]?.[event];
  if (!next) throw new RangeError("Invalid operation transition: "+previous+" -> "+event);
  return Object.freeze({previous,event,next});
}
/** Optional user-authored component contract, without any built-in visual requirements. */
export interface CustomComponentContract {
  readonly id:string;
  readonly task:string;
  readonly requiredStates:readonly OperationStatus[];
  readonly webBehavior:string;
  readonly nativeBehavior:string;
  readonly checks:readonly string[];
}
function printable(value:unknown,field:string):string{
  if(typeof value!=="string"||!value.trim()||value.length>512||/[\u0000-\u001f\u007f]/u.test(value))
    throw new TypeError(field+" must be printable, nonempty and at most 512 characters");
  return value.trim();
}
export function defineComponentContract(input:CustomComponentContract):Readonly<CustomComponentContract>{
  if(!input||typeof input!=="object")throw new TypeError("component contract must be an object");
  const id=printable(input.id,"id"),task=printable(input.task,"task");
  const webBehavior=printable(input.webBehavior,"webBehavior");
  const nativeBehavior=printable(input.nativeBehavior,"nativeBehavior");
  if(!Array.isArray(input.requiredStates)||!Array.isArray(input.checks))
    throw new TypeError("requiredStates/checks must be arrays");
  const valid=new Set<OperationStatus>(["idle","loading","success","error","empty","disabled"]);
  if(input.requiredStates.some(s=>!valid.has(s))||new Set(input.requiredStates).size!==input.requiredStates.length)
    throw new RangeError("invalid or duplicate component states");
  const checks=input.checks.map(s=>printable(s,"check"));
  if(new Set(checks).size!==checks.length)throw new RangeError("duplicate check");
  return Object.freeze({id,task,webBehavior,nativeBehavior,
    requiredStates:Object.freeze([...input.requiredStates]),
    checks:Object.freeze(checks)});
}
