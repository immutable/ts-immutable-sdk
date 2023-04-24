/**
 * Namespaces for Custom Events emitted by the Economy SDK
 */
export const EconomyCustomEvents = {
  DEFAULT: 'imtbl-economy-event',
} as const;
export type EconomyCustomEvent =
  (typeof EconomyCustomEvents)[keyof typeof EconomyCustomEvents];

/**
 * Generic status use to track progress in any Economy SDK action
 */
export enum EventStatuses {
  'INITIAL' = 'INITIAL',
  'IN_PROGRESS' = 'IN_PROGRESS',
  'COMPLETE' = 'COMPLETE',
  'FAILED' = 'FAILED',
}
export type EventStatus = keyof typeof EventStatuses;

/**
 * Generic event status object used to track progress in a particular Economy SDK action
 */
export interface IEventType<
  Type extends string,
  Status extends string = EventStatus
> {
  type: Type;
  status: Status;
}

/**
 * Generic sdk action response object
 */
export interface IEventResponse<
  Type extends string,
  Data = Record<string, unknown>
> {
  type: Type;
  status: EventStatus;
  data: Data;
}
