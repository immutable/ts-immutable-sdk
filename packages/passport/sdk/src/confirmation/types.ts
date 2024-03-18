export enum SendMessage {
  CONFIRMATION_START = 'confirmation_start',
}

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
  MESSAGE_CONFIRMED = 'message_confirmed',
  MESSAGE_REJECTED = 'message_rejected',
  LOGOUT_SUCCESS = 'logout_success',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export const PASSPORT_EVENT_TYPE = 'imx_passport_confirmation';
