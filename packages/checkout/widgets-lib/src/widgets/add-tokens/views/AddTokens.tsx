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
  TokenFilterTypes,
  type TokenInfo,
  WalletProviderRdns,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import {
  type ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ActionType } from '@0xsquid/squid-types';
import { trackFlow } from '@imtbl/metrics';
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
import { useRoutes } from '../../../lib/squid/hooks/useRoutes';
import { AddTokensWidgetViews } from '../../../context/view-context/AddTokensViewContextTypes';
import { AddTokensErrorTypes } from '../types';
import { SelectedRouteOption } from '../components/SelectedRouteOption';
import { SelectedWallet } from '../components/SelectedWallet';
import { DeliverToWalletDrawer } from '../../../components/WalletDrawer/DeliverToWalletDrawer';
import { PayWithWalletDrawer } from '../../../components/WalletDrawer/PayWithWalletDrawer';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { sendConnectProviderSuccessEvent } from '../AddTokensWidgetEvents';
import { convertToUsd } from '../../../lib/squid/functions/convertToUsd';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { validateToAmount } from '../functions/amountValidation';
import { OnboardingDrawer } from '../components/OnboardingDrawer';
import { useError } from '../hooks/useError';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import { TokenDrawerMenu } from '../components/TokenDrawerMenu';
import { PULSE_SHADOW } from '../utils/animation';
import { checkSanctionedAddresses } from '../functions/checkSanctionedAddresses';
import { getFormattedAmounts } from '../functions/getFormattedNumber';
import { RouteData } from '../../../lib/squid/types';
import { SQUID_NATIVE_TOKEN } from '../../../lib/squid/config';
import { identifyUser } from '../../../lib/analytics/identifyUser';

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
    addTokensState,
    addTokensDispatch,
  } = useContext(AddTokensContext);
  const {
    id,
    squid,
    chains,
    balances,
    tokens,
    selectedAmount,
    routes,
    selectedRouteData,
    selectedToken,
    isSwapAvailable,
  } = addTokensState;

  const {
    track,
    page,
    identify,
    user,
  } = useAnalytics();
  const { viewDispatch } = useContext(ViewContext);
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
  const [isAmountInputSynced, setIsAmountInputSynced] = useState(false);

  const debouncedSetSelectedAmount = useRef(
    debounce((value: string) => {
      addTokensDispatch({
        payload: {
          type: AddTokensActions.SET_SELECTED_AMOUNT,
          selectedAmount: value,
        },
      });
    }, 2500),
  );

  const selectedAmountUsd = useMemo(
    () => convertToUsd(tokens, inputValue, selectedToken),
    [tokens, inputValue, selectedToken],
  );

  const setSelectedAmount = (value: string) => {
    setIsAmountInputSynced(false);
    debouncedSetSelectedAmount.current(value);
  };

  useEffect(() => {
    if (selectedAmount === inputValue) {
      setIsAmountInputSynced(true);
    }
  }, [selectedAmount, inputValue]);

  const setSelectedRouteData = (route: RouteData | undefined) => {
    if (route) {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'InputScreen',
        control: 'RoutesMenu',
        controlType: 'MenuItem',
        extras: {
          contextId: id,
          toTokenAddress: route.amountData.toToken.address,
          toTokenChainId: route.amountData.toToken.chainId,
          toTokenSymbol: route.amountData.toToken.symbol,
          fromTokenAddress: route.amountData.fromToken.address,
          fromTokenChainId: route.amountData.fromToken.chainId,
          fromTokenSymbol: route.amountData.fromToken.symbol,
          toAmount: route.amountData.toAmount,
          fromAmount: route.amountData.fromAmount,
          isBridge: route.amountData.toToken.chainId !== route.amountData.fromToken.chainId,
          isSwap: route.amountData.toToken.chainId === route.amountData.fromToken.chainId,
          hasEmbeddedSwap: !!route.route.route.estimate.actions.find(
            (action) => action.type === ActionType.SWAP,
          ),
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

    if (isValid || amount === 0 || value === '') {
      setInputValue(value);

      if (amount > 0) {
        setSelectedAmount(value);

        track({
          userJourney: UserJourney.ADD_TOKENS,
          screen: 'InputScreen',
          control: 'AmountInput',
          controlType: 'TextInput',
          extras: {
            contextId: id,
            toAmount: value,
          },
        });
      } else {
        setSelectedAmount('');
      }
    }
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
    if (!lockedToProvider) { return; }

    (async () => {
      const userData = user ? await user() : undefined;
      const anonymousId = userData?.anonymousId();

      await identifyUser(identify, toProvider!, { anonymousId });
    })();
  }, [toProvider, lockedToProvider]);

  const toChain = useMemo(
    () => chains?.find((chain) => chain.id === ChainId.IMTBL_ZKEVM_MAINNET.toString()),
    [chains],
  );

  useEffect(() => {
    if (!id || isSwapAvailable === undefined) { return; }

    page({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      extras: {
        contextId: id,
        toAmount,
        toTokenAddress,
        geoBlocked: !isSwapAvailable,
      },
    }).then((ctx) => {
      trackFlow('commerce', `addTokensLoaded_${ctx.event.messageId}`);
    });
  }, [id, isSwapAvailable]);

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

        track({
          userJourney: UserJourney.ADD_TOKENS,
          screen: 'InputScreen',
          control: 'RoutesMenu',
          controlType: 'MenuItem',
          action: 'Request',
          extras: {
            contextId: id,
            routesAvailable: availableRoutes.length,
            geoBlocked: !isSwapAvailable,
          },
        });

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
        showErrorHandover(AddTokensErrorTypes.SERVICE_BREAKDOWN, { contextId: id, error });
      }
    };
    fetchOnRampTokens();
  }, [checkout, id]);

  const sendRequestOnRampEvent = async () => {
    if (
      toAddress
      && (await checkSanctionedAddresses([toAddress], checkout.config))
    ) {
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
        contextId: id,
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
    if (toProvider && payWithCardClicked) {
      sendRequestOnRampEvent();
    }
  }, [toProvider, payWithCardClicked]);

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

  const handleReviewClick = async () => {
    if (!selectedRouteData || !selectedToken?.address) return;

    if (
      fromAddress
      && toAddress
      && (await checkSanctionedAddresses(
        [fromAddress, toAddress],
        checkout.config,
      ))
    ) {
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
      control: 'Review',
      controlType: 'Button',
      extras: {
        contextId: id,
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

  useEffect(() => {
    if (inputRef.current && !showInitialEmptyState) {
      inputRef.current.focus();
    }
  }, [showInitialEmptyState]);

  const shouldShowBackButton = showBackButton && onBackButtonClick;

  const routeInputsReady = !!selectedToken
    && !!fromAddress
    && validateToAmount(selectedAmount).isValid
    && validateToAmount(inputValue).isValid
    && isAmountInputSynced;

  const loading = (routeInputsReady || fetchingRoutes)
    && !(selectedRouteData || insufficientBalance);

  const readyToReview = routeInputsReady && !!toAddress && !!selectedRouteData && !loading;

  const handleWalletConnected = (
    providerType: 'from' | 'to',
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'InputScreen',
      control: 'WalletsMenu',
      controlType: 'MenuItem',
      extras: {
        contextId: id,
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

  const getChainInfo = () => {
    if (toChain) {
      return {
        iconUrl: toChain.iconUrl,
        name: toChain.name,
      };
    }
    return undefined;
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
            addTokensState={addTokensState}
            addTokensDispatch={addTokensDispatch}
          />
          {showInitialEmptyState ? (
            <Body weight="bold">{t('views.ADD_TOKENS.tokenSelection.buttonText')}</Body>
          ) : (
            <HeroFormControl
              validationStatus={validateToAmount(inputValue).isValid || inputValue === '' ? 'success' : 'error'}
            >
              <HeroFormControl.Label>
                {t('views.ADD_TOKENS.tokenSelection.tokenLabel')}
                {' '}
                {selectedToken.symbol}
              </HeroFormControl.Label>
              <HeroTextInput
                inputRef={inputRef}
                testId="add-tokens-amount-input"
                type="text"
                value={inputValue}
                onChange={(event) => handleOnAmountInputChange(event)}
                placeholder="0"
                maxTextSize="xLarge"
              />

              <HeroFormControl.Caption>
                {`${t('views.ADD_TOKENS.fees.fiatPricePrefix')}
                $${getFormattedAmounts(selectedAmountUsd)}`}
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
                && selectedAmount
                ? { animation: `${PULSE_SHADOW} 2s infinite ease-in-out` }
                : {}}
              label={t('views.ADD_TOKENS.walletSelection.from.label')}
              caption={t('views.ADD_TOKENS.walletSelection.from.caption')}
              providerInfo={{
                ...fromProviderInfo,
                address: fromAddress,
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithDrawer(true);
              }}
            >
              {selectedToken && fromAddress && selectedAmount && isAmountInputSynced && (
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
                && selectedAmount
                ? { animation: `${PULSE_SHADOW} 2s infinite ease-in-out` }
                : {}}
              label={t('views.ADD_TOKENS.walletSelection.to.label')}
              caption={t('views.ADD_TOKENS.walletSelection.to.caption')}
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              chainInfo={getChainInfo()}
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
            {t('views.ADD_TOKENS.review.buttonText')}
          </Button>

          <SquidFooter />

          <PayWithWalletDrawer
            visible={showPayWithDrawer}
            walletOptions={walletOptions}
            onClose={() => setShowPayWithDrawer(false)}
            onPayWithCard={handleCardClick}
            onConnect={handleWalletConnected}
            insufficientBalance={insufficientBalance}
            showOnRampOption={shouldShowOnRampOption || !selectedToken}
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
            onConnect={handleWalletConnected}
          />
          <OnboardingDrawer environment={checkout?.config.environment!} />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
