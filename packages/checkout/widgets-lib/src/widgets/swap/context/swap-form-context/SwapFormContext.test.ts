import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import {
  SetSwapFromAmountPayload,
  SetSwapFromTokenPayload,
  SetSwapToAmountPayload,
  SetSwapToTokenPayload,
  SwapFormActions,
  initialSwapFormState,
  swapFormReducer,
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
});
