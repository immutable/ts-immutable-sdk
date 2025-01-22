import {
  ButtCon, Button, MenuItem, Stack,
} from '@biom3/react';
import {
  ChainId,
  Checkout,
  EIP6963ProviderInfo,
  PurchaseItem,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { ChainType } from '@0xsquid/squid-types';
import { Environment } from '@imtbl/config';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { t } from 'i18next';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PurchaseContext } from '../context/PurchaseContext';
import { PurchaseItemHero } from '../components/PurchaseItemHero';
import { DeliverToWalletDrawer } from '../../../components/WalletDrawer/DeliverToWalletDrawer';
import { SelectedWallet } from '../../../components/SelectedWallet/SelectedWallet';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import { RouteOptionsDrawer } from '../components/RouteOptionsDrawer/RouteOptionsDrawer';
import { PayWithWalletDrawer } from '../../../components/WalletDrawer/PayWithWalletDrawer';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { getProviderSlugFromRdns } from '../../../lib/provider/utils';
import { sendConnectProviderSuccessEvent } from '../../add-tokens/AddTokensWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { RouteData } from '../../../lib/squid/types';
import { useRoutes } from '../../../lib/squid/hooks/useRoutes';
import { fetchBalances } from '../../../lib/squid/functions/fetchBalances';
import { SelectedRouteOption } from '../components/SelectedRouteOption/SelectedRouteOption';
import { convertToNetworkChangeableProvider } from '../../../functions/convertToNetworkChangeableProvider';
import { useExecute } from '../../../lib/squid/hooks/useExecute';
import { useSignOrder } from '../../../lib/hooks/useSignOrder';
import { SignPaymentTypes } from '../../../lib/primary-sales';
import { verifyAndSwitchChain } from '../../../lib/squid/functions/verifyAndSwitchChain';
import { UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { sendPurchaseSuccessEvent } from '../PurchaseWidgetEvents';
import { getRouteChains } from '../../../lib/squid/functions/getRouteChains';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { DirectCryptoPayData } from '../types';
import { findToken } from '../../../lib/squid/functions/findToken';
import { findBalance } from '../../../lib/squid/functions/findBalance';
import { PurchaseHandoverStep, useHandoverConfig } from '../hooks/useHandoverConfig';
import { getDurationFormatted } from '../../../functions/getDurationFormatted';

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
  const {
    purchaseState: {
      squid: { squid, chains, tokens },
      items,
      quote,
    },
  } = useContext(PurchaseContext);

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const {
    fetchRoutes, getRoute, getFromAmountData, hasSufficientBalance,
  } = useRoutes();

  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showPayWithDrawer, setShowPayWithDrawer] = useState(false);
  const [showDeliverToDrawer, setShowDeliverToDrawer] = useState(false);

  const [selectedRouteData, setSelectedRouteData] = useState<RouteData | undefined>(undefined);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [isFundingNeeded, setIsFundingNeeded] = useState<boolean | undefined>(undefined);

  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [directCryptoPayRoutes, setDirectCryptoPayRoutes] = useState<DirectCryptoPayData[]>([]);
  // eslint-disable-next-line max-len
  const [selectedDirectCryptoPayRoute, setSelectedDirectCryptoPayRoute] = useState<DirectCryptoPayData | undefined>(undefined);

  // TODO: Fetch from Primary Sales quote
  const item = {
    id: 'lootbox',
    name: 'Lootbox',
    price: '1',
    token: 'USDC',
    tokenAddress: '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
  };

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
    },
  } = useProvidersContext();
  const { providers } = useInjectedProviders({ checkout });

  const {
    getAllowance, approve, execute, getStatus, waitForReceipt,
  } = useExecute(UserJourney.PURCHASE, (err) => {
    // eslint-disable-next-line no-console
    console.log('useExecute err', err);
  });

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

  const { showHandover } = useHandoverConfig(checkout.config.environment);

  const handleWalletConnected = (
    providerType: 'from' | 'to',
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    sendConnectProviderSuccessEvent(
      eventTarget,
      providerType,
      provider,
      providerInfo,
    );
  };

  const handleRouteClick = (route: RouteData) => {
    setShowOptionsDrawer(false);
    setShowPayWithDrawer(false);
    setShowDeliverToDrawer(false);
    setSelectedRouteData(route);
    setSelectedDirectCryptoPayRoute(undefined);
  };

  const handleDirectCryptoPayClick = (route: DirectCryptoPayData) => {
    // eslint-disable-next-line no-console
    console.log('handleDirectCryptoPayClick', route);
    setShowOptionsDrawer(false);
    setShowPayWithDrawer(false);
    setShowDeliverToDrawer(false);
    setSelectedRouteData(undefined);
    setSelectedDirectCryptoPayRoute(route);
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

    (async () => {
      if (balances && squid && tokens && balances.length > 0) {
        // eslint-disable-next-line no-console
        console.log('balances', balances);
        const isSufficientBalance = hasSufficientBalance(
          balances,
          item.tokenAddress,
          ChainId.IMTBL_ZKEVM_MAINNET.toString(),
          item.price,
        );
        // eslint-disable-next-line no-console
        console.log('isSufficientBalance', isSufficientBalance);
        setIsFundingNeeded(!isSufficientBalance);

        if (isSufficientBalance) {
          const token = findToken(tokens, item.tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());
          const balance = findBalance(balances, item.tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());
          // eslint-disable-next-line no-console
          console.log('token', token);
          // eslint-disable-next-line no-console
          console.log('balance', balance);
          if (token && balance) {
            setDirectCryptoPayRoutes([{
              isInsufficientGas: true,
              amountData: {
                fromToken: token,
                fromAmount: item.price,
                toToken: token,
                toAmount: item.price,
                balance,
                additionalBuffer: 0,
              },
            }]);
          }
        }
        setFetchingRoutes(true);
        console.log('fetching routes');
        const availableRoutes = await fetchRoutes(
          squid,
          tokens,
          balances,
          ChainId.IMTBL_ZKEVM_MAINNET.toString(),
          item.tokenAddress,
          item.price,
          5,
          1000,
          true,
        );
        setFetchingRoutes(false);
        setRoutes(availableRoutes);
        setInsufficientBalance(availableRoutes.length === 0);
      }
    })();
  }, [balances, squid]);

  useEffect(() => {
    if (!squid || !chains || !fromProvider) return;

    (async () => {
      const updatedBalances = await fetchBalances(squid, chains, fromProvider);
      setBalances(updatedBalances);
    })();
  }, [squid, chains, fromProvider]);

  useEffect(() => {
    if (!selectedRouteData && routes.length > 0) {
      setSelectedRouteData(routes[0]);
    }
  }, [routes]);

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
  }, [quote]);

  const shouldShowBackButton = showBackButton && onBackButtonClick;
  const shouldShowOnRampOption = false;
  const showSwapOption = true;
  const showBridgeOption = true;

  const { signWithPostHooks, sign } = useSignOrder({
    environmentId,
    provider: fromProvider,
    items: [{
      productId: item.id,
      name: item.name,
      qty: 1,
      image: 'https://i.ibb.co/pRh6PtM/lootbox.png',
      description: 'A common lootbox',
    }],
    fromTokenAddress: item.tokenAddress,
    recipientAddress: toAddress || '',
    environment: checkout?.config.environment || Environment.SANDBOX,
    waitFulfillmentSettlements: false,
  });

  const squidMulticallAddress = '0xad6cea45f98444a922a2b4fe96b8c90f0862d2f4';
  const handleDirectCryptoPayment = async (
    provider: Web3Provider,
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

    const gasPrice = await provider.getGasPrice();

    const approveTxn = signResponse.transactions.find(
      (txn) => txn.methodCall.startsWith('approve'),
    );
    if (!approveTxn) return;
    showHandover(PurchaseHandoverStep.REQUEST_APPROVAL, {});

    const approveTxnResponse = await signer.sendTransaction({
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

    const executeTxnResponse = await signer.sendTransaction({
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
    // eslint-disable-next-line max-len
    if (!squid || !tokens || !toAddress || !fromAddress || !fromProvider || !fromProviderInfo) return;
    if (!selectedRouteData && isFundingNeeded) return;

    if (selectedDirectCryptoPayRoute === undefined) {
      if (!selectedRouteData) return;

      const signResponse = await signWithPostHooks(
        SignPaymentTypes.CRYPTO,
        item.tokenAddress,
        squidMulticallAddress,
        toAddress,
      );

      // eslint-disable-next-line no-console
      console.log('signResponse', signResponse?.signResponse);
      // eslint-disable-next-line no-console
      console.log('postHooks', signResponse?.postHooks);

      const updatedAmountData = getFromAmountData(
        tokens,
        selectedRouteData.amountData.balance,
        item.price,
        ChainId.IMTBL_ZKEVM_MAINNET.toString(),
        item.tokenAddress,
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

      const currentFromAddress = await fromProvider.getSigner().getAddress();
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

      if (!allowance || allowance?.lt(fromAmount)) {
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

      sendPurchaseSuccessEvent(eventTarget, executeTxnReceipt.transactionHash, fundingMethod);

      if (toChain === fromChain) {
        showHandover(PurchaseHandoverStep.SUCCESS_ZKEVM, { transactionHash: executeTxnReceipt.transactionHash });
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
        transactionHash: executeTxnReceipt.transactionHash,
      });

      const status = await getStatus(squid, executeTxnReceipt.transactionHash);
      const axelarscanUrl = `https://axelarscan.io/gmp/${executeTxnReceipt?.transactionHash}`;

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
      handleDirectCryptoPayment(fromProvider, fromAddress, toAddress, item.tokenAddress);
    }
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
    (!(selectedRouteData || insufficientBalance || isFundingNeeded === false))
  );

  const readyToProceed = !!fromAddress
    && !!toAddress
    && !loading
    && ((!!selectedRouteData && !selectedRouteData.isInsufficientGas) || (isFundingNeeded === false));

  const totalQty = items?.reduce((sum, purchaseItem: PurchaseItem) => sum + purchaseItem.qty, 0) || 0;

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
          <PurchaseItemHero items={items} totalQty={totalQty} />
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
              label="Pay with"
              providerInfo={{
                ...fromProviderInfo,
                address: fromAddress,
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithDrawer(true);
              }}
            >
              {fromAddress && (
              <>
                <MenuItem.BottomSlot.Divider
                  sx={fromAddress ? { ml: 'base.spacing.x4' } : undefined}
                />
                <SelectedRouteOption
                  checkout={checkout}
                  loading={loading}
                  chains={chains}
                  routeData={selectedRouteData || (selectedDirectCryptoPayRoute || undefined)}
                  onClick={() => setShowOptionsDrawer(true)}
                  withSelectedWallet={!!fromAddress}
                  insufficientBalance={insufficientBalance}
                  directCryptoPay={!isFundingNeeded}
                  showOnrampOption={shouldShowOnRampOption}
                />
              </>
              )}
            </SelectedWallet>

            <SelectedWallet
              label="Deliver to"
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              onClick={() => setShowDeliverToDrawer(true)}
            />
          </Stack>

          <Button
            testId="add-tokens-button"
            size="large"
            variant={readyToProceed ? 'primary' : 'secondary'}
            disabled={!readyToProceed}
            sx={{ opacity: readyToProceed ? 1 : 0.5 }}
            onClick={handleProceedClick}
          >
            Proceed
          </Button>

          <SquidFooter />

          <PayWithWalletDrawer
            visible={showPayWithDrawer}
            walletOptions={walletOptions}
            onClose={() => setShowPayWithDrawer(false)}
            onPayWithCard={() => false}
            onConnect={handleWalletConnected}
            insufficientBalance={insufficientBalance}
            showOnRampOption={shouldShowOnRampOption}
          />
          <RouteOptionsDrawer
            checkout={checkout}
            routes={routes}
            chains={chains}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            showDirectCryptoPayOption
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onCardClick={() => false}
            onRouteClick={handleRouteClick}
            onDirectCryptoPayClick={handleDirectCryptoPayClick}
            insufficientBalance={insufficientBalance}
            directCryptoPay={!isFundingNeeded}
            directCryptoPayRoutes={directCryptoPayRoutes}
          />
          <DeliverToWalletDrawer
            visible={showDeliverToDrawer}
            walletOptions={walletOptions}
            onClose={() => setShowDeliverToDrawer(false)}
            onConnect={handleWalletConnected}
          />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
