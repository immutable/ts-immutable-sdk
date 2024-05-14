import {
  FundingRoute,
  SaleItem,
  SmartCheckoutResult,
  SalePaymentTypes,
} from '@imtbl/checkout-sdk';
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
import { Environment } from '@imtbl/config';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useSignOrder } from '../hooks/useSignOrder';
import {
  OrderQuote,
  OrderQuoteCurrency,
  ExecuteOrderResponse,
  ExecutedTransaction,
  SaleErrorTypes,
  SignOrderError,
  SignPaymentTypes,
  SignResponse,
  SmartCheckoutError,
  SmartCheckoutErrorTypes,
} from '../types';
import { getTopUpViewData } from '../functions/smartCheckoutUtils';

import { useSmartCheckout } from '../hooks/useSmartCheckout';
import { useQuoteOrder, defaultOrderQuote } from '../hooks/useQuoteOrder';

type SaleContextProps = {
  config: StrongCheckoutWidgetsConfig;
  environment: Environment;
  environmentId: string;
  items: SaleItem[];
  collectionName: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
  passport?: Passport;
  excludePaymentTypes: SalePaymentTypes[];
  multicurrency: boolean;
  waitFulfillmentSettlements: boolean;
};

type SaleContextValues = SaleContextProps & {
  sign: (
    paymentType: SignPaymentTypes,
    tokenAddress?: string,
    callback?: (response: SignResponse | undefined) => void
  ) => Promise<SignResponse | undefined>;
  execute: (
    signResponse: SignResponse | undefined,
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void
  ) => Promise<ExecutedTransaction[]>;
  recipientAddress: string;
  recipientEmail: string;
  signResponse: SignResponse | undefined;
  signError: SignOrderError | undefined;
  executeResponse: ExecuteOrderResponse | undefined;
  isPassportWallet: boolean;
  showCreditCardWarning: boolean;
  setShowCreditCardWarning: (show: boolean) => void;
  paymentMethod: SalePaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: SalePaymentTypes | undefined) => void;
  goBackToPaymentMethods: (
    paymentMethod?: SalePaymentTypes | undefined,
    data?: Record<string, unknown>
  ) => void;
  goToErrorView: (type: SaleErrorTypes, data?: Record<string, unknown>) => void;
  goToSuccessView: (data?: Record<string, unknown>) => void;
  querySmartCheckout: (
    callback?: (r?: SmartCheckoutResult) => void
  ) => Promise<SmartCheckoutResult | undefined>;
  smartCheckoutResult: SmartCheckoutResult | undefined;
  smartCheckoutError: SmartCheckoutError | undefined;
  fundingRoutes: FundingRoute[];
  disabledPaymentTypes: SalePaymentTypes[];
  invalidParameters: boolean;
  fromTokenAddress: string;
  orderQuote: OrderQuote;
  signTokenIds: string[];
  selectedCurrency: OrderQuoteCurrency | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = createContext<SaleContextValues>({
  items: [],
  collectionName: '',
  provider: undefined,
  checkout: undefined,
  environmentId: '',
  environment: Environment.SANDBOX,
  recipientAddress: '',
  recipientEmail: '',
  sign: () => Promise.resolve(undefined),
  execute: () => Promise.resolve([]),
  signResponse: undefined,
  signError: undefined,
  executeResponse: undefined,
  passport: undefined,
  isPassportWallet: false,
  showCreditCardWarning: false,
  setShowCreditCardWarning: () => {},
  paymentMethod: undefined,
  setPaymentMethod: () => {},
  goBackToPaymentMethods: () => {},
  goToErrorView: () => {},
  goToSuccessView: () => {},
  config: {} as StrongCheckoutWidgetsConfig,
  querySmartCheckout: () => Promise.resolve(undefined),
  smartCheckoutResult: undefined,
  smartCheckoutError: undefined,
  fundingRoutes: [],
  disabledPaymentTypes: [],
  invalidParameters: false,
  fromTokenAddress: '',
  orderQuote: defaultOrderQuote,
  signTokenIds: [],
  excludePaymentTypes: [],
  multicurrency: false,
  selectedCurrency: undefined,
  waitFulfillmentSettlements: true,
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
      environment,
      environmentId,
      items,
      provider,
      checkout,
      passport,
      collectionName,
      excludePaymentTypes,
      multicurrency,
      waitFulfillmentSettlements,
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

  const [showCreditCardWarning, setShowCreditCardWarning] = useState(false);
  const [paymentMethod, setPaymentMethodState] = useState<
  SalePaymentTypes | undefined
  >(undefined);

  const setPaymentMethod = (type: SalePaymentTypes | undefined) => {
    if (type === SalePaymentTypes.CREDIT && !showCreditCardWarning) {
      setShowCreditCardWarning(true);
      return;
    }

    setPaymentMethodState(type);
    setShowCreditCardWarning(false);
  };

  const [fundingRoutes] = useState<FundingRoute[]>([]);
  const [disabledPaymentTypes, setDisabledPaymentTypes] = useState<
  SalePaymentTypes[]
  >([]);

  const disablePaymentTypes = (types: SalePaymentTypes[]) => {
    setDisabledPaymentTypes((prev) => Array.from(new Set([...(prev || []), ...types])));
  };

  const [invalidParameters, setInvalidParameters] = useState<boolean>(false);

  const { selectedCurrency, orderQuote, orderQuoteError } = useQuoteOrder({
    items,
    provider,
    environmentId,
    environment: config.environment,
  });

  const fromTokenAddress = selectedCurrency?.address || '';

  const goBackToPaymentMethods = useCallback(
    (type?: SalePaymentTypes | undefined, data?: Record<string, unknown>) => {
      setPaymentMethod(type);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAYMENT_METHODS,
            data,
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
    sign: signOrder,
    execute,
    signResponse,
    signError,
    executeResponse,
    tokenIds,
  } = useSignOrder({
    items,
    provider,
    fromTokenAddress,
    recipientAddress,
    environmentId,
    environment,
    waitFulfillmentSettlements,
  });

  const sign = useCallback(
    async (
      type: SignPaymentTypes,
      tokenAddress?: string,
      callback?: (r?: SignResponse) => void,
    ): Promise<SignResponse | undefined> => {
      const selectedTokenAddress = tokenAddress || fromTokenAddress;
      const invalidFromTokenAddress = !selectedTokenAddress || !selectedTokenAddress.startsWith('0x');
      if (invalidFromTokenAddress) {
        setInvalidParameters(true);
        return undefined;
      }

      const response = await signOrder(type, selectedTokenAddress);
      if (!response) return undefined;

      callback?.(response);
      return response;
    },
    [signOrder, fromTokenAddress],
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
            data: {
              ...data,
              errorType,
              paymentMethod,
              transactions: executeResponse.transactions,
            },
          },
        },
      });
    },

    [paymentMethod, setPaymentMethod, executeResponse],
  );

  const goToSuccessView = useCallback(
    (data?: Record<string, unknown>) => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.SALE_SUCCESS,
            data: {
              paymentMethod,
              transactions: executeResponse.transactions,
              tokenIds,
              ...data,
            },
          },
        },
      });
    },
    [[paymentMethod, executeResponse, tokenIds]],
  );

  useEffect(() => {
    if (!signError) return;
    goToErrorView(signError.type, signError.data);
  }, [signError]);

  useEffect(() => {
    if (!orderQuoteError) return;
    goToErrorView(orderQuoteError.type, orderQuoteError.data);
  }, [orderQuoteError]);

  const { smartCheckout, smartCheckoutResult, smartCheckoutError } = useSmartCheckout({
    provider,
    checkout,
    items,
    tokenAddress: fromTokenAddress,
  });

  useEffect(() => {
    if (!smartCheckoutError) return;
    if (
      (smartCheckoutError.data?.error as Error)?.message
      === SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED
    ) {
      disablePaymentTypes([SalePaymentTypes.CRYPTO]);
      setPaymentMethod(undefined);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.TOP_UP_VIEW,
            data: getTopUpViewData(
              smartCheckoutError,
              fromTokenAddress,
              selectedCurrency?.name!,
            ),
          },
        },
      });

      return;
    }
    goToErrorView(smartCheckoutError.type, smartCheckoutError.data);
  }, [smartCheckoutError]);

  const querySmartCheckout = useCallback(
    async (callback?: (r?: SmartCheckoutResult) => void) => {
      const result = await smartCheckout();
      callback?.(result);
      return result;
    },
    [smartCheckout],
  );

  useEffect(() => {
    const invalidItems = !items || items.length === 0;

    if (invalidItems || !collectionName || !environmentId) {
      setInvalidParameters(true);
    }
  }, [items, collectionName, environmentId]);

  useEffect(() => {
    if (excludePaymentTypes?.length <= 0) return;
    setDisabledPaymentTypes(excludePaymentTypes);
  }, [excludePaymentTypes]);

  const values = useMemo(
    () => ({
      config,
      items,
      fromTokenAddress,
      sign,
      signResponse,
      signError,
      execute,
      executeResponse,
      environmentId,
      collectionName,
      environment,
      provider,
      checkout,
      recipientAddress,
      recipientEmail,
      showCreditCardWarning,
      setShowCreditCardWarning,
      paymentMethod,
      setPaymentMethod,
      goBackToPaymentMethods,
      goToErrorView,
      goToSuccessView,
      isPassportWallet: !!(provider?.provider as any)?.isPassport,
      querySmartCheckout,
      smartCheckoutResult,
      smartCheckoutError,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      orderQuote,
      signTokenIds: tokenIds,
      excludePaymentTypes,
      multicurrency,
      selectedCurrency,
      waitFulfillmentSettlements,
    }),
    [
      config,
      environment,
      environmentId,
      items,
      fromTokenAddress,
      collectionName,
      provider,
      checkout,
      recipientAddress,
      recipientEmail,
      signResponse,
      signError,
      executeResponse,
      showCreditCardWarning,
      setShowCreditCardWarning,
      paymentMethod,
      goBackToPaymentMethods,
      goToErrorView,
      goToSuccessView,
      sign,
      querySmartCheckout,
      smartCheckoutResult,
      smartCheckoutError,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      orderQuote,
      tokenIds,
      excludePaymentTypes,
      multicurrency,
      selectedCurrency,
      waitFulfillmentSettlements,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
