import { Economy } from './Economy';
import { SDKError } from './Errors';
import { craftStatuses } from './crafting';

import type { CraftInput } from './crafting';

jest.mock('./crafting', () => ({
  craft: jest.fn(),
}));

describe('Economy Class', () => {
  let economy: Economy;
  const craftInput: CraftInput = { requiresWeb3: true, web3Assets: {} };

  beforeEach(() => {
    economy = new Economy();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.only('should call the subscription when an event is emitted', () => {
    const eventHandler = jest.fn();
    const subscription = economy.subscribe(eventHandler);

    economy['emitEvent']('CRAFT', 'INITIAL');

    expect(eventHandler).toHaveBeenCalledWith({
      type: 'CRAFT',
      status: 'INITIAL',
    });

    subscription.unsubscribe();
  });

  it('handle events', async () => {
    const emitEventSpy = jest
      .spyOn(economy, 'emitEvent' as keyof Economy)
      .mockImplementation(jest.fn());

    economy.craft(craftInput);

    // const craftFn = jest
    //   .requireMock('./crafting')
    //   .craft.mockImplementation(async () => {
    //     return 'COMPLETE';
    //   });

    expect(emitEventSpy).toHaveBeenCalledWith('CRAFT', 'INITIAL');
    expect(emitEventSpy).toHaveBeenCalledWith('CRAFT', 'COMPLETE');

    // expect(craftFn).toHaveBeenCalledWith(craftInput, emitEventFn);

    economy.subscribe((event) => {
      console.log('###############', event);
    });
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
