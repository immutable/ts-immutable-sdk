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

import { Item, PaymentTypes, SignResponse } from '../types';
import { useSignOrder } from '../hooks/useSignOrder';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

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
      const email = (await passport?.getUserInfo())?.email || '';

      setUserInfo({ recipientEmail: email, recipientAddress: address });
    };

    getUserInfo();
  }, [provider]);

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
    ],
  );

  return (
    <SaleContext.Provider value={values}>{children}</SaleContext.Provider>
  );
}

export function useSaleContext() {
  return useContext(SaleContext);
}
