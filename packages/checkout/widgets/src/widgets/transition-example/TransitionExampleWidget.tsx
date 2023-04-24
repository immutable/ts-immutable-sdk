import { BiomeThemeProvider } from "@biom3/react";
import { BaseTokens, onDarkBase, onLightBase } from "@biom3/design-tokens";
import { WidgetTheme } from "@imtbl/checkout-ui-types";
import { ConnectionProviders } from "@imtbl/checkout-sdk-web";
import { Web3Provider } from "@ethersproject/providers";
import { ViewOne } from "./views/ViewOne";
import { useEffect, useReducer } from "react";
import { initialViewState, ViewActions, ViewContext, viewReducer } from "../../context/ViewContext";
import { TransitionExampleWidgetViews } from "../../context/TransitionExampleViewContextTypes";
import { ViewTwo } from "./views/ViewTwo";
import { ViewThree } from "./views/ViewThree";

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
          type: TransitionExampleWidgetViews.VIEW_ONE
        }
      }
    })
  }, [])

  return(
    <BiomeThemeProvider theme={{base: biomeTheme}}>
      <ViewContext.Provider value={{ viewState, viewDispatch }}>
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_ONE && <ViewOne/>}
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_TWO && <ViewTwo/>}
        {viewState.view.type === TransitionExampleWidgetViews.VIEW_THREE && <ViewThree/>}
      </ViewContext.Provider>
    </BiomeThemeProvider>
  )
}
