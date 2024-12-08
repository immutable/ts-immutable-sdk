export enum FiatOptionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum RiveStateMachineInput {
  START = 0,
  WAITING = 1,
  PROCESSING = 2,
  COMPLETED = 3,
  ERROR = 4,
}

export type AddTokensError = {
  type: AddTokensErrorTypes;
  data?: Record<string, unknown>;
};

export enum AddTokensErrorTypes {
  DEFAULT = 'DEFAULT_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  SERVICE_BREAKDOWN = 'SERVICE_BREAKDOWN',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNRECOGNISED_CHAIN = 'UNRECOGNISED_CHAIN',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  WALLET_FAILED = 'WALLET_FAILED',
  WALLET_REJECTED = 'WALLET_REJECTED',
  WALLET_REJECTED_NO_FUNDS = 'WALLET_REJECTED_NO_FUNDS',
  WALLET_POPUP_BLOCKED = 'WALLET_POPUP_BLOCKED',
  ENVIRONMENT_ERROR = 'ENVIRONMENT_ERROR',
  ROUTE_ERROR = 'ROUTE_ERROR',
}

export enum AddTokensExperiments {
  PRESELECTED_TOKEN = 'addTokensPreselectedToken',
}
