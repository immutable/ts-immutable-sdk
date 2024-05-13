export enum SendMessage {
  CONFIRMATION_START = 'confirmation_start',
  CONFIRMATION_DATA_READY = 'confirmation_data_ready',
}

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
  TRANSACTION_REJECTED = 'transaction_rejected',
  MESSAGE_CONFIRMED = 'message_confirmed',
  MESSAGE_ERROR = 'message_error',
  MESSAGE_REJECTED = 'message_rejected',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export const PASSPORT_EVENT_TYPE = 'imx_passport_confirmation';
