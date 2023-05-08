import { BiomeThemeProvider } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { ViewOne } from './views/ViewOne';
import { useEffect, useReducer } from 'react';
import {
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../../../context/ViewContext';
import { TransitionExampleWidgetViews } from '../../../../context/TransitionExampleViewContextTypes';
import { ViewTwo } from './views/ViewTwo';
import { ViewThree } from './views/ViewThree';

export interface OuterWidgetProps {
  params: OuterWidgetParams;
  theme: WidgetTheme;
}

export interface OuterWidgetParams {}

export function OuterWidget(props: OuterWidgetProps) {
  const { theme } = props;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
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
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
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
    </BiomeThemeProvider>
  );
}
