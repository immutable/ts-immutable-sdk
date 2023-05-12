import { CryptoFiat, CryptoFiatConfiguration } from '@imtbl/cryptofiat';
import {
  CryptoFiatActions,
  FiatSymbols,
  SetCryptoFiatPayload,
  SetFiatSymbolPayload,
  cryptoFiatReducer,
  initialCryptoFiatState,
  SetTokenSymbolsPayload,
  SetConversionsPayload,
} from './CryptoFiatContext';

describe('CryptoFiatContext', () => {
  it('should update state with cryptoFiat when reducer called with SET_CRYPTO_FIAT action', () => {
    const setCryptoFiatPayload: SetCryptoFiatPayload = {
      type: CryptoFiatActions.SET_CRYPTO_FIAT,
      cryptoFiat: new CryptoFiat(new CryptoFiatConfiguration({})),
    };

    expect(initialCryptoFiatState.cryptoFiat).toBeNull();
    const { cryptoFiat } = cryptoFiatReducer(initialCryptoFiatState, {
      payload: setCryptoFiatPayload,
    });

    expect(cryptoFiat).toBeInstanceOf(CryptoFiat);
  });

  it('should update state with fiat symbol when reducer called with SET_FIAT_SYMBOL action', () => {
    const setFiatSymbolPayload: SetFiatSymbolPayload = {
      type: CryptoFiatActions.SET_FIAT_SYMBOL,
      fiatSymbol: FiatSymbols.USD,
    };

    const { fiatSymbol } = cryptoFiatReducer(initialCryptoFiatState, {
      payload: setFiatSymbolPayload,
    });

    expect(fiatSymbol).toEqual(FiatSymbols.USD);
  });

  it('should update state token symbols when reducer called with SET_TOKEN_SYMBOLS action', () => {
    const setTokenSymbolsPayload: SetTokenSymbolsPayload = {
      type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
      tokenSymbols: ['eth', 'imx', 'matic'],
    };

    const { tokenSymbols } = cryptoFiatReducer(initialCryptoFiatState, {
      payload: setTokenSymbolsPayload,
    });

    expect(tokenSymbols).toEqual(['eth', 'imx', 'matic']);
  });

  it('should update conversions when reducer called with SET_CONVERSIONS action', () => {
    const conversionsMap = new Map<string, number>([
      ['eth', 12.1],
      ['imx', 100],
      ['matic', 5],
    ]);

    const setConversionsPayload: SetConversionsPayload = {
      type: CryptoFiatActions.SET_CONVERSIONS,
      conversions: conversionsMap,
    };

    const { conversions } = cryptoFiatReducer(initialCryptoFiatState, {
      payload: setConversionsPayload,
    });

    expect(conversions).toEqual(conversionsMap);
  });
});
