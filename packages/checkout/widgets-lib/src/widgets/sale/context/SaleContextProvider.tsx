import {
  FundingRoute,
  SaleItem,
  RoutingOutcomeType,
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
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import {
  FundWithSmartCheckoutSubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useSignOrder } from '../hooks/useSignOrder';
import {
  ExecuteOrderResponse,
  ExecutedTransaction,
  SaleErrorTypes,
  SignOrderError,
  SignResponse,
  SmartCheckoutErrorTypes,
} from '../types';

import { useSmartCheckout } from '../hooks/useSmartCheckout';
import { useCurrency } from '../hooks/useCurrency';

type SaleContextProps = {
  config: StrongCheckoutWidgetsConfig;
  env: string;
  environmentId: string;
  items: SaleItem[];
  amount: string;
  collectionName: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
  passport?: Passport;
};

type SaleContextValues = SaleContextProps & {
  sign: (
    paymentType: SalePaymentTypes,
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
  paymentMethod: SalePaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: SalePaymentTypes | undefined) => void;
  goBackToPaymentMethods: (
    paymentMethod?: SalePaymentTypes | undefined
  ) => void;
  goToErrorView: (type: SaleErrorTypes, data?: Record<string, unknown>) => void;
  goToSuccessView: (data?: Record<string, unknown>) => void;
  querySmartCheckout: (
    callback?: (r?: SmartCheckoutResult) => void
  ) => Promise<SmartCheckoutResult | undefined>;
  smartCheckoutResult: SmartCheckoutResult | undefined;
  fundingRoutes: FundingRoute[];
  disabledPaymentTypes: SalePaymentTypes[];
  invalidParameters: boolean;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = createContext<SaleContextValues>({
  items: [],
  amount: '',
  collectionName: '',
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
  querySmartCheckout: () => Promise.resolve(undefined),
  smartCheckoutResult: undefined,
  fundingRoutes: [],
  disabledPaymentTypes: [],
  invalidParameters: false,
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
      provider,
      checkout,
      passport,
      collectionName,
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

  const [paymentMethod, setPaymentMethod] = useState<
  SalePaymentTypes | undefined
  >(undefined);

  const [fundingRoutes, setFundingRoutes] = useState<FundingRoute[]>([]);
  const [disabledPaymentTypes, setDisabledPaymentTypes] = useState<
  SalePaymentTypes[]
  >([]);

  const [invalidParameters, setInvalidParameters] = useState<boolean>(false);

  const goBackToPaymentMethods = useCallback(
    (
      type?: SalePaymentTypes | undefined,
      showInsufficientCoinsBanner?: boolean,
    ) => {
      setPaymentMethod(type);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAYMENT_METHODS,
            data: {
              showInsufficientCoinsBanner,
            },
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
  } = useSignOrder({
    items,
    provider,
    recipientAddress,
    environmentId,
    env,
  });

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
              ...data,
            },
          },
        },
      });
    },
    [[paymentMethod, executeResponse]],
  );

  const { fetchCurrency } = useCurrency({
    env,
    environmentId,
  });

  const sign = useCallback(
    async (
      type: SalePaymentTypes,
      callback?: (r?: SignResponse) => void,
    ): Promise<SignResponse | undefined> => {
      const fetchedTokenAddresses = await fetchCurrency();

      if (!fetchedTokenAddresses || fetchedTokenAddresses.length === 0) {
        goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, {
          error: new Error('Failed to fetch currency data'),
        });
        return undefined;
      }

      const response = await signOrder(
        type,
        fetchedTokenAddresses[0].erc20_address,
      );
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

  const { smartCheckout, smartCheckoutResult, smartCheckoutError } = useSmartCheckout({
    provider,
    checkout,
    items,
    amount,
    env,
    environmentId,
  });

  useEffect(() => {
    if (!smartCheckoutError) return;
    if (
      (smartCheckoutError.data?.error as Error)?.message
      === SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED
    ) {
      setDisabledPaymentTypes([SalePaymentTypes.CRYPTO]);
      goBackToPaymentMethods(undefined, true);
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
    if (!smartCheckoutResult) {
      return;
    }
    if (smartCheckoutResult.sufficient) {
      sign(SalePaymentTypes.CRYPTO);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_COINS,
          },
        },
      });
    }
    if (!smartCheckoutResult.sufficient) {
      switch (smartCheckoutResult.router.routingOutcome.type) {
        case RoutingOutcomeType.ROUTES_FOUND:
          setFundingRoutes(
            smartCheckoutResult.router.routingOutcome.fundingRoutes,
          );
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
                subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT,
              },
            },
          });

          break;
        case RoutingOutcomeType.NO_ROUTES_FOUND:
        case RoutingOutcomeType.NO_ROUTE_OPTIONS:
        default:
          setFundingRoutes([]);
          setPaymentMethod(undefined);
          setDisabledPaymentTypes([SalePaymentTypes.CRYPTO]);
          goBackToPaymentMethods(undefined, true);
          break;
      }
    }
  }, [smartCheckoutResult]);

  useEffect(() => {
    const invalidItems = !items || items.length === 0;
    const invalidAmount = !amount || amount === '0';

    if (invalidItems || invalidAmount || !collectionName || !environmentId) {
      setInvalidParameters(true);
    }
  }, [items, amount, collectionName, environmentId]);

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
      sign,
      signResponse,
      signError,
      execute,
      executeResponse,
      environmentId,
      collectionName,
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
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
    }),
    [
      config,
      env,
      environmentId,
      items,
      amount,
      collectionName,
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
      sign,
      querySmartCheckout,
      smartCheckoutResult,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
