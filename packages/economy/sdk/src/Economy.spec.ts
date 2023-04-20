/**
 * @jest-environment jsdom
 */

import { SDKError } from './Errors';
import { Economy } from './Economy';

import type { CraftInput } from './crafting';

jest.mock('./crafting', () => ({
  craft: jest.fn(),
}));

describe('Economy Class', () => {
  let economy: Economy;
  const eventHandlerFn = jest.fn();
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

    expect(craftFn).toHaveBeenCalled();
  });

  it('should return the craft status', async () => {
    const craftFn = jest
      .requireMock('./crafting')
      .craft.mockImplementation(async () => 'COMPLETE');

    const status = await economy.craft(craftInput);
    expect(status).toContain(status);
    expect(craftFn).toHaveBeenCalled();
  });

  it('should emit an event when craft is called', async () => {
    economy.subscribe(eventHandlerFn);

    jest.spyOn(economy, 'emitEvent' as keyof Economy);
    jest.requireMock('./crafting').craft.mockImplementation(async () => {
      economy['emitEvent']('CRAFT', 'INITIAL');
      return 'INITIAL';
    });

    await economy.craft(craftInput);

    expect(eventHandlerFn).toHaveBeenCalledWith({
      type: 'CRAFT',
      status: 'INITIAL',
    });
  });
});
