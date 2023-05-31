import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { useEffect, useReducer } from 'react';
import { ViewOne } from './views/ViewOne';
import { ViewTwo } from './views/ViewTwo';
import { ViewThree } from './views/ViewThree';
import { TransitionExampleWidgetViews } from '../../../../context/view-context/TransitionExampleViewContextTypes';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
} from '../../../../context/view-context/ViewContext';
import { WidgetTheme } from '../../../../lib';

export interface OuterWidgetProps {
  // eslint-disable-next-line
  params: OuterWidgetParams;
  theme: WidgetTheme;
}

export interface OuterWidgetParams {}

export function OuterWidget(props: OuterWidgetProps) {
  const { theme } = props;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  useEffect(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: TransitionExampleWidgetViews.VIEW_ONE,
        },
      },
    });
  }, []);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      {/* TODO: The object passed as the value prop to the Context provider changes every render.
        To fix this consider wrapping it in a useMemo hook. */}
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_ONE && (
          <ViewOne />
        )}
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_TWO && (
          <ViewTwo />
        )}
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_THREE && (
          <ViewThree />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
