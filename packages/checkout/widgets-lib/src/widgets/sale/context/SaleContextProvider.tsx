/* eslint-disable no-console */
import { SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useSignOrder } from '../hooks/useSignOrder';
import {
  ExecuteOrderResponse,
  ExecutedTransaction,
  Item,
  PaymentTypes,
  SaleErrorTypes,
  SignOrderError,
  SignResponse,
} from '../types';

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
  sign: (
    paymentType: PaymentTypes,
    callback?: () => void
  ) => Promise<SignResponse | undefined>;
  execute: (
    signResponse: SignResponse | undefined
  ) => Promise<ExecutedTransaction[]>;
  recipientAddress: string;
  recipientEmail: string;
  signResponse: SignResponse | undefined;
  signError: SignOrderError | undefined;
  executeResponse: ExecuteOrderResponse | undefined;
  isPassportWallet: boolean;
  paymentMethod: PaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: PaymentTypes) => void;
  goBackToPaymentMethods: (paymentMethod?: PaymentTypes | undefined) => void;
  goToErrorView: (type: SaleErrorTypes, data?: Record<string, unknown>) => void;
  goToSuccessView: () => void;
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
  execute: () => Promise.resolve([]),
  signResponse: undefined,
  signError: undefined,
  executeResponse: undefined,
  passport: undefined,
  isPassportWallet: false,
  paymentMethod: undefined,
  setPaymentMethod: () => {},
  goBackToPaymentMethods: () => {},
  goToErrorView: () => {},
  goToSuccessView: () => {},
  config: {} as StrongCheckoutWidgetsConfig,
  querySmartCheckout: undefined,
  smartCheckoutResult: undefined,
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

  const [paymentMethod, setPaymentMethod] = useState<PaymentTypes | undefined>(
    undefined,
  );

  const goBackToPaymentMethods = useCallback(
    (type?: PaymentTypes | undefined) => {
      setPaymentMethod(type);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SaleWidgetViews.PAYMENT_METHODS },
        },
      });
    },
    [],
  );

  const goToErrorView = useCallback(
    (errorType: SaleErrorTypes, data: Record<string, unknown> = {}) => {
      errorRetries.current += 1;
      if (errorRetries.current > MAX_ERROR_RETRIES) {
        errorRetries.current = 0;
        setPaymentMethod(undefined);
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.SALE_FAIL,
            data: { errorType, ...data },
          },
        },
      });
    },
    [],
  );

  const goToSuccessView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.SALE_SUCCESS,
        },
      },
    });
  }, []);

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
  }, [smartCheckout]);
  // ! Smart Checkout ----------------------------/

  const {
    sign: signOrder,
    execute,
    signResponse,
    signError,
    executeResponse,
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
    console.log('@@@@@@@ SaleContextProvider', signError);
    goToErrorView(signError.type, signError.data);
  }, [signError]);

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
      fromContractAddress,
      sign,
      signResponse,
      signError,
      execute,
      executeResponse,
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
      goToSuccessView,
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
      signError,
      executeResponse,
      paymentMethod,
      goBackToPaymentMethods,
      goToErrorView,
      goToSuccessView,
      signResponse,
      querySmartCheckout,
      smartCheckoutResult,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
