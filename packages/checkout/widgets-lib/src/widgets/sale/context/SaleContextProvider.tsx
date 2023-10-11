import {
  useContext,
  createContext,
  useMemo,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Passport } from '@imtbl/passport';

import { SaleSuccess } from '@imtbl/checkout-widgets';

import {
  Item, PaymentTypes, SignResponse, MintErrorTypes, SignOrderError,
} from '../types';
import { useSignOrder } from '../hooks/useSignOrder';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

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
  signError: SignOrderError | undefined;
  isPassportWallet: boolean;
  paymentMethod: PaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: PaymentTypes) => void;
  goBackToPaymentMethods: (paymentMethod?: PaymentTypes | undefined) => void;
  goToErrorView: (type: MintErrorTypes, data?: Record<string, unknown>) => void;
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
  signError: undefined,
  passport: undefined,
  isPassportWallet: false,
  paymentMethod: undefined,
  setPaymentMethod: () => {},
  goBackToPaymentMethods: () => {},
  goToErrorView: () => {},
  config: {} as StrongCheckoutWidgetsConfig,
});

SaleContext.displayName = 'SaleSaleContext';

/** Max attemps to retry with same payment method */
const MAX_ERROR_RETRIES = 1;

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

  const errorRetries = useRef(0);
  const { viewDispatch } = useContext(ViewContext);
  const [{ recipientEmail, recipientAddress }, setUserInfo] = useState<{
    recipientEmail: string;
    recipientAddress: string;
  }>({
    recipientEmail: '',
    recipientAddress: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentTypes | undefined>(undefined);

  const goBackToPaymentMethods = useCallback((type?: PaymentTypes | undefined) => {
    setPaymentMethod(type);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SaleWidgetViews.PAYMENT_METHODS },
      },
    });
  }, []);

  const goToErrorView = useCallback(
    (errorType: MintErrorTypes, data: Record<string, unknown> = {}) => {
      errorRetries.current += 1;
      if (errorRetries.current > MAX_ERROR_RETRIES) {
        errorRetries.current = 0;
        setPaymentMethod(undefined);
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.MINT_FAIL,
            data: { errorType, ...data },
          },
        },
      });
    },
    [],
  );

  useEffect(() => {
    const getUserInfo = async () => {
      const signer = provider?.getSigner();
      const address = (await signer?.getAddress()) || '';
      const email = (await passport?.getUserInfo())?.email || '';

      setUserInfo({ recipientEmail: email, recipientAddress: address });
    };

    getUserInfo();
  }, [provider]);

  const {
    sign: signOrder, execute, signResponse, signError,
  } = useSignOrder({
    items,
    provider,
    fromContractAddress,
    recipientAddress,
    environmentId,
    env,
  });

  const sign = useCallback(
    async (
      type: PaymentTypes,
      callback?: (r?: SignResponse) => void,
    ): Promise<SignResponse | undefined> => {
      const response = await signOrder(type);
      if (!response) return undefined;

      callback?.(response);
      return response;
    },
    [signOrder],
  );

  useEffect(() => {
    if (!signError) return;
    goToErrorView(signError.type, signError.data);
  }, [signError]);

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
      fromContractAddress,
      sign,
      execute,
      signResponse,
      signError,
      environmentId,
      env,
      provider,
      checkout,
      recipientAddress,
      recipientEmail,
      paymentMethod,
      setPaymentMethod,
      goBackToPaymentMethods,
      goToErrorView,
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
      signError,
      goBackToPaymentMethods,
      goToErrorView,
    ],
  );

  return (
    <SaleContext.Provider value={values}>{children}</SaleContext.Provider>
  );
}

export function useSaleContext() {
  return useContext(SaleContext);
}
