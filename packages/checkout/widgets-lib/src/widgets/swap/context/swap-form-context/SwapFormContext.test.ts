import { SetSwapToPayload, SwapFormAction, SwapFormActions, initialSwapFormState, swapFormReducer } from "./SwapFormContext";


describe('swap form context', () => {
  it ('should set swapTo when reducer called with SET_SWAP_TO action', () => {
    const setSwapToPayload: SetSwapToPayload = {
      type: SwapFormActions.SET_SWAP_TO,
      swapTo: 'new_swap_to_value',
    };

    const { swapTo } = swapFormReducer(initialSwapFormState, { payload: setSwapToPayload });
    expect(swapTo).toEqual('new_swap_to_value');
  });
});
