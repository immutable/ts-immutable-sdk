import {
  ButtCon, Button, Caption, Link, MenuItem, Stack,
} from '@biom3/react';
import {
  ChainId,
  Checkout,
  EIP6963ProviderInfo,
  PurchaseItem,
  WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  ReactNode,
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
import { Trans } from 'react-i18next';
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
import { Chain, RouteData } from '../../../lib/squid/types';
import { useRoutes } from '../../../lib/squid/hooks/useRoutes';
import { useSquid } from '../../../lib/squid/hooks/useSquid';
import { useTokens } from '../../../lib/squid/hooks/useTokens';
import { fetchChains } from '../../../lib/squid/functions/fetchChains';
import { fetchBalances } from '../../../lib/squid/functions/fetchBalances';
import { RiveStateMachineInput } from '../../../types/HandoverTypes';
import { SelectedRouteOption } from '../components/SelectedRouteOption/SelectedRouteOption';
import { convertToNetworkChangeableProvider } from '../../../functions/convertToNetworkChangeableProvider';
import { useExecute } from '../../../lib/squid/hooks/useExecute';
import { useSignOrder } from '../../../lib/hooks/useSignOrder';
import { OrderQuoteCurrency, SignPaymentTypes } from '../../../lib/primary-sales';
import { getRemoteRive } from '../../../lib/utils';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { APPROVE_TXN_ANIMATION, EXECUTE_TXN_ANIMATION, FIXED_HANDOVER_DURATION } from '../../../lib/squid/config';
import { verifyAndSwitchChain } from '../../../lib/squid/functions/verifyAndSwitchChain';
import { UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { sendPurchaseCloseEvent, sendPurchaseSuccessEvent } from '../PurchaseWidgetEvents';
import { getRouteChains } from '../../../lib/squid/functions/getRouteChains';
import { useQuoteOrder } from '../../../lib/hooks/useQuoteOrder';
import { DirectCryptoPayData } from '../types';
import { findToken } from '../../../lib/squid/functions/findToken';
import { findBalance } from '../../../lib/squid/functions/findBalance';

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
  const { purchaseState: { items } } = useContext(PurchaseContext);

  const {
    fetchRoutes, getRoute, getFromAmountData, hasSufficientBalance,
  } = useRoutes();

  const { fetchOrderQuote, getSelectedCurrency } = useQuoteOrder({
    environment: checkout.config.environment,
    environmentId,
  });

  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showPayWithDrawer, setShowPayWithDrawer] = useState(false);
  const [showDeliverToDrawer, setShowDeliverToDrawer] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState<OrderQuoteCurrency | undefined>(undefined);
  const [selectedCurrencyAmount, setSelectedCurrencyAmount] = useState<number | undefined>(undefined);

  const [selectedRouteData, setSelectedRouteData] = useState<RouteData | undefined>(undefined);
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [isFundingNeeded, setIsFundingNeeded] = useState<boolean | undefined>(undefined);

  const [insufficientBalance, setInsufficientBalance] = useState(false);

  // TODO: Move to context
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [directCryptoPayRoutes, setDirectCryptoPayRoutes] = useState<DirectCryptoPayData[]>([]);
  // eslint-disable-next-line max-len
  const [selectedDirectCryptoPayRoute, setSelectedDirectCryptoPayRoute] = useState<DirectCryptoPayData | undefined>(undefined);
  const [chains, setChains] = useState<Chain[]>([]);
  const squid = useSquid(checkout);
  const tokens = useTokens(checkout);

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
    console.log('useExecute err', err);
  });

  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
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

  interface HandoverProps {
    animationPath: string;
    state: RiveStateMachineInput;
    headingText: string;
    subheadingText?: ReactNode;
    primaryButtonText?: string;
    onPrimaryButtonClick?: () => void;
    secondaryButtonText?: string;
    onSecondaryButtonClick?: () => void;
    duration?: number;
  }

  const showHandover = useCallback(
    ({
      animationPath,
      state,
      headingText,
      subheadingText,
      primaryButtonText,
      onPrimaryButtonClick,
      secondaryButtonText,
      onSecondaryButtonClick,
      duration,
    }: HandoverProps) => {
      addHandover({
        animationUrl: getRemoteRive(
          checkout?.config.environment,
          animationPath,
        ),
        inputValue: state,
        duration,
        children: (
          <HandoverContent
            headingText={headingText}
            subheadingText={subheadingText}
            primaryButtonText={primaryButtonText}
            onPrimaryButtonClick={onPrimaryButtonClick}
            secondaryButtonText={secondaryButtonText}
            onSecondaryButtonClick={onSecondaryButtonClick}
          />
        ),
      });
    },
    [addHandover, checkout],
  );

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
        console.log('balances', balances);
        const isSufficientBalance = hasSufficientBalance(
          balances,
          item.tokenAddress,
          ChainId.IMTBL_ZKEVM_MAINNET.toString(),
          item.price,
        );
        console.log('isSufficientBalance', isSufficientBalance);
        setIsFundingNeeded(!isSufficientBalance);

        if (isSufficientBalance) {
          const token = findToken(tokens, item.tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());
          const balance = findBalance(balances, item.tokenAddress, ChainId.IMTBL_ZKEVM_MAINNET.toString());
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
    if (!squid || !fromProvider) return;

    (async () => {
      const updatedChains = fetchChains(squid);
      const updatedBalances = await fetchBalances(squid, updatedChains, fromProvider);

      setChains(updatedChains);
      setBalances(updatedBalances);
    })();
  }, [squid, fromProvider]);

  useEffect(() => {
    if (!selectedRouteData && routes.length > 0) {
      setSelectedRouteData(routes[0]);
    }
  }, [routes]);

  useEffect(() => {
    if (!items || items.length === 0) return;

    (async () => {
      try {
        const quote = await fetchOrderQuote(items, toAddress);

        if (!quote) return;

        const quoteCurrency = getSelectedCurrency(quote);

        if (!quoteCurrency) return;

        setSelectedCurrency(quoteCurrency);
        setSelectedCurrencyAmount(quote.totalAmount[quoteCurrency.name].amount);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching order quote', error);
      }
    })();
  }, [items, toAddress]);

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

    const gasPrice = await provider.getGasPrice();

    const approveTxn = signResponse.transactions.find(
      (txn) => txn.methodCall.startsWith('approve'),
    );
    if (!approveTxn) return;
    const approveTxnResponse = await signer.sendTransaction({
      to: approveTxn.tokenAddress,
      data: approveTxn.rawData,
      gasPrice,
      gasLimit: approveTxn.gasEstimate,
    });
    await waitForReceipt(provider, approveTxnResponse.hash);

    const executeTxn = signResponse.transactions.find(
      (txn) => txn.methodCall.startsWith('execute'),
    );
    if (!executeTxn) return;
    const executeTxnResponse = await signer.sendTransaction({
      to: executeTxn.tokenAddress,
      data: executeTxn.rawData,
      gasPrice,
      gasLimit: executeTxn.gasEstimate,
    });
    const receipt = await waitForReceipt(provider, executeTxnResponse.hash);
    if (receipt?.status === 1) {
      showHandover({
        animationPath: EXECUTE_TXN_ANIMATION,
        state: RiveStateMachineInput.COMPLETED,
        headingText: 'Purchase complete',
        subheadingText: (
          <Trans
            i18nKey="Go to <explorerLink>Immutable zkEVM explorer</explorerLink> for transaction details"
            components={{
              explorerLink: (
                <Link
                  size="small"
                  rc={(
                    <a
                      target="_blank"
                      href={`https://explorer.immutable.com/tx/${executeTxnResponse.hash}`}
                      rel="noreferrer"
                    />
                )}
                />
              ),
            }}
          />
        ),
        primaryButtonText: 'Done',
        onPrimaryButtonClick: () => {
          sendPurchaseCloseEvent(eventTarget);
        },
      });
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

      showHandover({
        animationPath: APPROVE_TXN_ANIMATION,
        state: RiveStateMachineInput.START,
        headingText: 'Preparing order',
      });

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
        showHandover({
          animationPath: APPROVE_TXN_ANIMATION,
          state: RiveStateMachineInput.WAITING,
          headingText: 'Waiting for wallet approval for token access',
        });

        const approveTxnReceipt = await approve(fromProviderInfo, changeableProvider, route);

        if (!approveTxnReceipt) {
          return;
        }

        showHandover({
          animationPath: APPROVE_TXN_ANIMATION,
          state: RiveStateMachineInput.COMPLETED,
          headingText: 'Tokens ready for item purchase',
          duration: FIXED_HANDOVER_DURATION,
        });
      }

      showHandover({
        animationPath: EXECUTE_TXN_ANIMATION,
        state: RiveStateMachineInput.WAITING,
        headingText: 'Waiting for wallet approval for purchase',
      });

      const executeTxnReceipt = await execute(squid, fromProviderInfo, changeableProvider, route);

      // eslint-disable-next-line no-console
      console.log('executeTxnReceipt', executeTxnReceipt);

      if (!executeTxnReceipt) {
        return;
      }

      const fundingMethod = fromChain !== toChain ? 'squid' : 'direct';

      sendPurchaseSuccessEvent(eventTarget, executeTxnReceipt.transactionHash, fundingMethod);

      if (toChain === fromChain) {
        showHandover({
          animationPath: EXECUTE_TXN_ANIMATION,
          state: RiveStateMachineInput.COMPLETED,
          headingText: 'Purchase complete',
          subheadingText: (
            <Trans
              i18nKey="Go to <explorerLink>Immutable zkEVM explorer</explorerLink> for transaction details"
              components={{
                explorerLink: (
                  <Link
                    size="small"
                    rc={(
                      <a
                        target="_blank"
                        href={`https://explorer.immutable.com/tx/${executeTxnReceipt.transactionHash}`}
                        rel="noreferrer"
                      />
                  )}
                  />
                ),
              }}
            />
          ),
          primaryButtonText: 'Done',
          onPrimaryButtonClick: () => {
            sendPurchaseCloseEvent(eventTarget);
          },
        });
        return;
      }

      showHandover({
        animationPath: EXECUTE_TXN_ANIMATION,
        state: RiveStateMachineInput.PROCESSING,
        headingText: 'Processing purchase',
      });

      const status = await getStatus(squid, executeTxnReceipt.transactionHash);
      const axelarscanUrl = `https://axelarscan.io/gmp/${executeTxnReceipt?.transactionHash}`;

      // eslint-disable-next-line no-console
      console.log('status', status);
      // eslint-disable-next-line no-console
      console.log('axelarscanUrl', axelarscanUrl);

      if (status?.squidTransactionStatus === 'success') {
        showHandover({
          animationPath: EXECUTE_TXN_ANIMATION,
          state: RiveStateMachineInput.COMPLETED,
          headingText: 'Purchase complete',
          subheadingText: (
            <Trans
              i18nKey="Go to <axelarscanLink>Axelarscan</axelarscanLink> for transaction details"
              components={{
                axelarscanLink: (
                  <Link
                    size="small"
                    rc={(
                      <a
                        target="_blank"
                        href={axelarscanUrl}
                        rel="noreferrer"
                      />
                  )}
                  />
                ),
              }}
            />
          ),
          primaryButtonText: 'Done',
          onPrimaryButtonClick: () => {
            sendPurchaseCloseEvent(eventTarget);
          },
        });
      } else {
        showHandover({
          animationPath: APPROVE_TXN_ANIMATION,
          state: RiveStateMachineInput.COMPLETED,
          headingText: 'Unable to complete purchase',
          subheadingText: (
            <Trans
            // eslint-disable-next-line max-len
              i18nKey="Something went wrong, and we were unable to complete this transaction. Visit <axelarscanLink>Axelarscan</axelarscanLink> for details."
              components={{
                axelarscanLink: (
                  <Link
                    size="small"
                    rc={(
                      <a
                        target="_blank"
                        href={axelarscanUrl}
                        rel="noreferrer"
                      />
                  )}
                  />
                ),
              }}
            />
          ),
          secondaryButtonText: 'Dismiss',
          onSecondaryButtonClick: () => {
            sendPurchaseCloseEvent(eventTarget);
          },
        });
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
          {items && items.length > 0 && (
            <>
              <PurchaseItemHero items={items} totalQty={totalQty} />

              <Caption weight="bold">
                {items[0].name}
              </Caption>

              {selectedCurrency && selectedCurrencyAmount && (
                <Caption>
                  {selectedCurrency.name}
                  {' '}
                  {selectedCurrencyAmount}
                </Caption>
              )}
            </>
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
