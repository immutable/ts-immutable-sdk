import {
  Body,
  ButtCon,
  Button,
  FramedIcon,
  HeroFormControl,
  HeroTextInput,
  MenuItem,
  Stack,
} from '@biom3/react';
import debounce from 'lodash.debounce';
import {
  ChainId,
  type Checkout,
  EIP6963ProviderInfo,
  IMTBLWidgetEvents,
  isAddressSanctioned,
  TokenFilterTypes,
  type TokenInfo,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  type ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { getL2ChainId } from '../../../lib';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { OptionsDrawer } from '../components/OptionsDrawer';
import {
  AddTokensActions,
  AddTokensContext,
} from '../context/AddTokensContext';
import type { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useRoutes } from '../hooks/useRoutes';
import { SQUID_NATIVE_TOKEN } from '../utils/config';
import { AddTokensWidgetViews } from '../../../context/view-context/AddTokensViewContextTypes';
import { AddTokensErrorTypes, type RouteData } from '../types';
import { SelectedRouteOption } from '../components/SelectedRouteOption';
import { SelectedWallet } from '../components/SelectedWallet';
import { DeliverToWalletDrawer } from '../../../components/WalletDrawer/DeliverToWalletDrawer';
import { PayWithWalletDrawer } from '../../../components/WalletDrawer/PayWithWalletDrawer';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { sendConnectProviderSuccessEvent } from '../AddTokensWidgetEvents';
import { convertToUsd } from '../functions/convertToUsd';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { validateToAmount } from '../functions/amountValidation';
import { OnboardingDrawer } from '../components/OnboardingDrawer';
import { useError } from '../hooks/useError';
import { SquidFooter } from '../components/SquidFooter';
import { getFormattedNumberWithDecimalPlaces } from '../functions/getFormattedNumber';
import { TokenDrawerMenu } from '../components/TokenDrawerMenu';
import { PULSE_SHADOW } from '../utils/animation';
import { useRiskAssessment } from '../hooks/useRiskAssessment';

interface AddTokensProps {
  checkout: Checkout;
  showBackButton?: boolean;
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  toTokenAddress?: string;
  toAmount?: string;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
  config: StrongCheckoutWidgetsConfig;
}

export function AddTokens({
  checkout,
  toAmount,
  config,
  toTokenAddress,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: AddTokensProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { fetchRoutesWithRateLimit, resetRoutes } = useRoutes();
  const { showErrorHandover } = useError(config.environment);

  const {
    addTokensState: {
      squid,
      chains,
      balances,
      tokens,
      selectedAmount,
      routes,
      selectedRouteData,
      selectedToken,
      isSwapAvailable,
    },
    addTokensDispatch,
  } = useContext(AddTokensContext);

  const { viewDispatch } = useContext(ViewContext);
  const { track, page } = useAnalytics();
  const { t } = useTranslation();

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [payWithCardClicked, setPayWithCardClicked] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showPayWithDrawer, setShowPayWithDrawer] = useState(false);
  const [showDeliverToDrawer, setShowDeliverToDrawer] = useState(false);
  const [onRampAllowedTokens, setOnRampAllowedTokens] = useState<TokenInfo[]>(
    [],
  );
  const [inputValue, setInputValue] = useState<string>(
    selectedAmount || toAmount || '',
  );
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const { riskAssessment } = useRiskAssessment();

  const selectedAmountUsd = useMemo(
    () => convertToUsd(tokens, inputValue, selectedToken),
    [tokens, inputValue, selectedToken],
  );

  const setSelectedAmount = useMemo(
    () => debounce((value: string) => {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'InputScreen',
        control: 'AmountInput',
        controlType: 'TextInput',
        extras: {
          toAmount: value,
        },
      });

      addTokensDispatch({
        payload: {
          type: AddTokensActions.SET_SELECTED_AMOUNT,
          selectedAmount: value,
        },
      });
    }, 2500),
    [],
  );

  const setSelectedRouteData = (route: RouteData | undefined) => {
    if (route) {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'InputScreen',
        control: 'RoutesMenu',
        controlType: 'MenuItem',
        extras: {
          toTokenAddress: route.amountData.toToken.address,
          toTokenChainId: route.amountData.toToken.chainId,
          fromTokenAddress: route.amountData.fromToken.address,
          fromTokenChainId: route.amountData.fromToken.chainId,
          toAmount: route.amountData.toAmount,
          fromAmount: route.amountData.fromAmount,
        },
      });
    }

    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_SELECTED_ROUTE_DATA,
        selectedRouteData: route,
      },
    });
  };

  const handleOnAmountInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, amount, isValid } = validateToAmount(event.target.value);

    if (!isValid && amount < 0) {
      return;
    }

    setInputValue(value);
    setSelectedAmount(value);
  };

  const {
    providersState: {
      fromProviderInfo,
      toProviderInfo,
      toProvider,
      fromAddress,
      toAddress,
      lockedToProvider,
    },
  } = useProvidersContext();

  const { providers } = useInjectedProviders({ checkout });
  const walletOptions = useMemo(
    () => providers
    // TODO: Check if must filter passport on L1
      .map((detail) => {
        if (detail.info.rdns === WalletProviderRdns.PASSPORT) {
          return {
            ...detail,
            info: {
              ...detail.info,
              name: getProviderSlugFromRdns(detail.info.rdns).replace(
                /^\w/,
                (c) => c.toUpperCase(),
              ),
            },
          };
        }
        return detail;
      }),
    [providers],
  );

  useEffect(() => {
    page({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      extras: {
        toAmount,
        toTokenAddress,
      },
    });
  }, []);

  useEffect(() => {
    if (!toAmount) return;
    setSelectedAmount(toAmount);
  }, [toAmount]);

  useEffect(() => {
    resetRoutes();
    setInsufficientBalance(false);
    setSelectedRouteData(undefined);
  }, [fromAddress]);

  useEffect(() => {
    resetRoutes();
    setInsufficientBalance(false);
    setSelectedRouteData(undefined);

    (async () => {
      const isValidAmount = validateToAmount(selectedAmount).isValid;
      if (
        balances
        && squid
        && tokens
        && selectedToken?.address
        && isValidAmount
      ) {
        setFetchingRoutes(true);
        const availableRoutes = await fetchRoutesWithRateLimit(
          squid,
          tokens,
          balances,
          ChainId.IMTBL_ZKEVM_MAINNET.toString(),
          selectedToken.address === 'native'
            ? SQUID_NATIVE_TOKEN
            : selectedToken.address,
          selectedAmount,
          5,
          1000,
          isSwapAvailable,
        );
        setFetchingRoutes(false);

        if (availableRoutes.length === 0) {
          setInsufficientBalance(true);
        }
      }
    })();
  }, [balances, squid, selectedToken, selectedAmount]);

  useEffect(() => {
    if (!selectedRouteData && routes.length > 0) {
      setSelectedRouteData(routes[0]);
    }
  }, [routes]);

  useEffect(() => {
    if (!checkout) return;

    const fetchOnRampTokens = async () => {
      try {
        const tokenResponse = await checkout.getTokenAllowList({
          type: TokenFilterTypes.ONRAMP,
          chainId: getL2ChainId(checkout.config),
        });

        if (tokenResponse?.tokens.length > 0) {
          setOnRampAllowedTokens(tokenResponse.tokens);
        }
      } catch (error) {
        showErrorHandover(AddTokensErrorTypes.SERVICE_BREAKDOWN, { error });
      }
    };
    fetchOnRampTokens();
  }, [checkout]);

  const sendRequestOnRampEvent = () => {
    if (!riskAssessment || isAddressSanctioned(riskAssessment)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
            error: new Error('Sanctioned address'),
          },
        },
      });

      return;
    }

    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      control: 'PayWithCardMenu',
      controlType: 'MenuItem',
      extras: {
        tokenAddress: selectedToken?.address ?? '',
        amount: selectedAmount ?? '',
      },
    });
    const data = {
      tokenAddress: selectedToken?.address ?? '',
      amount: selectedAmount ?? '',
      showBackButton: true,
      provider: toProvider,
    };
    orchestrationEvents.sendRequestOnrampEvent(
      eventTarget,
      IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT,
      data,
    );
  };

  const handleCardClick = () => {
    setPayWithCardClicked(true);
    if (!toProvider) {
      setShowDeliverToDrawer(true);
      return;
    }
    sendRequestOnRampEvent();
  };

  useEffect(() => {
    if (toProvider && riskAssessment && payWithCardClicked) {
      sendRequestOnRampEvent();
    }
  }, [toProvider, riskAssessment, payWithCardClicked]);

  const handleRouteClick = (route: RouteData) => {
    setShowOptionsDrawer(false);
    setShowPayWithDrawer(false);
    setShowDeliverToDrawer(false);
    setSelectedRouteData(route);
  };

  const handleDeliverToClose = (connectedToAddress?: string) => {
    if (!connectedToAddress) {
      setPayWithCardClicked(false);
    }
    setShowDeliverToDrawer(false);
  };

  const handleReviewClick = () => {
    if (!selectedRouteData || !selectedToken?.address) return;

    if (!riskAssessment || isAddressSanctioned(riskAssessment)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
            error: new Error('Sanctioned address'),
          },
        },
      });

      return;
    }

    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      control: 'RoutesMenu',
      controlType: 'MenuItem',
      extras: {
        toTokenAddress: selectedRouteData.amountData.toToken.address,
        toTokenChainId: selectedRouteData.amountData.toToken.chainId,
        fromTokenAddress: selectedRouteData.amountData.fromToken.address,
        fromTokenChainId: selectedRouteData.amountData.fromToken.chainId,
        toAmount: selectedRouteData.amountData.toAmount,
        fromAmount: selectedRouteData.amountData.fromAmount,
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: AddTokensWidgetViews.REVIEW,
          data: {
            balance: selectedRouteData.amountData.balance,
            toChainId: ChainId.IMTBL_ZKEVM_MAINNET.toString(),
            toTokenAddress: selectedToken.address,
            toAmount: selectedAmount,
            additionalBuffer: selectedRouteData.amountData.additionalBuffer,
          },
        },
      },
    });
  };

  const shouldShowOnRampOption = useMemo(() => {
    if (showOnrampOption && selectedToken) {
      const isAllowedToken = onRampAllowedTokens.find(
        (token) => token.address?.toLowerCase() === selectedToken.address?.toLowerCase(),
      );
      return !!isAllowedToken;
    }
    return false;
  }, [selectedToken, onRampAllowedTokens, showOnrampOption]);

  const showInitialEmptyState = !selectedToken;

  const shouldShowBackButton = showBackButton && onBackButtonClick;
  const routeInputsReady = !!selectedToken
    && !!fromAddress
    && validateToAmount(selectedAmount).isValid
    && validateToAmount(inputValue).isValid;

  const loading = (routeInputsReady || fetchingRoutes)
    && !(selectedRouteData || insufficientBalance);

  const readyToReview = routeInputsReady && !!toAddress && !!selectedRouteData && !loading && !!riskAssessment;

  const handleWalletConnected = (
    providerType: 'from' | 'to',
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      control: 'WalletsMenu',
      controlType: 'MenuItem',
      extras: {
        providerType,
        providerName: providerInfo.name,
        providerRdns: providerInfo.rdns,
        providerUuid: providerInfo.uuid,
      },
    });
    sendConnectProviderSuccessEvent(
      eventTarget,
      providerType,
      provider,
      providerInfo,
    );
  };

  return (
    <SimpleLayout
      containerSx={{ bg: 'transparent' }}
      header={(
        <Stack
          direction="row"
          sx={{
            pos: 'absolute',
            w: '100%',
            top: '0',
            pt: 'base.spacing.x4',
            px: 'base.spacing.x5',
          }}
          justifyContent="flex-start"
        >
          {shouldShowBackButton && (
            <ButtCon
              testId="backButton"
              icon="ArrowBackward"
              variant="tertiary"
              size="small"
              onClick={onBackButtonClick}
            />
          )}
          <ButtCon
            variant="tertiary"
            size="small"
            icon="Close"
            onClick={onCloseButtonClick}
            sx={{ ml: 'auto' }}
          />
        </Stack>
      )}
    >
      <Stack alignItems="center" sx={{ flex: 1 }}>
        <Stack
          testId="topSection"
          sx={{
            flex: 1,
            px: 'base.spacing.x2',
            w: '100%',
            pt: 'base.spacing.x1',
          }}
          justifyContent="center"
          alignItems="center"
        >
          <TokenDrawerMenu
            checkout={checkout}
            config={config}
            toTokenAddress={toTokenAddress}
          />
          {showInitialEmptyState ? (
            <Body>Add Token</Body>
          ) : (
            <HeroFormControl
              validationStatus={inputValue === '0' ? 'error' : 'success'}
            >
              <HeroFormControl.Label>
                Add
                {' '}
                {selectedToken.symbol}
              </HeroFormControl.Label>
              <HeroTextInput
                inputRef={inputRef}
                testId="add-tokens-amount-input"
                type="number"
                value={inputValue}
                onChange={(value) => handleOnAmountInputChange(value)}
                placeholder="0"
                maxTextSize="xLarge"
              />

              <HeroFormControl.Caption>
                {`${t('views.ADD_TOKENS.fees.fiatPricePrefix')} 
                $${getFormattedNumberWithDecimalPlaces(selectedAmountUsd)}`}
              </HeroFormControl.Caption>
            </HeroFormControl>
          )}
        </Stack>
        <Stack
          testId="bottomSection"
          sx={{
            alignSelf: 'stretch',
            p: 'base.spacing.x3',
            pb: 'base.spacing.x5',
            bg: 'base.color.neutral.800',
            bradtl: 'base.borderRadius.x8',
            bradtr: 'base.borderRadius.x8',
          }}
          gap="base.spacing.x4"
        >
          <Stack gap="0px">
            <SelectedWallet
              sx={selectedToken
                && !fromAddress
                && inputValue
                ? { animation: `${PULSE_SHADOW} 2s infinite ease-in-out` }
                : {}}
              label="Send from"
              providerInfo={{
                ...fromProviderInfo,
                address: fromAddress,
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithDrawer(true);
              }}
            >
              {selectedToken && fromAddress && inputValue && (
              <>
                <MenuItem.BottomSlot.Divider
                  sx={fromAddress ? { ml: 'base.spacing.x4' } : undefined}
                />
                <SelectedRouteOption
                  checkout={checkout}
                  loading={loading}
                  chains={chains}
                  routeData={selectedRouteData}
                  onClick={() => setShowOptionsDrawer(true)}
                  withSelectedWallet={!!fromAddress}
                  insufficientBalance={insufficientBalance}
                  showOnrampOption={shouldShowOnRampOption}
                />
              </>
              )}

            </SelectedWallet>
            <Stack
              sx={{ pos: 'relative', h: 'base.spacing.x3' }}
              alignItems="center"
            >
              <FramedIcon
                icon="ArrowDown"
                sx={{
                  top: '0',
                  pos: 'absolute',
                  translate: '0 -30%',
                  bg: 'base.color.neutral.800',
                }}
              />
            </Stack>
            <SelectedWallet
              sx={selectedToken
                && fromAddress
                && !toAddress
                && inputValue
                ? { animation: `${PULSE_SHADOW} 2s infinite ease-in-out` }
                : {}}
              label="Deliver to"
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              onClick={() => setShowDeliverToDrawer(true)}
              disabled={lockedToProvider}
            />
          </Stack>

          <Button
            testId="add-tokens-button"
            size="large"
            variant={readyToReview ? 'primary' : 'secondary'}
            disabled={!readyToReview}
            onClick={handleReviewClick}
            sx={{ opacity: readyToReview ? 1 : 0.5 }}
          >
            Review
          </Button>

          <SquidFooter />

          <PayWithWalletDrawer
            visible={showPayWithDrawer}
            walletOptions={walletOptions}
            onClose={() => setShowPayWithDrawer(false)}
            onPayWithCard={handleCardClick}
            onConnect={handleWalletConnected}
            insufficientBalance={insufficientBalance}
            showOnRampOption={shouldShowOnRampOption}
          />
          <OptionsDrawer
            checkout={checkout}
            routes={routes}
            showOnrampOption={shouldShowOnRampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onCardClick={handleCardClick}
            onRouteClick={handleRouteClick}
            insufficientBalance={insufficientBalance}
          />
          <DeliverToWalletDrawer
            visible={showDeliverToDrawer}
            walletOptions={walletOptions}
            onClose={handleDeliverToClose}
          />
          <OnboardingDrawer environment={checkout?.config.environment!} />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
