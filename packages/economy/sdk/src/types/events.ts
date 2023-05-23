/**
 * @internal Utility type to create Event types for each EventAction
 */
export type EventData<S = EventStatus, D = unknown> = { status: S } & D;
export type EventType<A = EventAction, D = EventData> = { action: A } & D;

/**
 * @public Namespaces for Custom Events emitted by the Economy SDK
 */
export enum EconomyCustomEventTypes {
  DEFAULT = 'imtbl-economy-event',
}
export type EconomyCustomEventType =
  (typeof EconomyCustomEventTypes)[keyof typeof EconomyCustomEventTypes];

/**
 * @public Generic statuses used to track progress in any Economy SDK action
 */
export enum EventStatuses {
  'STARTED' = 'STARTED',
  'IN_PROGRESS' = 'IN_PROGRESS',
  'COMPLETED' = 'COMPLETED',
  'FAILED' = 'FAILED',
}
export type EventStatus = keyof typeof EventStatuses;

/**
 * @public Names of all public SDK methods
 */
export enum EventActions {
  'CRAFT' = 'CRAFT',
}
export type EventAction = keyof typeof EventActions;

/**
 * Types of SDK Errors
 */
export type ErrorType =
  | 'CRAFTING_ERROR'
  | 'INVENTORY_GET_ITEMS_ERROR'
  | 'RECIPE_GET_RECIPES_ERROR'
  | 'RECIPE_GET_RECIPE_BY_ID_ERROR'
  | 'ITEM_DEFINITION_ERROR'
  | 'UNKNOWN_ERROR';

/** SDK Error Payload */
export type SDKErrorType = {
  type: ErrorType;
  message?: string;
};
