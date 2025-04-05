import { ChainType } from '@0xsquid/squid-types';
import {
  Stack, ButtCon, Button,
} from '@biom3/react';
import {
  Checkout, WalletProviderRdns, EIP6963ProviderInfo, ChainId,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { t } from 'i18next';
import {
  useContext, useState, useMemo, useEffect, useCallback,
} from 'react';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { CryptoFiatContext, CryptoFiatActions } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { convertToNetworkChangeableProvider } from '../../../functions/convertToNetworkChangeableProvider';
import { getDurationFormatted } from '../../../functions/getDurationFormatted';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import { fetchBalances } from '../../../lib/squid/functions/fetchBalances';
import { findBalance } from '../../../lib/squid/functions/findBalance';
import { findToken } from '../../../lib/squid/functions/findToken';
import { getRouteChains } from '../../../lib/squid/functions/getRouteChains';
import { verifyAndSwitchChain } from '../../../lib/squid/functions/verifyAndSwitchChain';
import { useExecute } from '../../../lib/squid/hooks/useExecute';
import { useRoutes } from '../../../lib/squid/hooks/useRoutes';
import { RouteData } from '../../../lib/squid/types';
import { useSignOrder } from '../../../lib/hooks/useSignOrder';
import { SignPaymentTypes } from '../../../lib/primary-sales';
import { PurchaseDeliverToWalletDrawer } from '../components/PurchaseDeliverToWalletDrawer';
import { PurchaseItemHero } from '../components/PurchaseItemHero';
import { PurchasePayWithWalletDrawer } from '../components/PurchasePayWithWalletDrawer';
import { RouteOptionsDrawer } from '../components/PurchaseRouteOptionsDrawer/RouteOptionsDrawer';
import { PurchaseSelectedRouteOption } from '../components/PurchaseSelectedRouteOption';
import { PurchaseSelectedWallet } from '../components/PurchaseSelectedWallet';
import { PurchaseActions, PurchaseContext } from '../context/PurchaseContext';
import { useHandoverConfig, PurchaseHandoverStep } from '../hooks/useHandoverConfig';
import { sendConnectProviderSuccessEvent, sendPurchaseSuccessEvent } from '../PurchaseWidgetEvents';
import {
  DirectCryptoPayData,
} from '../types';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { PurchaseWidgetViews } from '../../../context/view-context/PurchaseViewContextTypes';

interface PurchaseProps {
  checkout: Checkout;
  environmentId: string;
  showBackButton?: boolean;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export function Purchase({
  checkout,
  environmentId,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: PurchaseProps) {
  const [showPayWithWalletDrawer, setShowPayWithWalletDrawer] = useState(false);
  const [showDeliverToWalletDrawer, setShowDeliverToWalletDrawer] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);

  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [directCryptoPayRoutes, setDirectCryptoPayRoutes] = useState<DirectCryptoPayData[]>([]);

  const [selectedRouteData, setSelectedRouteData] = useState<RouteData | undefined>(undefined);
  const [selectedDirectCryptoPayRoute, setSelectedDirectCryptoPayRoute] = useState<
  DirectCryptoPayData | undefined
  >(undefined);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  const [isPayWithCard, setIsPayWithCard] = useState(false);

  const {
    purchaseState: {
      squid: { squid, tokens, chains },
      items,
      quote,
    },
  } = useContext(PurchaseContext);

  const { viewDispatch } = useContext(ViewContext);

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const { purchaseDispatch } = useContext(PurchaseContext);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    providersState: {
      fromProviderInfo,
      fromProvider,
      toProviderInfo,
      fromAddress,
      toAddress,
      lockedToProvider,
    },
  } = useProvidersContext();

  const {
    fetchRoutes, getRoute, getFromAmountData, hasSufficientBalance, hasSufficientGas,
  } = useRoutes();
  const { providers } = useInjectedProviders({ checkout });

  const {
    getAllowance, approve, execute, getStatus, waitForReceipt,
  } = useExecute(UserJourney.PURCHASE, (err) => {
    // eslint-disable-next-line no-console
    console.log('useExecute err', err);
  });

  const { signWithPostHooks, sign } = useSignOrder({
    environmentId,
    provider: fromProvider,
    items,
    recipientAddress: toAddress || '',
    environment: checkout?.config.environment || Environment.SANDBOX,
    waitFulfillmentSettlements: false,
  });

  const { showHandover } = useHandoverConfig(checkout.config.environment);

  const handleWalletConnected = (
    providerType: 'from' | 'to',
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    setIsPayWithCard(false);

    sendConnectProviderSuccessEvent(
      eventTarget,
      providerType,
      provider,
      providerInfo,
    );
  };

  const handleRouteClick = (route: RouteData) => {
    setShowOptionsDrawer(false);
    setShowPayWithWalletDrawer(false);
    setShowDeliverToWalletDrawer(false);
    setSelectedRouteData(route);
    setSelectedDirectCryptoPayRoute(undefined);
  };

  const handleDirectCryptoPayClick = (route: DirectCryptoPayData) => {
    setShowOptionsDrawer(false);
    setShowPayWithWalletDrawer(false);
    setShowDeliverToWalletDrawer(false);
    setSelectedRouteData(undefined);
    setSelectedDirectCryptoPayRoute(route);
  };

  const handlePayWithCardClick = () => {
    setIsPayWithCard(true);
    setShowOptionsDrawer(false);
    setShowPayWithWalletDrawer(false);
    setShowDeliverToWalletDrawer(false);
    setSelectedRouteData(undefined);
    setSelectedDirectCryptoPayRoute(undefined);
  };

  useEffect(() => {
    setRoutes([]);
    setInsufficientBalance(false);
    setSelectedRouteData(undefined);
  }, [fromAddress]);

  useEffect(() => {
    setRoutes([]);
    setInsufficientBalance(false);
    setSelectedRouteData(undefined);

    if (!squid || !quote || !tokens || balances?.length === 0) return;
    if (isPayWithCard) return;

    setFetchingRoutes(true);

    (async () => {
      const tokenAddress = quote.currency.address;
      const tokenAmount = String(quote.totalCurrencyAmount);

      const isSufficientBalance = hasSufficientBalance(
        balances,
        tokenAddress,
        ChainId.IMTBL_ZKEVM_MAINNET.toString(),
        tokenAmount,
      );

      if (isSufficientBalance) {
        const token = findToken(tokens, tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());
        const balance = findBalance(balances, tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());

        if (token && balance) {
          const directCryptoRoute = {
            isInsufficientGas: !hasSufficientGas(balances, ChainId.IMTBL_ZKEVM_MAINNET.toString(), fromProvider),
            amountData: {
              fromToken: token,
              fromAmount: tokenAmount,
              toToken: token,
              toAmount: tokenAmount,
              balance,
              additionalBuffer: 0,
            },
          };

          setDirectCryptoPayRoutes([directCryptoRoute]);
          setSelectedDirectCryptoPayRoute(directCryptoRoute);
        }
      }

      const availableRoutes = await fetchRoutes(
        squid,
        tokens,
        balances,
        ChainId.IMTBL_ZKEVM_MAINNET.toString(),
        tokenAddress,
        tokenAmount,
        5,
        1000,
        true,
      );

      setRoutes(availableRoutes);
      setFetchingRoutes(false);
      setInsufficientBalance(availableRoutes.length === 0);

      if (availableRoutes && availableRoutes.length > 0 && !isSufficientBalance) {
        setSelectedRouteData(availableRoutes[0]);
      }
    }
    )();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, balances, squid]);

  useEffect(() => {
    if (!squid || !chains || !fromProvider) return;

    (async () => {
      const updatedBalances = await fetchBalances(squid, chains, fromProvider);
      setBalances(updatedBalances);
    })();
  }, [squid, chains, fromProvider]);

  useEffect(() => {
    if (!quote) return;

    const tokenSymbols = Object
      .values(quote.quote.totalAmount)
      .map((price) => price.currency);

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  const shouldShowBackButton = showBackButton && onBackButtonClick;
  const shouldShowOnRampOption = true;
  const showSwapOption = true;
  const showBridgeOption = true;

  const squidMulticallAddress = '0xad6cea45f98444a922a2b4fe96b8c90f0862d2f4';

  const handleFiatPayment = async (
    recipientAddress: string,
    tokenAddress: string,
  ) => {
    const signResponse = await sign(
      SignPaymentTypes.FIAT,
      tokenAddress,
      recipientAddress,
    );
    if (!signResponse) return;
    purchaseDispatch({
      payload: {
        type: PurchaseActions.SET_SIGN_RESPONSE,
        signResponse,
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: PurchaseWidgetViews.PAY_WITH_CARD },
      },
    });
  };

  const handleDirectCryptoPayment = async (
    provider: WrappedBrowserProvider,
    spenderAddress: string,
    recipientAddress: string,
    tokenAddress: string,
  ) => {
    const signResponse = await sign(
      SignPaymentTypes.CRYPTO,
      tokenAddress,
      spenderAddress,
      recipientAddress,
    );
    if (!signResponse) return;
    const signer = provider.getSigner();
    if (!signer) return;

    showHandover(PurchaseHandoverStep.PREPARING, {});

    const { gasPrice } = await provider.getFeeData();

    const approveTxn = signResponse.transactions.find(
      (txn) => txn.methodCall.startsWith('approve'),
    );
    if (!approveTxn) return;
    showHandover(PurchaseHandoverStep.REQUEST_APPROVAL, {});

    const approveTxnResponse = await (await signer).sendTransaction({
      to: approveTxn.tokenAddress,
      data: approveTxn.rawData,
      gasPrice,
      gasLimit: approveTxn.gasEstimate,
    });
    const approveReceipt = await waitForReceipt(provider, approveTxnResponse.hash);
    if (!approveReceipt) {
      return;
    }
    showHandover(PurchaseHandoverStep.APPROVAL_CONFIRMED, {});

    const executeTxn = signResponse.transactions.find(
      (txn) => txn.methodCall.startsWith('execute'),
    );
    if (!executeTxn) return;
    showHandover(PurchaseHandoverStep.REQUEST_EXECUTION, {});

    const executeTxnResponse = await (await signer).sendTransaction({
      to: executeTxn.tokenAddress,
      data: executeTxn.rawData,
      gasPrice,
      gasLimit: executeTxn.gasEstimate,
    });
    const executeReceipt = await waitForReceipt(provider, executeTxnResponse.hash);
    if (executeReceipt?.status === 1) {
      showHandover(PurchaseHandoverStep.SUCCESS_ZKEVM, { transactionHash: executeTxnResponse.hash });
    }
  };

  const handleProceedClick = useCallback(async () => {
    if (!quote || !toAddress) return;

    if (isPayWithCard) {
      handleFiatPayment(toAddress, quote.currency.address);
      return;
    }

    if (!squid || !tokens || !toAddress || !fromAddress || !fromProvider || !fromProviderInfo || !quote) return;
    if (!selectedRouteData && !selectedDirectCryptoPayRoute) return;

    if (selectedDirectCryptoPayRoute === undefined) {
      if (!selectedRouteData) return;

      const signResponse = await signWithPostHooks(
        SignPaymentTypes.CRYPTO,
        quote.currency.address,
        squidMulticallAddress,
        toAddress,
      );
      if (!signResponse) return;
      purchaseDispatch({
        payload: {
          type: PurchaseActions.SET_SIGN_RESPONSE,
          signResponse: signResponse.signResponse,
        },
      });

      const updatedAmountData = getFromAmountData(
        tokens,
        selectedRouteData.amountData.balance,
        String(quote.totalCurrencyAmount),
        ChainId.IMTBL_ZKEVM_MAINNET.toString(),
        quote.currency.address,
        selectedRouteData.amountData.additionalBuffer,
      );
      if (!updatedAmountData) return;

      const postHooks = signResponse?.postHooks ? {
        chainType: ChainType.EVM,
        calls: signResponse.postHooks,
        provider: 'Immutable Primary Sales',
        description: 'Perform Primary Sales NFT checkout',
        logoURI: 'https://explorer.immutable.com/assets/configs/network_icon.svg',
      } : undefined;

      const route = (await getRoute(
        squid,
        updatedAmountData?.fromToken,
        updatedAmountData?.toToken,
        toAddress,
        updatedAmountData.fromAmount,
        updatedAmountData.toAmount,
        fromAddress,
        false,
        postHooks,
      ))?.route;

      if (!route) return;

      const currentFromAddress = await (await fromProvider.getSigner()).getAddress();
      const { fromChain, toChain } = getRouteChains(chains, route);

      if (currentFromAddress !== fromAddress) {
        return;
      }

      showHandover(PurchaseHandoverStep.PREPARING, {});

      const changeableProvider = await convertToNetworkChangeableProvider(
        fromProvider,
      );

      const verifyChainResult = await verifyAndSwitchChain(
        changeableProvider,
        route.route.params.fromChain,
      );

      if (!verifyChainResult.isChainCorrect) {
        return;
      }

      const allowance = await getAllowance(changeableProvider, route);
      const { fromAmount } = route.route.params;

      // eslint-disable-next-line no-console
      console.log('allowance', allowance);

      if (!allowance || allowance < BigInt(fromAmount)) {
        showHandover(PurchaseHandoverStep.REQUEST_APPROVAL, {});

        const approveTxnReceipt = await approve(fromProviderInfo, changeableProvider, route);

        if (!approveTxnReceipt) {
          return;
        }

        showHandover(PurchaseHandoverStep.APPROVAL_CONFIRMED, {});
      }

      showHandover(PurchaseHandoverStep.REQUEST_EXECUTION, {});

      const executeTxnReceipt = await execute(squid, fromProviderInfo, changeableProvider, route);

      // eslint-disable-next-line no-console
      console.log('executeTxnReceipt', executeTxnReceipt);

      if (!executeTxnReceipt) {
        return;
      }

      const fundingMethod = fromChain !== toChain ? 'squid' : 'direct';

      sendPurchaseSuccessEvent(eventTarget, executeTxnReceipt.hash, fundingMethod);

      if (toChain === fromChain) {
        showHandover(PurchaseHandoverStep.SUCCESS_ZKEVM, { transactionHash: executeTxnReceipt.hash });
        return;
      }

      const formattedDuration = selectedRouteData
        ? getDurationFormatted(
          selectedRouteData.route.route.estimate.estimatedRouteDuration,
          t('views.PURCHASE.routeSelection.minutesText'),
          t('views.PURCHASE.routeSelection.minuteText'),
          t('views.PURCHASE.routeSelection.secondsText'),
        )
        : '';

      showHandover(PurchaseHandoverStep.EXECUTING, {
        routeDuration: formattedDuration,
        transactionHash: executeTxnReceipt.hash,
      });

      const status = await getStatus(squid, executeTxnReceipt.hash);
      const axelarscanUrl = `https://axelarscan.io/gmp/${executeTxnReceipt?.hash}`;

      // eslint-disable-next-line no-console
      console.log('status', status);
      // eslint-disable-next-line no-console
      console.log('axelarscanUrl', axelarscanUrl);

      if (status?.squidTransactionStatus === 'success') {
        showHandover(PurchaseHandoverStep.SUCCESS, { axelarscanUrl });
      } else if (status?.squidTransactionStatus === 'needs_gas') {
        showHandover(PurchaseHandoverStep.NEEDS_GAS, { axelarscanUrl });
      } else if (status?.squidTransactionStatus === 'partial_success') {
        showHandover(PurchaseHandoverStep.PARTIAL_SUCCESS, { axelarscanUrl });
      } else {
        showHandover(PurchaseHandoverStep.FAIL, { axelarscanUrl });
      }
    } else {
      handleDirectCryptoPayment(fromProvider, fromAddress, toAddress, quote.currency.address);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    squid,
    tokens,
    toAddress,
    selectedRouteData,
    fromProvider,
    fromProviderInfo,
    approve,
    getAllowance,
    execute,
  ]);

  const loading = (!!fromAddress || fetchingRoutes) && (
    (!(selectedRouteData || insufficientBalance || selectedDirectCryptoPayRoute))
  ) && !isPayWithCard;

  const readyToProceed = (!!fromAddress || isPayWithCard)
    && !!toAddress
    && !loading
    && ((!!selectedRouteData && !selectedRouteData.isInsufficientGas)
    || (!!selectedDirectCryptoPayRoute && !selectedDirectCryptoPayRoute.isInsufficientGas) || isPayWithCard);

  const walletOptions = useMemo(
    () => providers
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

  const handleDeliverToWalletClose = () => {
    setShowDeliverToWalletDrawer(false);
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
          <PurchaseItemHero items={items} />
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
          <Stack gap="base.spacing.x3">
            {(!fromProviderInfo || isPayWithCard) && (
            <PurchaseSelectedWallet
              label={isPayWithCard ? 'Pay with card'
                : t('views.PURCHASE.walletSelection.from.label')}
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithWalletDrawer(true);
              }}
            />
            )}

            {fromAddress && !isPayWithCard && (
              <PurchaseSelectedRouteOption
                checkout={checkout}
                loading={loading}
                chains={chains}
                routeData={selectedRouteData || (selectedDirectCryptoPayRoute || undefined)}
                onClick={() => setShowOptionsDrawer(true)}
                insufficientBalance={insufficientBalance}
                directCryptoPay={!!selectedDirectCryptoPayRoute}
                showOnrampOption={shouldShowOnRampOption}
              />
            )}

            <PurchaseSelectedWallet
              label={t('views.PURCHASE.walletSelection.to.label')}
              size={toProviderInfo ? 'xSmall' : 'small'}
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              onClick={() => setShowDeliverToWalletDrawer(true)}
              disabled={lockedToProvider}
            />
          </Stack>

          <Button
            testId="purchase-proceed-button"
            size="large"
            variant={readyToProceed ? 'primary' : 'secondary'}
            disabled={!readyToProceed}
            sx={{ opacity: readyToProceed ? 1 : 0.5 }}
            onClick={handleProceedClick}
          >
            {t('views.PURCHASE.review.buttonText')}
          </Button>

          <SquidFooter />

        </Stack>
      </Stack>

      <PurchasePayWithWalletDrawer
        visible={showPayWithWalletDrawer}
        walletOptions={walletOptions}
        onClose={() => {
          setShowPayWithWalletDrawer(false);
        }}
        onPayWithCard={handlePayWithCardClick}
        onConnect={handleWalletConnected}
        insufficientBalance={insufficientBalance}
        showOnRampOption={shouldShowOnRampOption}
      />
      <PurchaseDeliverToWalletDrawer
        visible={showDeliverToWalletDrawer}
        walletOptions={walletOptions}
        onClose={handleDeliverToWalletClose}
        onConnect={() => undefined}
      />
      <RouteOptionsDrawer
        checkout={checkout}
        routes={routes}
        chains={chains}
        showSwapOption={showSwapOption}
        showBridgeOption={showBridgeOption}
        showOnrampOption={shouldShowOnRampOption}
        showDirectCryptoPayOption
        visible={showOptionsDrawer}
        onClose={() => setShowOptionsDrawer(false)}
        onCardClick={handlePayWithCardClick}
        onRouteClick={handleRouteClick}
        onDirectCryptoPayClick={handleDirectCryptoPayClick}
        onChangeWalletClick={() => setShowPayWithWalletDrawer(true)}
        insufficientBalance={insufficientBalance}
        directCryptoPayRoutes={directCryptoPayRoutes}
      />
    </SimpleLayout>
  );
}
