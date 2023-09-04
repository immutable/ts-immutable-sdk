/*
 * @jest-environment jsdom
 */

import { describe, expect } from '@jest/globals';
import {
  EventTargetActions,
  eventTargetReducer,
  initialEventTargetState,
  SetEventTargetPayload,
} from './EventTargetContext';

describe('connect-loader-context', () => {
  it('should update the eventTarget when reducer called with SET_EVENT_TARGET', () => {
    const eventTarget = new EventTarget();
    const updatePayload: SetEventTargetPayload = {
      type: EventTargetActions.SET_EVENT_TARGET,
      eventTarget,
    };

    expect(initialEventTargetState).toEqual({
      eventTarget: window,
    });

    const state = eventTargetReducer(initialEventTargetState, {
      payload: updatePayload,
    });
    expect(state).toEqual({
      eventTarget,
    });
  });
});
