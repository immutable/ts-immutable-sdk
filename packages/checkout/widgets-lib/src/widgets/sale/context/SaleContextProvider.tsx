/* eslint-disable no-console */
import {
  useContext,
  createContext,
  useMemo,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Passport } from '@imtbl/passport';

import { SaleSuccess } from '@imtbl/checkout-widgets';

import { SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { Item, PaymentTypes, SignResponse } from '../types';
import { useSignOrder } from '../hooks/useSignOrder';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useSmartCheckout } from '../hooks/useSmartCheckout';

type SaleContextProps = {
  config: StrongCheckoutWidgetsConfig;
  env: string;
  environmentId: string;
  items: Item[];
  amount: string;
  fromContractAddress: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
  passport?: Passport;
};

type SaleContextValues = SaleContextProps & {
  sign: (paymentType: PaymentTypes, callback?: () => void) => Promise<SignResponse | undefined>;
  execute: () => Promise<SaleSuccess>;
  recipientAddress: string;
  recipientEmail: string;
  signResponse: SignResponse | undefined;
  isPassportWallet: boolean;
  paymentMethod: PaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: PaymentTypes) => void;
  querySmartCheckout: undefined |
  ((callback?: (r?: SmartCheckoutResult) => void) => Promise<SmartCheckoutResult | undefined>);
  smartCheckoutResult: SmartCheckoutResult | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = createContext<SaleContextValues>({
  items: [],
  amount: '',
  fromContractAddress: '',
  provider: undefined,
  checkout: undefined,
  environmentId: '',
  env: '',
  recipientAddress: '',
  recipientEmail: '',
  sign: () => Promise.resolve(undefined),
  execute: () => Promise.resolve({} as SaleSuccess),
  signResponse: undefined,
  passport: undefined,
  isPassportWallet: false,
  paymentMethod: undefined,
  setPaymentMethod: () => {},
  config: {} as StrongCheckoutWidgetsConfig,
  querySmartCheckout: undefined,
  smartCheckoutResult: undefined,
});

SaleContext.displayName = 'SaleSaleContext';

export function SaleContextProvider(props: {
  children: ReactNode;
  value: SaleContextProps;
}) {
  const {
    children,
    value: {
      config,
      env,
      environmentId,
      items,
      amount,
      fromContractAddress,
      provider,
      checkout,
      passport,
    },
  } = props;

  const [{ recipientEmail, recipientAddress }, setUserInfo] = useState<{
    recipientEmail: string;
    recipientAddress: string;
  }>({
    recipientEmail: '',
    recipientAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentTypes | undefined>(undefined);

  // Get user info
  useEffect(() => {
    const getUserInfo = async () => {
      const signer = provider?.getSigner();
      const address = await signer?.getAddress() || '';
      let email;
      try {
        email = (await passport?.getUserInfo())?.email || '';
      } catch (err) {
        console.error('@@@ passport.getUserInfo error', err);
      }

      console.log('@@@@@@@ useEffect getUserInfo', email, signer, address);

      setUserInfo({ recipientEmail: email, recipientAddress: address });
    };

    getUserInfo();
  }, [provider]);

  // ! Smart Checkout ----------------------------
  const { smartCheckout, smartCheckoutResult } = useSmartCheckout({
    provider,
    checkout,
    items,
    amount,
    contractAddress: fromContractAddress,
    spenderAddress: recipientAddress,
  });

  const querySmartCheckout = useCallback(async (callback?: (r?: SmartCheckoutResult) => void) => {
    const result = await smartCheckout();
    callback?.(result);
    return result;
  }, [smartCheckout, recipientAddress]);
  // ! Smart Checkout ----------------------------/

  const { sign: signOrder, execute, signResponse } = useSignOrder({
    items,
    provider,
    fromContractAddress,
    recipientAddress,
    environmentId,
    env,
  });

  const sign = useCallback(async (type: PaymentTypes, callback?: (r?: SignResponse) => void) => {
    const response = await signOrder(type);
    callback?.(response);
    return response;
  }, [signOrder]);

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
      fromContractAddress,
      sign,
      execute,
      signResponse,
      environmentId,
      env,
      provider,
      checkout,
      recipientAddress,
      recipientEmail,
      paymentMethod,
      setPaymentMethod,
      isPassportWallet: !!(provider?.provider as any)?.isPassport,
      querySmartCheckout,
      smartCheckoutResult,
    }),
    [
      config,
      env,
      environmentId,
      items,
      amount,
      fromContractAddress,
      provider,
      checkout,
      recipientAddress,
      recipientEmail,
      signResponse,
      paymentMethod,
      signResponse,
      querySmartCheckout,
      smartCheckoutResult,
    ],
  );

  return (
    <SaleContext.Provider value={values}>{children}</SaleContext.Provider>
  );
}

export function useSaleContext() {
  return useContext(SaleContext);
}
