import { CryptoFiat } from '@imtbl/cryptofiat';
import { createContext } from 'react';

export enum FiatSymbols {
  USD = 'usd',
}

export interface CryptoFiatState {
  cryptoFiat: CryptoFiat | null;
  fiatSymbol: FiatSymbols;
  tokenSymbols: string[];
  conversions: Map<string, number>;
}

export const initialCryptoFiatState: CryptoFiatState = {
  cryptoFiat: null,
  fiatSymbol: FiatSymbols.USD,
  tokenSymbols: [],
  conversions: new Map<string, number>(),
};

export interface CryptoFiatContextState {
  cryptoFiatState: CryptoFiatState;
  cryptoFiatDispatch: React.Dispatch<CryptoFiatAction>;
}

export interface CryptoFiatAction {
  payload: CryptoFiatActionPayload;
}

type CryptoFiatActionPayload =
  | SetCryptoFiatPayload
  | SetFiatSymbolPayload
  | SetTokenSymbolsPayload
  | SetConversionsPayload;

export enum CryptoFiatActions {
  SET_CRYPTO_FIAT = 'SET_CRYPTO_FIAT',
  SET_FIAT_SYMBOL = 'SET_FIAT_SYMBOL',
  SET_TOKEN_SYMBOLS = 'SET_TOKEN_SYMBOLS',
  SET_CONVERSIONS = 'SET_CONVERSIONS',
}

export interface SetCryptoFiatPayload {
  type: CryptoFiatActions.SET_CRYPTO_FIAT;
  cryptoFiat: CryptoFiat;
}

export interface SetFiatSymbolPayload {
  type: CryptoFiatActions.SET_FIAT_SYMBOL;
  fiatSymbol: FiatSymbols;
}

export interface SetTokenSymbolsPayload {
  type: CryptoFiatActions.SET_TOKEN_SYMBOLS;
  tokenSymbols: string[];
}

export interface SetConversionsPayload {
  type: CryptoFiatActions.SET_CONVERSIONS;
  conversions: Map<string, number>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CryptoFiatContext = createContext<CryptoFiatContextState>({
  cryptoFiatState: initialCryptoFiatState,
  cryptoFiatDispatch: () => {},
});

export type Reducer<S, A> = (prevState: S, action: A) => S;

export const cryptoFiatReducer: Reducer<CryptoFiatState, CryptoFiatAction> = (
  state: CryptoFiatState,
  action: CryptoFiatAction,
) => {
  switch (action.payload.type) {
    case CryptoFiatActions.SET_CRYPTO_FIAT:
      return {
        ...state,
        cryptoFiat: action.payload.cryptoFiat,
      };
    case CryptoFiatActions.SET_FIAT_SYMBOL:
      return {
        ...state,
        fiatSymbol: action.payload.fiatSymbol,
      };
    case CryptoFiatActions.SET_TOKEN_SYMBOLS:
      return {
        ...state,
        tokenSymbols: action.payload.tokenSymbols,
      };
    case CryptoFiatActions.SET_CONVERSIONS:
      return {
        ...state,
        conversions: action.payload.conversions,
      };
    default:
      return state;
  }
};
