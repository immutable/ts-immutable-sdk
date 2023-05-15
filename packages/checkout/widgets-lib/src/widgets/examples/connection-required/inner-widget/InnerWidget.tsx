import { BiomeThemeProvider } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { useEffect, useReducer } from 'react';
import { ViewOne } from './views/ViewOne';
import { ViewTwo } from './views/ViewTwo';
import { ViewThree } from './views/ViewThree';
import { InnerExampleWidgetViews } from '../../../../context/view-context/InnerExampleViewContextTypes';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
} from '../../../../context/view-context/ViewContext';

export interface InnerWidgetProps {
  // eslint-disable-next-line
  params: InnerWidgetParams;
  theme: WidgetTheme;
  deepLink?: InnerExampleWidgetViews;
  callBack?: () => void;
}

export interface InnerWidgetParams {}

export function InnerWidget(props: InnerWidgetProps) {
  const { theme, deepLink, callBack } = props;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
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
  }, [deepLink]);

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      {/* TODO: The object passed as the value prop to the Context provider changes every render.
          To fix this consider wrapping it in a useMemo hook. */}
      { /* eslint-disable-next-line */ }
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
