import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import {
  SetSwapFromAmountPayload,
  SetSwapFromTokenPayload,
  SetSwapToAmountPayload,
  SetSwapToTokenPayload,
  SwapFormActions,
  initialSwapFormState,
  swapFormReducer,
  SetSwapFromTokenErrorPayload,
  SetSwapToTokenErrorPayload,
  SetSwapFromAmountErrorPayload,
  SetSwapToAmountErrorPayload,
  SetBlockFetchQuote,
  SetSwapFromFiatValuePayload,
} from './SwapFormContext';

describe('swap form context', () => {
  it('should set swapTo when reducer called with SET_SWAP_TO action', () => {
    const setSwapToPayload: SetSwapToTokenPayload = {
      type: SwapFormActions.SET_SWAP_TO_TOKEN,
      swapToToken: { name: 'ethereum' } as TokenInfo,
    };

    const { swapToToken } = swapFormReducer(initialSwapFormState, {
      payload: setSwapToPayload,
    });
    expect(swapToToken).toEqual({ name: 'ethereum' });
  });

  it('should set swapToAmount when reducer called with SET_SWAP_TO_AMOUNT action', () => {
    const setSwapToAmountPayload: SetSwapToAmountPayload = {
      type: SwapFormActions.SET_SWAP_TO_AMOUNT,
      swapToAmount: '12.34',
    };

    const { swapToAmount } = swapFormReducer(initialSwapFormState, {
      payload: setSwapToAmountPayload,
    });
    expect(swapToAmount).toEqual('12.34');
  });

  it('should set swapFrom when reducer called with SET_SWAP_FROM action', () => {
    const setSwapFromPayload: SetSwapFromTokenPayload = {
      type: SwapFormActions.SET_SWAP_FROM_TOKEN,
      swapFromToken: { token: { name: 'ethereum' } } as GetBalanceResult,
    };

    const { swapFromToken } = swapFormReducer(initialSwapFormState, {
      payload: setSwapFromPayload,
    });
    expect(swapFromToken).toEqual({ token: { name: 'ethereum' } });
  });

  it('should set swapFromAmount when reducer called with SET_SWAP_FROM_AMOUNT action', () => {
    const setSwapFromAmountPayload: SetSwapFromAmountPayload = {
      type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
      swapFromAmount: '12.34',
    };

    const { swapFromAmount } = swapFormReducer(initialSwapFormState, {
      payload: setSwapFromAmountPayload,
    });
    expect(swapFromAmount).toEqual('12.34');
  });

  it('should set setBlockFetchQuote when reducer called with SET_SWAP_FROM_FIAT_VALUE action', () => {
    const setSwapFromFiatValuePayload: SetSwapFromFiatValuePayload = {
      type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
      swapFromFiatValue: '12.34',
    };

    const { swapFromFiatValue } = swapFormReducer(initialSwapFormState, {
      payload: setSwapFromFiatValuePayload,
    });
    expect(swapFromFiatValue).toEqual('12.34');
  });

  it('should set setBlockFetchQuote when reducer called with SET_BLOCK_FETCH_QUOTE action', () => {
    const setBlockFetchQuote: SetBlockFetchQuote = {
      type: SwapFormActions.SET_BLOCK_FETCH_QUOTE,
      blockFetchQuote: true,
    };

    const { blockFetchQuote } = swapFormReducer(initialSwapFormState, {
      payload: setBlockFetchQuote,
    });
    expect(blockFetchQuote).toBeTruthy();
  });

  it('should set swapFromTokenError when reducer called with SET_SWAP_FROM_TOKEN_ERROR action', () => {
    const setSwapFromTokenErrorPayload: SetSwapFromTokenErrorPayload = {
      type: SwapFormActions.SET_SWAP_FROM_TOKEN_ERROR,
      swapFromTokenError: 'No token selected',
    };

    const { swapFromTokenError } = swapFormReducer(initialSwapFormState, {
      payload: setSwapFromTokenErrorPayload,
    });
    expect(swapFromTokenError).toEqual('No token selected');
  });

  it('should set swapFromAmountError when reducer called with SET_SWAP_From_Amount_ERROR action', () => {
    const setSwapFromAmountErrorPayload: SetSwapFromAmountErrorPayload = {
      type: SwapFormActions.SET_SWAP_FROM_AMOUNT_ERROR,
      swapFromAmountError: 'Please input amount',
    };

    const { swapFromAmountError } = swapFormReducer(initialSwapFormState, {
      payload: setSwapFromAmountErrorPayload,
    });
    expect(swapFromAmountError).toEqual('Please input amount');
  });

  it('should set swapToTokenError when reducer called with SET_SWAP_TO_TOKEN_ERROR action', () => {
    const setSwapToTokenErrorPayload: SetSwapToTokenErrorPayload = {
      type: SwapFormActions.SET_SWAP_TO_TOKEN_ERROR,
      swapToTokenError: 'No token selected',
    };

    const { swapToTokenError } = swapFormReducer(initialSwapFormState, {
      payload: setSwapToTokenErrorPayload,
    });
    expect(swapToTokenError).toEqual('No token selected');
  });

  it('should set swapToAmountError when reducer called with SET_SWAP_To_Amount_ERROR action', () => {
    const setSwapToAmountErrorPayload: SetSwapToAmountErrorPayload = {
      type: SwapFormActions.SET_SWAP_TO_AMOUNT_ERROR,
      swapToAmountError: 'Please input amount',
    };

    const { swapToAmountError } = swapFormReducer(initialSwapFormState, {
      payload: setSwapToAmountErrorPayload,
    });
    expect(swapToAmountError).toEqual('Please input amount');
  });
});
