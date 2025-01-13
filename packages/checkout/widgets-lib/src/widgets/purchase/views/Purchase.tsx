import {
  ButtCon, Button, MenuItem, Stack,
} from '@biom3/react';
import {
  ChainId, Checkout, EIP6963ProviderInfo, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { ChainType } from '@0xsquid/squid-types';
import { Environment } from '@imtbl/config';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { useContext } from 'react';
import { Stack, ButtCon } from '@biom3/react';
import { PurchaseItem } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PurchaseContext } from '../context/PurchaseContext';
import { PurchaseItemHero } from '../components/PurchaseItemHero';
import { DeliverToWalletDrawer } from '../../../components/WalletDrawer/DeliverToWalletDrawer';
import { SelectedWallet } from '../../../components/SelectedWallet/SelectedWallet';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import { RouteOptionsDrawer } from '../../../components/RouteOptionsDrawer/RouteOptionsDrawer';
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
import { SelectedRouteOption } from '../../../components/SelectedRouteOption/SelectedRouteOption';
import { convertToNetworkChangeableProvider } from '../../../functions/convertToNetworkChangeableProvider';
import { useExecute } from '../../../lib/squid/hooks/useExecute';
import { useSignOrder } from '../../../lib/hooks/useSignOrder';
import { SignPaymentTypes } from '../../../lib/primary-sales';

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

  const shouldShowBackButton = showBackButton && onBackButtonClick;
  const shouldShowOnRampOption = false;
  const showSwapOption = true;
  const showBridgeOption = true;

  const { signWithPostHooks } = useSignOrder({
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

  const handleProceedClick = useCallback(async () => {
    // eslint-disable-next-line max-len
    if (!squid || !tokens || !toAddress || !selectedRouteData || !fromAddress || !fromProvider || !fromProviderInfo) return;

    const { signResponse, postHooks } = await signWithPostHooks(
      SignPaymentTypes.CRYPTO,
      item.tokenAddress,
      squidMulticallAddress,
      toAddress,
    );

    console.log('signResponse', signResponse);
    console.log('postHooks', postHooks);

    const updatedAmountData = getAmountData(
      tokens,
      selectedRouteData.amountData.balance,
      item.price,
      ChainId.IMTBL_ZKEVM_MAINNET.toString(),
      item.tokenAddress,
      selectedRouteData.amountData.additionalBuffer,
    );
    if (!updatedAmountData) return;

    const route = (await getRoute(
      squid,
      updatedAmountData?.fromToken,
      updatedAmountData?.toToken,
      toAddress,
      updatedAmountData.fromAmount,
      updatedAmountData.toAmount,
      fromAddress,
      false,
      {
        chainType: ChainType.EVM,
        calls: postHooks,
        provider: 'Immutable Primary Sales',
        description: 'Perform Primary Sales NFT checkout',
        logoURI: 'https://explorer.immutable.com/assets/configs/network_icon.svg',
      },
    ))?.route;

    if (!route) return;

    const currentFromAddress = await fromProvider.getSigner().getAddress();

    if (currentFromAddress !== fromAddress) {
      return;
    }

    const changeableProvider = await convertToNetworkChangeableProvider(
      fromProvider,
    );

    const isValidNetwork = await checkProviderChain(
      changeableProvider,
      route.route.params.fromChain,
    );

    if (!isValidNetwork) {
      return;
    }

    const allowance = await getAllowance(changeableProvider, route);
    const { fromAmount } = route.route.params;

    console.log('allowance', allowance);

    if (!allowance || allowance?.lt(fromAmount)) {
      const approveTxnReceipt = await approve(fromProviderInfo, changeableProvider, route);

      if (!approveTxnReceipt) {
        return;
      }
    }

    const executeTxnReceipt = await execute(squid, fromProviderInfo, changeableProvider, route);

    console.log('executeTxnReceipt', executeTxnReceipt);

    if (!executeTxnReceipt) {
      return;
    }

    const status = await getStatus(squid, executeTxnReceipt.transactionHash);
    const axelarscanUrl = `https://axelarscan.io/gmp/${executeTxnReceipt?.transactionHash}`;

    console.log('status', status);
    console.log('axelarscanUrl', axelarscanUrl);

    console.log('proceed finished');
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

  const loading = (!!fromAddress || fetchingRoutes)
    && !(selectedRouteData || insufficientBalance);

  const readyToProceed = !!fromAddress
    && !!toAddress
    && !!selectedRouteData
    && !selectedRouteData.isInsufficientGas
    && !loading;

  const totalQty = items?.reduce((sum, item: PurchaseItem) => sum + item.qty, 0) || 0;

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

          <p>
            <strong>{item.name}</strong>
          </p>
          <p>
            {item.token}
            {' '}
            {item.price}
          </p>
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
                  routeData={selectedRouteData}
                  onClick={() => setShowOptionsDrawer(true)}
                  withSelectedWallet={!!fromAddress}
                  insufficientBalance={insufficientBalance}
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
            showOnrampOption={shouldShowOnRampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onCardClick={() => false}
            onRouteClick={handleRouteClick}
            insufficientBalance={insufficientBalance}
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
