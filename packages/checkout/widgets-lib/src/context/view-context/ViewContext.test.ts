import { describe, expect } from '@jest/globals';
import { ConnectWidgetViews } from './ConnectViewContextTypes';
import {
  ViewActions,
  viewReducer,
  initialViewState,
  UpdateViewPayload,
  SharedViews,
} from './ViewContext';
import { BridgeWidgetViews } from './BridgeViewContextTypes';

describe('view-context', () => {
  describe('UPDATE_VIEW', () => {
    it('should update view and history with correct view when reducer called with UPDATE_VIEW action', () => {
      const updateViewPayload: UpdateViewPayload = {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
      };

      expect(initialViewState).toEqual({
        view: {
          type: SharedViews.LOADING_VIEW,
        },
        history: [],
      });

      const state = viewReducer(initialViewState, { payload: updateViewPayload });
      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
        history: [{ type: ConnectWidgetViews.CONNECT_WALLET }],
      });
    });

    it('should not add view to history if view is the current view when reducer called with UPDATE_VIEW action', () => {
      const state = viewReducer(
        {
          view: {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
          history: [{ type: ConnectWidgetViews.CONNECT_WALLET }],
        },
        {
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: ConnectWidgetViews.CONNECT_WALLET,
            },
          },
        },
      );

      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
        history: [
          {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
        ],
      });
    });

    it('should add view to history if view is not the current view when reducer called with UPDATE_VIEW action', () => {
      const state = viewReducer(
        {
          view: {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
          history: [{ type: ConnectWidgetViews.CONNECT_WALLET }],
        },
        {
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: ConnectWidgetViews.SUCCESS,
            },
          },
        },
      );

      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.SUCCESS,
        },
        history: [
          { type: ConnectWidgetViews.CONNECT_WALLET },
          { type: ConnectWidgetViews.SUCCESS },
        ],
      });
    });
    it('should add currentViewData to the existing view before pushing a new view', () => {
      const state = viewReducer(
        {
          view: {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
          history: [{ type: ConnectWidgetViews.CONNECT_WALLET }],
        },
        {
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: ConnectWidgetViews.SUCCESS,
            },
            currentViewData: {
              tokenAddress: '0xsomeTestAddress',
            },
          },
        },
      );

      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.SUCCESS,
        },
        history: [
          { type: ConnectWidgetViews.CONNECT_WALLET, data: { tokenAddress: '0xsomeTestAddress' } },
          { type: ConnectWidgetViews.SUCCESS },
        ],
      });
    });
  });

  describe('GO_BACK', () => {
    it('should update view to previous history when reducer called with GO_BACK action', () => {
      const state = viewReducer(
        {
          view: {
            type: ConnectWidgetViews.SWITCH_NETWORK,
          },
          history: [
            { type: ConnectWidgetViews.SWITCH_NETWORK },
            { type: ConnectWidgetViews.CONNECT_WALLET },
            { type: ConnectWidgetViews.SUCCESS },
          ],
        },
        {
          payload: {
            type: ViewActions.GO_BACK,
          },
        },
      );

      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
        history: [
          { type: ConnectWidgetViews.SWITCH_NETWORK },
          { type: ConnectWidgetViews.CONNECT_WALLET },
        ],
      });
    });

    it('should not change state if reducer called with GO_BACK action and only one item in history', () => {
      const state = viewReducer(
        {
          view: {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
          history: [{ type: ConnectWidgetViews.CONNECT_WALLET }],
        },
        { payload: { type: ViewActions.GO_BACK } },
      );

      expect(state).toEqual({
        view: {
          type: ConnectWidgetViews.CONNECT_WALLET,
        },
        history: [
          {
            type: ConnectWidgetViews.CONNECT_WALLET,
          },
        ],
      });
    });
  });

  describe('GO_BACK_TO', () => {
    it('should go back to the first entry in the history with the specified view type', () => {
      const state = viewReducer(
        {
          view: {
            type: BridgeWidgetViews.BRIDGE_FAILURE,
            reason: 'Transaction failed',
          },
          history: [
            { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
            { type: BridgeWidgetViews.BRIDGE_FORM },
            { type: BridgeWidgetViews.BRIDGE_REVIEW },
            {
              type: BridgeWidgetViews.IN_PROGRESS,
              transactionHash: '',
              isTransfer: false,
            },
            {
              type: BridgeWidgetViews.BRIDGE_FAILURE,
              reason: 'Transaction failed',
            },
          ],
        },
        { payload: { type: ViewActions.GO_BACK_TO, view: { type: BridgeWidgetViews.BRIDGE_REVIEW } } },
      );

      expect(state).toEqual({
        view: {
          type: BridgeWidgetViews.BRIDGE_REVIEW,
        },
        history: [
          { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
          { type: BridgeWidgetViews.BRIDGE_FORM },
          { type: BridgeWidgetViews.BRIDGE_REVIEW },
        ],
      });
    });

    it('should go back to the first entry in history if the view appears multiple times', () => {
      const state = viewReducer(
        {
          view: {
            type: BridgeWidgetViews.BRIDGE_FAILURE,
            reason: 'Transaction failed',
          },
          history: [
            { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
            { type: BridgeWidgetViews.BRIDGE_REVIEW },
            { type: BridgeWidgetViews.BRIDGE_FORM },
            { type: BridgeWidgetViews.BRIDGE_REVIEW },
            {
              type: BridgeWidgetViews.IN_PROGRESS,
              transactionHash: '',
              isTransfer: false,
            },
            {
              type: BridgeWidgetViews.BRIDGE_FAILURE,
              reason: 'Transaction failed',
            },
          ],
        },
        { payload: { type: ViewActions.GO_BACK_TO, view: { type: BridgeWidgetViews.BRIDGE_REVIEW } } },
      );

      expect(state).toEqual({
        view: {
          type: BridgeWidgetViews.BRIDGE_REVIEW,
        },
        history: [
          { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
          { type: BridgeWidgetViews.BRIDGE_REVIEW },
          { type: BridgeWidgetViews.BRIDGE_FORM },
          { type: BridgeWidgetViews.BRIDGE_REVIEW },
        ],
      });
    });

    it('should NOT go back to the entry in the history if it is not found', () => {
      const state = viewReducer(
        {
          view: {
            type: BridgeWidgetViews.BRIDGE_FAILURE,
            reason: 'Transaction failed',
          },
          history: [
            { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
            { type: BridgeWidgetViews.BRIDGE_FORM },
            { type: BridgeWidgetViews.BRIDGE_REVIEW },
            {
              type: BridgeWidgetViews.IN_PROGRESS,
              transactionHash: '',
              isTransfer: false,
            },
            {
              type: BridgeWidgetViews.BRIDGE_FAILURE,
              reason: 'Transaction failed',
            },
          ],
        },
        { payload: { type: ViewActions.GO_BACK_TO, view: { type: SharedViews.LOADING_VIEW } } },
      );

      expect(state).toEqual({
        view: {
          type: BridgeWidgetViews.BRIDGE_FAILURE,
          reason: 'Transaction failed',
        },
        history: [
          { type: BridgeWidgetViews.WALLET_NETWORK_SELECTION },
          { type: BridgeWidgetViews.BRIDGE_FORM },
          { type: BridgeWidgetViews.BRIDGE_REVIEW },
          {
            type: BridgeWidgetViews.IN_PROGRESS,
            transactionHash: '',
            isTransfer: false,
          },
          {
            type: BridgeWidgetViews.BRIDGE_FAILURE,
            reason: 'Transaction failed',
          },
        ],
      });
    });
  });
});
