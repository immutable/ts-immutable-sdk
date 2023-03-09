import { RequestEventType } from './events';
export type RequestMessage<T> = {
    type: RequestEventType;
    details?: T;
};
export declare function postRequestMessage<T>(iframe: HTMLIFrameElement, payload: RequestMessage<T>): void;
