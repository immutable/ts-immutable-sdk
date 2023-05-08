/**
 * @jest-environment jsdom
 */

import { Economy } from './Economy';

import { CraftInput, Crafting } from './crafting/Crafting';

describe('Economy Class', () => {
  let economy: Economy;
  let crafting: Crafting;

  const eventHandlerFn = jest.fn();
  const serviceHandlerFn = {
    validateCraft: jest.fn(),
    submitCraft: jest.fn(),
  };

  const craftInput: CraftInput = { requiresWeb3: false, web3Assets: {} };

  beforeEach(() => {
    crafting = new Crafting(eventHandlerFn, serviceHandlerFn);
    economy = new Economy(crafting);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should capture crafting errors', async () => {
    const craftFn = jest.fn().mockImplementation(async () => {
      throw new Error('craft request has failed');
    });

    jest.spyOn(Crafting.prototype, 'craft').mockImplementation(craftFn);

    try {
      await economy.crafting.craft(craftInput);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('craft request has failed');
    }

    expect(craftFn).toHaveBeenCalled();
  });

  it('should return the craft status', async () => {
    const status = 'COMPLETED';
    const craftFn = jest.fn().mockReturnValue(status);
    jest.spyOn(Crafting.prototype, 'craft').mockImplementation(craftFn);

    const result = await economy.crafting.craft(craftInput);
    expect(result).toBe(status);
    expect(craftFn).toHaveBeenCalledWith(craftInput);
  });

  it('should emit an event when craft is called', async () => {
    economy.subscribe(eventHandlerFn);

    await economy.crafting.craft(craftInput);

    expect(eventHandlerFn).toHaveBeenCalledWith({
      action: 'CRAFT',
      status: 'STARTED',
    });
  });
});
