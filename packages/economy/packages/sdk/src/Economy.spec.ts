import { CraftInput, craftStatuses } from './crafting';
import { Economy } from './Economy';
import { SDKError } from './Errors';

jest.mock('./crafting', () => ({
  craft: jest.fn(),
}));

describe('Economy Class', () => {
  let economy: Economy;
  const craftInput: CraftInput = { requiresWeb3: false, web3Assets: {} };

  beforeEach(() => {
    economy = new Economy();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should capture crafting errors', async () => {
    const craftFn = jest
      .requireMock('./crafting')
      .craft.mockImplementation(async () => {
        throw new Error('craft request has failed');
      });

    try {
      await economy.craft(craftInput);
    } catch (error) {
      expect(error).toBeInstanceOf(SDKError);
      expect((error as Error).message).toContain('craft request has failed');
    }

    expect(craftFn).toHaveBeenCalledWith(craftInput);
  });

  it('should return the craft status', async () => {
    const craftFn = jest
      .requireMock('./crafting')
      .craft.mockImplementation(
        async () =>
          craftStatuses[Math.floor(Math.random() * craftStatuses.length)]
      );

    const status = await economy.craft(craftInput);
    expect(status).toContain(status);
    expect(craftFn).toHaveBeenCalledWith(craftInput);
  });
});
