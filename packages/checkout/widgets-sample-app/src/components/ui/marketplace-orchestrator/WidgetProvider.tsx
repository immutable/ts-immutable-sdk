import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react"

export interface WidgetState {
  showConnect: boolean;
  showWallet: boolean;
  showSwap: boolean;
  showBridge: boolean;
  params: any;
}

export interface WidgetContextState {
  showWidgets: WidgetState,
  setShowWidgets: Dispatch<SetStateAction<WidgetState>>
}

export const hideAllWidgets: WidgetState = {
  showConnect: false,
  showWallet: false,
  showSwap: false,
  showBridge: false,
  params: {}
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
