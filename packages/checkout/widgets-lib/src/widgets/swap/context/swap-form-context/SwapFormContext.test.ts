import { SetSwapFromAmountPayload, SetSwapFromPayload, SetSwapToAmountPayload, SetSwapToPayload, SwapFormAction, SwapFormActions, initialSwapFormState, swapFormReducer } from "./SwapFormContext";


describe('swap form context', () => {
  it ('should set swapTo when reducer called with SET_SWAP_TO action', () => {
    const setSwapToPayload: SetSwapToPayload = {
      type: SwapFormActions.SET_SWAP_TO,
      swapTo: 'ethereum',
    };

    const { swapTo } = swapFormReducer(initialSwapFormState, { payload: setSwapToPayload });
    expect(swapTo).toEqual('ethereum');
  });

  it ('should set swapToAmount when reducer called with SET_SWAP_TO_AMOUNT action', () => {
    const setSwapToAmountPayload: SetSwapToAmountPayload = {
      type: SwapFormActions.SET_SWAP_TO_AMOUNT,
      swapToAmount: '12.34',
    };

    const { swapToAmount } = swapFormReducer(initialSwapFormState, { payload: setSwapToAmountPayload });
    expect(swapToAmount).toEqual('12.34');
  });

    it ('should set swapFrom when reducer called with SET_SWAP_FROM action', () => {
    const setSwapFromPayload: SetSwapFromPayload = {
      type: SwapFormActions.SET_SWAP_FROM,
      swapFrom: 'ethereum',
    };

    const { swapFrom } = swapFormReducer(initialSwapFormState, { payload: setSwapFromPayload });
    expect(swapFrom).toEqual('ethereum');
  });

  it ('should set swapFromAmount when reducer called with SET_SWAP_FROM_AMOUNT action', () => {
    const setSwapFromAmountPayload: SetSwapFromAmountPayload = {
      type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
      swapFromAmount: '12.34',
    };

    const { swapFromAmount } = swapFormReducer(initialSwapFormState, { payload: setSwapFromAmountPayload });
    expect(swapFromAmount).toEqual('12.34');
  });
});
