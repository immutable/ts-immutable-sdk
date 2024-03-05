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
import { Environment } from '@imtbl/config';
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
  ClientConfig,
  ExecuteOrderResponse,
  ExecutedTransaction,
  SaleErrorTypes,
  SignOrderError,
  SignResponse,
  SmartCheckoutErrorTypes,
} from '../types';

import { useSmartCheckout } from '../hooks/useSmartCheckout';
import { defaultClientConfig } from '../hooks/useClientConfig';

type SaleContextProps = {
  config: StrongCheckoutWidgetsConfig;
  environment: Environment;
  environmentId: string;
  items: SaleItem[];
  amount: string;
  collectionName: string;
  fromTokenAddress: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
  passport?: Passport;
  clientConfig: ClientConfig;
};

type SaleContextValues = SaleContextProps & {
  sign: (
    paymentType: SalePaymentTypes,
    callback?: (response: SignResponse | undefined) => void
  ) => Promise<SignResponse | undefined>;
  execute: (
    signResponse: SignResponse | undefined,
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
  ) => Promise<ExecutedTransaction[]>;
  recipientAddress: string;
  recipientEmail: string;
  signResponse: SignResponse | undefined;
  signError: SignOrderError | undefined;
  executeResponse: ExecuteOrderResponse | undefined;
  isPassportWallet: boolean;
  paymentMethod: SalePaymentTypes | undefined;
  setPaymentMethod: (paymentMethod: SalePaymentTypes | undefined) => void;
  goBackToPaymentMethods: (paymentMethod?: SalePaymentTypes | undefined) => void;
  goToErrorView: (type: SaleErrorTypes, data?: Record<string, unknown>) => void;
  goToSuccessView: (data?: Record<string, unknown>) => void;
  querySmartCheckout: (
    callback?: (r?: SmartCheckoutResult) => void
  ) => Promise<SmartCheckoutResult | undefined>;
  smartCheckoutResult: SmartCheckoutResult | undefined;
  fundingRoutes: FundingRoute[];
  disabledPaymentTypes: SalePaymentTypes[]
  invalidParameters: boolean;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = createContext<SaleContextValues>({
  items: [],
  amount: '',
  fromTokenAddress: '',
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
  clientConfig: defaultClientConfig,
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
      amount,
      fromTokenAddress,
      provider,
      checkout,
      passport,
      collectionName,
      clientConfig,
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

  const [paymentMethod, setPaymentMethod] = useState<SalePaymentTypes | undefined>(
    undefined,
  );

  const [fundingRoutes, setFundingRoutes] = useState<FundingRoute[]>([]);
  const [disabledPaymentTypes, setDisabledPaymentTypes] = useState<SalePaymentTypes[]>([]);

  const [invalidParameters, setInvalidParameters] = useState<boolean>(false);

  const goBackToPaymentMethods = useCallback(
    (type?: SalePaymentTypes | undefined, showInsufficientCoinsBanner?: boolean) => {
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
    tokenIds,
  } = useSignOrder({
    items,
    provider,
    fromTokenAddress,
    recipientAddress,
    environmentId,
    environment,
  });

  const sign = useCallback(
    async (
      type: SalePaymentTypes,
      callback?: (r?: SignResponse) => void,
    ): Promise<SignResponse | undefined> => {
      const response = await signOrder(type, fromTokenAddress);
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

  const { smartCheckout, smartCheckoutResult, smartCheckoutError } = useSmartCheckout({
    provider,
    checkout,
    items,
    amount,
    tokenAddress: fromTokenAddress,
  });

  useEffect(() => {
    if (!smartCheckoutError) return;
    if ((smartCheckoutError.data?.error as Error)?.message === SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED) {
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
    const invalidFromTokenAddress = !fromTokenAddress || !fromTokenAddress.startsWith('0x');

    if (invalidItems || invalidAmount || invalidFromTokenAddress || !collectionName || !environmentId) {
      setInvalidParameters(true);
    } else {
      setInvalidParameters(false);
    }
  }, [items, amount, fromTokenAddress, collectionName, environmentId]);

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
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
      clientConfig,
    }),
    [
      config,
      environment,
      environmentId,
      items,
      amount,
      fromTokenAddress,
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
      clientConfig,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
