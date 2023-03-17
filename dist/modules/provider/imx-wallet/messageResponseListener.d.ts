import { Error as ErrorDetails } from './types';
import { ResponseEventType } from './events';
export type ResponseMessageDetails<T> = {
    success: boolean;
    data: T;
    error?: ErrorDetails;
};
export type ResponseMessage<T> = {
    type: ResponseEventType;
    details: ResponseMessageDetails<T>;
};
export declare function messageResponseListener<T>(iframe: HTMLIFrameElement, event: MessageEvent, eventType: ResponseEventType, callback: (response: ResponseMessageDetails<T>) => void): void;
