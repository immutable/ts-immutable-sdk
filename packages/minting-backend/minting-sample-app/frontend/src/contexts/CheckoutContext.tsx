/* eslint-disable @typescript-eslint/no-explicit-any */
import { checkout } from "@imtbl/sdk";
import {
  Widget,
  WidgetTheme,
  WidgetType
} from "@imtbl/sdk/checkout";
import { ReactNode, createContext, useEffect, useState } from "react";
import WidgetModal from "../components/WidgetModal/WidgetModal";
import { useDisclosure } from "@chakra-ui/react";

export interface Widgets {
  connect?: Widget<WidgetType.CONNECT>;
  wallet?: Widget<WidgetType.WALLET>;
  swap?: Widget<WidgetType.SWAP>;
  bridge?: Widget<WidgetType.BRIDGE>;
  onramp?: Widget<WidgetType.ONRAMP>;
}

export interface CheckoutContextState {
  checkout?: checkout.Checkout;
  widgets: Widgets;
  widgetsFactory?: ImmutableCheckoutWidgets.WidgetsFactory;
  openWidget: (widgetType:WidgetType) => void;
}

export const CheckoutContext = createContext<CheckoutContextState>({
  widgets: {
    connect: undefined,
    wallet: undefined,
    swap: undefined,
    bridge: undefined,
    onramp: undefined,
  },
  openWidget: () => {},
});

export interface CheckoutProvider {
  children: ReactNode;
  checkout: checkout.Checkout;
}
export function CheckoutProvider({ children, checkout }: CheckoutProvider) {
  const [widgetsFactory, setWidgetsFactory] = useState<ImmutableCheckoutWidgets.WidgetsFactory>();
  const [widgets, setWidgets] = useState<Widgets>({});
  const {isOpen: isWidgetModalOpen, onOpen, onClose} = useDisclosure();
  const [widgetToOpen, setWidgetToOpen] = useState(WidgetType.CONNECT);
  // const [provider, setProvider] = useState<Provider>();

  useEffect(() => {
    // Initialise widgets and create all widgets at beginning of application
    checkout.widgets({ config: { theme: WidgetTheme.DARK } })
      .then((widgetsFactory: ImmutableCheckoutWidgets.WidgetsFactory) => {
        const connect = widgetsFactory.create(WidgetType.CONNECT, {});
        const wallet = widgetsFactory.create(WidgetType.WALLET, {});
        const swap = widgetsFactory.create(WidgetType.SWAP, {});
        const bridge = widgetsFactory.create(WidgetType.BRIDGE, {});
        const onramp = widgetsFactory.create(WidgetType.ONRAMP, {});

        setWidgets({
          connect,
          wallet,
          swap,
          bridge,
          onramp
        })
        setWidgetsFactory(widgetsFactory)
      })
  }, [checkout]);

  const openWidget = (widgetType:WidgetType) => {
    if(!Object.values(WidgetType).includes(widgetType)) return;
    setWidgetToOpen(widgetType);
    onOpen();
  }

  return (
    <CheckoutContext.Provider value= {{
      checkout,
      widgets,
      widgetsFactory,
      openWidget,
      // provider,
      // setProvider
    }}>
      <>
      {children}
      <WidgetModal widgetType={widgetToOpen} isOpen={isWidgetModalOpen} onOpen={onOpen} onClose={onClose} />
      </>
  </CheckoutContext.Provider>
  )
}