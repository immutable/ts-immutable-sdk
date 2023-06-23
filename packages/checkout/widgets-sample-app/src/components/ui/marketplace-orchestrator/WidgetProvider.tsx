import { Dispatch, SetStateAction, createContext, useState } from "react"
export interface ShowWidget {
  show: boolean;
  data: any;
}
export interface WidgetState {
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

export interface WidgetContextState {
  showWidgets: WidgetState,
  setShowWidgets: Dispatch<SetStateAction<WidgetState>>
}

export const hideAllWidgets: WidgetState = {
  showConnect: {show: false, data: {}},
  showWallet: {show: false, data: {}},
  showSwap: {show: false, data: {}},
  showBridge: {show: false, data: {}},
}

export const initialWidgetContextState: WidgetContextState = {
  showWidgets: hideAllWidgets,
  setShowWidgets: () => {},
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WidgetContext = createContext<WidgetContextState>(initialWidgetContextState);

export interface WidgetProvider {
  children: React.ReactNode;
}

export const WidgetProvider = ({children}: WidgetProvider) => {
  const [showWidgets, setShowWidgets] = useState(hideAllWidgets);

  return(
    <WidgetContext.Provider value={{showWidgets, setShowWidgets}}>
      {children}
    </WidgetContext.Provider>
  )
}