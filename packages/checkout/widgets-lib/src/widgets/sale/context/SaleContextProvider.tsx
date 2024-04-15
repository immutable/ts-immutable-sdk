import {
  FundingRoute,
  SaleItem,
  RoutingOutcomeType,
  SmartCheckoutResult,
  SalePaymentTypes,
  SmartCheckoutInsufficient,
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
  SharedViews,
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
  SignPaymentTypes,
  SignResponse,
  SmartCheckoutError,
  SmartCheckoutErrorTypes,
} from '../types';
import { getTopUpViewData } from '../functions/smartCheckoutUtils';

import { useSmartCheckout } from '../hooks/useSmartCheckout';
import { useClientConfig, defaultClientConfig } from '../hooks/useClientConfig';
import { BigNumber } from 'ethers';

type SaleContextProps = {
  config: StrongCheckoutWidgetsConfig;
  environment: Environment;
  environmentId: string;
  items: SaleItem[];
  amount: string;
  collectionName: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
  passport?: Passport;
  excludePaymentTypes: SalePaymentTypes[];
};

type SaleContextValues = SaleContextProps & {
  sign: (
    paymentType: SignPaymentTypes,
    callback?: (response: SignResponse | undefined) => void
  ) => Promise<SignResponse | undefined>;
  execute: (
    signResponse: SignResponse | undefined,
    waitForTrnsactionSettlement: boolean,
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
  clientConfig: ClientConfig;
  signTokenIds: string[];
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = createContext<SaleContextValues>({
  items: [],
  amount: '',
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
  smartCheckoutError: undefined,
  fundingRoutes: [],
  disabledPaymentTypes: [],
  invalidParameters: false,
  fromTokenAddress: '',
  clientConfig: defaultClientConfig,
  signTokenIds: [],
  excludePaymentTypes: [],
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
      provider,
      checkout,
      passport,
      collectionName,
      excludePaymentTypes,
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

  const disablePaymentTypes = (types: SalePaymentTypes[]) => {
    setDisabledPaymentTypes((prev) => Array.from(new Set([...(prev || []), ...types])));
  };

  const [invalidParameters, setInvalidParameters] = useState<boolean>(false);

  const { selectedCurrency, clientConfig, clientConfigError } = useClientConfig(
    {
      environmentId,
      environment: config.environment,
      checkout,
      provider,
    },
  );

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
  });

  const sign = useCallback(
    async (
      type: SignPaymentTypes,
      callback?: (r?: SignResponse) => void,
    ): Promise<SignResponse | undefined> => {
      const invalidFromTokenAddress = !fromTokenAddress || !fromTokenAddress.startsWith('0x');
      if (invalidFromTokenAddress) {
        setInvalidParameters(true);
        return undefined;
      }

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

  useEffect(() => {
    if (!clientConfigError) return;
    goToErrorView(clientConfigError.type, clientConfigError.data);
  }, [clientConfigError]);

  const { smartCheckout, smartCheckoutResult, smartCheckoutError } = useSmartCheckout({
    provider,
    checkout,
    items,
    amount,
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
    if (!smartCheckoutResult) {
      return;
    }

    const result = {
      sufficient: false,
      transactionRequirements: [
        {
          sufficient: false,
          type: 'NATIVE',
          delta: {
            balance: {
              type: 'BigNumber',
              hex: '0x9fdf434e83ac83',
            },
            formattedBalance: '0.045000001470049411',
          },
          current: {
            balance: {
              type: 'BigNumber',
              hex: '0x00',
            },
            formattedBalance: '0.0',
            token: {
              address: 'native',
              decimals: 18,
              name: 'tIMX',
              symbol: 'tIMX',
            },
            type: 'NATIVE',
          },
          required: {
            balance: {
              type: 'BigNumber',
              hex: '0x9fdf434e83ac83',
            },
            formattedBalance: '0.045000001470049411',
            token: {
              address: 'native',
              decimals: 18,
              name: 'tIMX',
              symbol: 'tIMX',
            },
            type: 'NATIVE',
          },
        },
        {
          sufficient: true,
          type: 'ERC20',
          delta: {
            balance: {
              type: 'BigNumber',
              hex: '-0x05e69ec0',
            },
            formattedBalance: '-99.0',
          },
          current: {
            balance: {
              type: 'BigNumber',
              hex: '0x05f5e100',
            },
            formattedBalance: '100.0',
            token: {
              address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
            },
          },
          required: {
            balance: {
              type: 'BigNumber',
              hex: '0x0f4240',
            },
            formattedBalance: '1.0',
            token: {
              address: '0x3b2d8a1931736fc321c24864bceee981b11c3c57',
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
            },
          },
        },
      ],
      router: {
        availableRoutingOptions: {
          onRamp: true,
          swap: true,
          bridge: true,
        },
        routingOutcome: {
          type: 'ROUTES_FOUND',
          fundingRoutes: [
            {
              priority: 1,
              steps: [
                {
                  type: 'ONRAMP',
                  chainId: 13473,
                  fundingItem: {
                    type: 'NATIVE',
                    fundsRequired: {
                      amount: {
                        type: 'BigNumber',
                        hex: '0x9fdf434e83ac83',
                      },
                      formattedAmount: '0.045000001470049411',
                    },
                    userBalance: {
                      balance: BigNumber.from('10'),
                      formattedBalance: '0.0',
                    },
                    token: {
                      address: 'native',
                      decimals: 18,
                      name: 'tIMX',
                      symbol: 'tIMX',
                    },
                  },
                },
              ],
            },
            {
              priority: 1,
              steps: [
                {
                  type: 'ONRAMP',
                  chainId: 13473,
                  fundingItem: {
                    type: 'NATIVE',
                    fundsRequired: {
                      amount: {
                        type: 'BigNumber',
                        hex: '0x9fdf434e83ac83',
                      },
                      formattedAmount: '0.045000001470049411',
                    },
                    userBalance: {
                      balance: BigNumber.from('10'),
                      formattedBalance: '0.0',
                    },
                    token: {
                      address: 'native',
                      decimals: 18,
                      name: 'tIMX',
                      symbol: 'tIMX',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    } as SmartCheckoutInsufficient;

    if (RoutingOutcomeType.ROUTES_FOUND !== result.router.routingOutcome.type) return;

    setFundingRoutes(result.router.routingOutcome.fundingRoutes);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
          subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT,
        },
      },
    });
  }, [smartCheckoutResult, smartCheckoutError, sign, amount, fromTokenAddress]);

  useEffect(() => {
    const invalidItems = !items || items.length === 0;
    const invalidAmount = !amount || amount === '0';

    if (invalidItems || invalidAmount || !collectionName || !environmentId) {
      setInvalidParameters(true);
    }
  }, [items, amount, collectionName, environmentId]);

  useEffect(() => {
    if (excludePaymentTypes?.length <= 0) return;
    setDisabledPaymentTypes(excludePaymentTypes);
  }, [excludePaymentTypes]);

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
      smartCheckoutError,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      clientConfig,
      signTokenIds: tokenIds,
      excludePaymentTypes,
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
      smartCheckoutError,
      fundingRoutes,
      disabledPaymentTypes,
      invalidParameters,
      clientConfig,
      tokenIds,
      excludePaymentTypes,
    ],
  );

  return <SaleContext.Provider value={values}>{children}</SaleContext.Provider>;
}

export function useSaleContext() {
  return useContext(SaleContext);
}
