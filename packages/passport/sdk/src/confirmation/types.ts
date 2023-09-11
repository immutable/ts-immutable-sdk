export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export const PASSPORT_EVENT_TYPE = 'imx_passport_confirmation';
