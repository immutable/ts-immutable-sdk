import { DirectLoginMethod, MarketingConsentStatus } from "../types";

export enum ConfirmationSendMessage {
  CONFIRMATION_START = 'confirmation_start',
}

export enum ConfirmationReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
  TRANSACTION_REJECTED = 'transaction_rejected',
  MESSAGE_CONFIRMED = 'message_confirmed',
  MESSAGE_ERROR = 'message_error',
  MESSAGE_REJECTED = 'message_rejected',
}

export enum EmbeddedLoginPromptReceiveMessage {
  LOGIN_METHOD_SELECTED = 'login_method_selected',
  LOGIN_PROMPT_ERROR = 'login_prompt_error',
  LOGIN_PROMPT_CLOSED = 'login_prompt_closed',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export type EmbeddedLoginPromptResult = {
  marketingConsent: MarketingConsentStatus;
} & (
  | { loginType: 'email'; emailAddress: string }
  | { loginType: Exclude<DirectLoginMethod, 'email'>; emailAddress?: never }
);

export const PASSPORT_CONFIRMATION_EVENT_TYPE = 'imx_passport_confirmation';
export const EMBEDDED_LOGIN_PROMPT_EVENT_TYPE = 'im_passport_embedded_login_prompt';
