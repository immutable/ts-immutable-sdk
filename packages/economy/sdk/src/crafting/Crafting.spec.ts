import { SDKError } from 'Errors';
import { CraftInput, Crafting } from './Crafting';

describe('Crafting', () => {
  let input: CraftInput;
  let emitEvent: jest.Mock;

  beforeEach(() => {
    emitEvent = jest.fn();
    input = {
      requiresWeb3: false,
      web3Assets: {},
      input: { userId: 'asd', recipeId: '123', ingredients: [] },
    };
  });

  describe('craft', () => {
    it('wraps an error in an SDKError if the @withSDKError decorator is used', async () => {
      const errorMessage = 'Something went wrong';
      const craftingWithError = new Crafting(emitEvent, {
        validateCraft: jest.fn(),
        submitCraft: jest.fn().mockImplementation(() => {
          throw new Error(errorMessage);
        }),
      });

      try {
        await expect(craftingWithError.craft(input)).rejects.toThrow(
          new SDKError('CRAFTING_ERROR', errorMessage)
        );
      } catch {}
    });
  });
});
