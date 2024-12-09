import {
  AssessmentResult,
  fetchRiskAssessment,
  FundingRoute,
  SaleItem, SalePaymentTypes,
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
  ExecuteTransactionStep,
  SignedTransaction,
} from '../types';
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
  excludeFiatCurrencies?: string[];
  preferredCurrency?: string;
  customOrderData?: Record<string, unknown>;
  waitFulfillmentSettlements: boolean;
  hideExcludedPaymentTypes: boolean;
};

type SaleContextValues = SaleContextProps & {
  sign: (
    paymentType: SignPaymentTypes,
    tokenAddress?: string,
    callback?: (response: SignResponse | undefined) => void
  ) => Promise<SignResponse | undefined>;
  executeAll: (
    signResponse: SignResponse | undefined,
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: SignOrderError, txns: ExecutedTransaction[]) => void,
    onTxnStep?: (method: string, step: ExecuteTransactionStep) => void
  ) => Promise<ExecutedTransaction[]>;
  executeNextTransaction: (
    onTxnSuccess: (txn: ExecutedTransaction) => void,
    onTxnError: (error: any, txns: ExecutedTransaction[]) => void,
    onTxnStep?: (method: string, step: ExecuteTransactionStep) => void
  ) => Promise<boolean>;
  recipientAddress: string;
  recipientEmail: string;
  signResponse: SignResponse | undefined;
  signError: SignOrderError | undefined;
  filteredTransactions: SignedTransaction[];
  currentTransactionIndex: number;
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
  fundingRoutes: FundingRoute[];
  disabledPaymentTypes: SalePaymentTypes[];
  invalidParameters: boolean;
  fromTokenAddress: string;
  orderQuote: OrderQuote;
  signTokenIds: string[];
  selectedCurrency: OrderQuoteCurrency | undefined;
  riskAssessment: AssessmentResult | undefined;
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
  executeAll: () => Promise.resolve([]),
  executeNextTransaction: () => Promise.resolve(false),
  signResponse: undefined,
  signError: undefined,
  filteredTransactions: [],
  currentTransactionIndex: 0,
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
  fundingRoutes: [],
  disabledPaymentTypes: [],
  invalidParameters: false,
  fromTokenAddress: '',
  orderQuote: defaultOrderQuote,
  signTokenIds: [],
  excludePaymentTypes: [],
  preferredCurrency: undefined,
  customOrderData: undefined,
  selectedCurrency: undefined,
  waitFulfillmentSettlements: true,
  hideExcludedPaymentTypes: false,
  riskAssessment: undefined,
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
      excludeFiatCurrencies,
      preferredCurrency,
      customOrderData,
      waitFulfillmentSettlements,
      hideExcludedPaymentTypes,
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
      setPaymentMethodState(undefined);
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

  const [invalidParameters, setInvalidParameters] = useState<boolean>(false);

  const [riskAssessment, setRiskAssessment] = useState<AssessmentResult | undefined>();

  const { selectedCurrency, orderQuote, orderQuoteError } = useQuoteOrder({
    items,
    provider,
    environmentId,
    environment: config.environment,
    preferredCurrency,
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
      const signer = await provider?.getSigner();
      const address = (await signer?.getAddress()) || '';
      const email = (await passport?.getUserInfo())?.email || '';

      setUserInfo({ recipientEmail: email, recipientAddress: address });
    };

    getUserInfo();
  }, [provider]);

  useEffect(() => {
    if (!checkout || riskAssessment) {
      return;
    }

    (async () => {
      const address = await (await provider?.getSigner())?.getAddress();

      if (!address) {
        return;
      }

      const assessment = await fetchRiskAssessment([address], checkout.config);
      setRiskAssessment(assessment);
    })();
  }, [checkout, provider]);

  const {
    sign: signOrder,
    executeAll,
    executeNextTransaction,
    signResponse,
    signError,
    filteredTransactions,
    currentTransactionIndex,
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
    customOrderData,
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
      filteredTransactions,
      currentTransactionIndex,
      executeAll,
      executeNextTransaction,
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
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      orderQuote,
      signTokenIds: tokenIds,
      excludePaymentTypes,
      excludeFiatCurrencies,
      selectedCurrency,
      waitFulfillmentSettlements,
      hideExcludedPaymentTypes,
      riskAssessment,
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
      filteredTransactions,
      currentTransactionIndex,
      executeResponse,
      showCreditCardWarning,
      setShowCreditCardWarning,
      paymentMethod,
      goBackToPaymentMethods,
      goToErrorView,
      goToSuccessView,
      sign,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      orderQuote,
      tokenIds,
      excludePaymentTypes,
      excludeFiatCurrencies,
      selectedCurrency,
      waitFulfillmentSettlements,
      hideExcludedPaymentTypes,
      riskAssessment,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
