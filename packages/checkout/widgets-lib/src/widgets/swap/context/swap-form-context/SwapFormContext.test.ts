import {
  SwapFormActions,
  initialSwapFormState,
  swapFormReducer,
  SetSwapFromFiatValuePayload,
} from './SwapFormContext';

describe('swap form context', () => {
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
});
