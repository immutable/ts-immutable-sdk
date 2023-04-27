import { BiomeThemeProvider } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { ViewOne } from './views/ViewOne';
import { useEffect, useReducer } from 'react';
import {
  initialViewState,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../../../context/ViewContext';
import { ViewTwo } from './views/ViewTwo';
import { ViewThree } from './views/ViewThree';
import { InnerExampleWidgetViews } from '../../../../context/InnerExampleViewContextTypes';

export interface InnerWidgetProps {
  params: InnerWidgetParams;
  theme: WidgetTheme;
  deepLink?: InnerExampleWidgetViews;
  callBack?: () => void;
}

export interface InnerWidgetParams {}

export function InnerWidget(props: InnerWidgetProps) {
  const { theme, deepLink, callBack } = props;
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
          type: deepLink ?? InnerExampleWidgetViews.VIEW_ONE,
        },
      },
    });
  }, []);

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {viewState.view.type === InnerExampleWidgetViews.VIEW_ONE && (
          <ViewOne />
        )}
        {viewState.view.type === InnerExampleWidgetViews.VIEW_TWO && (
          <ViewTwo callBack={callBack} />
        )}
        {viewState.view.type === InnerExampleWidgetViews.VIEW_THREE && (
          <ViewThree />
        )}
      </ViewContext.Provider>
    </BiomeThemeProvider>
  );
}
