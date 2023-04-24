import { BiomeThemeProvider } from "@biom3/react";
import { BaseTokens, onDarkBase, onLightBase } from "@biom3/design-tokens";
import { WidgetTheme } from "@imtbl/checkout-ui-types";
import { ConnectionProviders } from "@imtbl/checkout-sdk-web";
import { Web3Provider } from "@ethersproject/providers";
import { PageOne } from "./views/PageOne";
import { useEffect, useReducer } from "react";
import { initialViewState, ViewActions, ViewContext, viewReducer } from "../../context/ViewContext";
import { TransitionExampleWidgetViews } from "../../context/TransitionExampleViewContextTypes";
import { PageTwo } from "./views/PageTwo";
import { PageThree } from "./views/PageThree";

export interface TransitionExampleWidgetProps {
  params: TransitionExampleWidgetParams;
  theme: WidgetTheme;
}

export interface TransitionExampleWidgetParams {
  providerPreference?: ConnectionProviders;
  fromContractAddress?: string,
  fromNetwork?: string,
  amount?: string,
  provider?: Web3Provider
}

export function TransitionExampleWidget(props:TransitionExampleWidgetProps) {
  const { theme } = props;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const biomeTheme:BaseTokens = (theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()) ? onLightBase : onDarkBase;

  useEffect(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: TransitionExampleWidgetViews.PAGE_ONE
        }
      }
    })
  }, [])

  return(
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {viewState.view.type === TransitionExampleWidgetViews.PAGE_ONE && <PageOne/>}
        {viewState.view.type === TransitionExampleWidgetViews.PAGE_TWO && <PageTwo/>}
        {viewState.view.type === TransitionExampleWidgetViews.PAGE_THREE && <PageThree/>}
      </ViewContext.Provider>
    </BiomeThemeProvider>
  )
}
