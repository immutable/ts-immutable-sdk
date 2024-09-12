"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Checkout,
  WalletProviderName,
  Widget,
  WidgetType,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";
import { usePassport } from "./passport";

type WidgetsContextType = {
  factory?: WidgetsFactory;
  addFunds?: Widget<WidgetType.ADD_FUNDS>;
  onRamp?: Widget<WidgetType.ONRAMP>;
  swap?: Widget<WidgetType.SWAP>;
  bridge?: Widget<WidgetType.BRIDGE>;
};

const WidgetsContext = createContext<WidgetsContextType>({} as any);

export function WidgetsProvider({ children }: { children: ReactNode }) {
  const { passportInstance } = usePassport();

  const [addFunds, setAddFundsWidget] =
    useState<Widget<WidgetType.ADD_FUNDS>>();
  const [onRamp, setOnRampWidget] = useState<Widget<WidgetType.ONRAMP>>();
  const [swap, setSwapWidget] = useState<Widget<WidgetType.SWAP>>();
  const [bridge, setBridgeWidget] = useState<Widget<WidgetType.BRIDGE>>();

  useEffect(() => {
    if (!passportInstance) return;
    const initializeWallet = async () => {
      const checkoutSDK = new Checkout({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        passport: passportInstance,
      });
      const factory = new WidgetsFactory(checkoutSDK, {});
      const walletProviderName = WalletProviderName.PASSPORT;
      const { provider } = await checkoutSDK.createProvider({
        walletProviderName,
      });

      const addFunds = factory.create(WidgetType.ADD_FUNDS, {
        provider,
      });

      setAddFundsWidget(addFunds);

      const onRamp = factory.create(WidgetType.ONRAMP, {
        provider,
      });

      setOnRampWidget(onRamp);

      const swap = factory.create(WidgetType.SWAP, {
        provider,
      });

      setSwapWidget(swap);

      const bridge = factory.create(WidgetType.BRIDGE, {
        provider,
      });
      setBridgeWidget(bridge);
    };
    initializeWallet();
  }, [passportInstance]);

  const providerValue = useMemo(
    () => ({
      addFunds,
      onRamp,
      swap,
      bridge,
    }),
    [addFunds, onRamp, swap, bridge]
  );

  return (
    <WidgetsContext.Provider value={providerValue}>
      {children}
    </WidgetsContext.Provider>
  );
}

export const useWidgets = () => useContext(WidgetsContext);
