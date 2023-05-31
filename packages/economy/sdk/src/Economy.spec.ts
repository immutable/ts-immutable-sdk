/** @jest-environment jsdom */

import 'reflect-metadata';
import Container from 'typedi';
import { Subscription } from 'rxjs';
import { Environment } from '@imtbl/config';

import { EventClient } from './EventClient';
import { Economy } from './Economy';

describe('Economy Class', () => {
  beforeEach(() => {
    Container.reset();
  });

  it('should build a class instance', () => {
    const economy = Economy.build();
    expect(economy).toBeInstanceOf(Economy);
  });

  it('should build a class instance with config', () => {
    const economy = Economy.build({
      gameId: 'gameId',
      userId: 'userId',
      walletAddress: '0x',
      baseConfig: {
        environment: Environment.SANDBOX,
      },
    });

    expect(economy.config.get()).toEqual({
      gameId: 'gameId',
      userId: 'userId',
      walletAddress: '0x',
      imxProvider: undefined,
      environment: 'sandbox',
      baseConfig: { environment: 'sandbox' },
    });
  });

  it('should have a public method for Crafting', () => {
    const economy = Economy.build();
    expect(economy.crafting).toBeDefined();
  });

  it('should h ave a public method for Inventory', () => {
    const economy = Economy.build();
    expect(economy.inventory).toBeDefined();
  });

  it('should have a public method for Recipe', () => {
    const economy = Economy.build();
    expect(economy.recipe).toBeDefined();
  });

  it('should have a public method for Config', () => {
    const economy = Economy.build();
    expect(economy.config).toBeDefined();
  });

  it('should have a public method for ItemDefinition', () => {
    const economy = Economy.build();
    expect(economy.item).toBeDefined();
  });

  it('should have a private method for Events', () => {
    const economy = Economy.build();
    expect(economy['events']).toBeDefined();
  });

  it('should subscribe to vents', () => {
    const economy = Economy.build();

    const eventClient = Container.get(EventClient);
    const spyOnEventClientSubscribe = jest.spyOn(eventClient, 'subscribe');
    const spyOnEventClienDisconnect = jest.spyOn(eventClient, 'disconnect');

    // expect subscribe to be defined
    expect(economy.subscribe).toBeDefined();

    // expect event client subscribe to be called with subscriber
    const spyOnSubscriberFn = jest.fn();
    const subscriber = economy.subscribe(spyOnSubscriberFn);
    expect(spyOnEventClientSubscribe).toHaveBeenCalledWith(spyOnSubscriberFn);

    // expect subscriber to be called
    eventClient.emitEvent({});
    expect(spyOnSubscriberFn).toHaveBeenCalled();

    // expect to return a subscriber instance
    expect(subscriber).toBeInstanceOf(Subscription);

    // expect event client disconnect to be called & subscription to be closed
    economy.disconnect();
    expect(spyOnEventClienDisconnect).toHaveBeenCalled();
    expect(subscriber.closed).toBe(true);
  });
});
