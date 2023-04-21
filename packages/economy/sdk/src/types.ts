/**
 * Event types for Custom Event Subscriptions
 */
export enum CustomEventType {
  ECONOMY = 'imtbl-economy-event',
}

/**
 * Generic status use to track progress in any SDK action
 */
export type EventStatus = 'INITIAL' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';

/**
 * Generic event status object used to track progress in a particular SDK action
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
