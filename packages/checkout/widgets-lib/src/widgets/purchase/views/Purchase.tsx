import { useContext, useMemo, useState } from 'react';
import {
  Stack, ButtCon, MenuItem,
  Button,
} from '@biom3/react';
import {
  ChainId, Checkout, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { PurchaseContext } from '../context/PurchaseContext';
import { PurchaseItemHero } from '../components/PurchaseItemHero';
import { PayWithWalletDrawer } from '../../../components/WalletDrawer/PayWithWalletDrawer';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { SelectedWallet } from '../../../components/SelectedWallet/SelectedWallet';
import { SelectedRouteOption } from '../../../components/SelectedRouteOption/SelectedRouteOption';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { DeliverToWalletDrawer } from '../../../components/WalletDrawer/DeliverToWalletDrawer';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';

interface PurchaseProps {
  checkout: Checkout;
  showBackButton?: boolean;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export function Purchase({
  checkout,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: PurchaseProps) {
  const [showPayWithWalletDrawer, setShowPayWithWalletDrawer] = useState(false);
  const [showDeliverToWalletDrawer, setShowDeliverToWalletDrawer] = useState(false);

  const {
    purchaseState: {
      items, selectedToken, chains, selectedRouteData,
    },
  } = useContext(PurchaseContext);
  const { providers } = useInjectedProviders({ checkout });
  const {
    providersState: {
      fromProviderInfo,
      toProviderInfo,
      fromAddress,
      toAddress,
      lockedToProvider,
    },
  } = useProvidersContext();

  const shouldShowBackButton = showBackButton && onBackButtonClick;

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

  const toChain = useMemo(
    () => chains?.find((chain) => chain.id === ChainId.IMTBL_ZKEVM_MAINNET.toString()),
    [chains],
  );

  const getChainInfo = () => {
    if (toChain) {
      return {
        iconUrl: toChain.iconUrl,
        name: toChain.name,
      };
    }
    return undefined;
  };

  const handleDeliverToWalletClose = () => {
    setShowDeliverToWalletDrawer(false);
  };

  const readyToPay = !!selectedToken && !!fromAddress && !!toAddress;

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
            <SelectedWallet
              label="Pay with"
              caption=""
              providerInfo={{
                ...fromProviderInfo,
                address: fromAddress,
              }}
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithWalletDrawer(true);
              }}
            >
              {selectedToken && fromAddress && (
              <>
                <MenuItem.BottomSlot.Divider
                  sx={fromAddress ? { ml: 'base.spacing.x4' } : undefined}
                />
                <SelectedRouteOption
                  checkout={checkout}
                  chains={chains}
                  routeData={selectedRouteData}
                  onClick={() => undefined}
                  withSelectedWallet={!!fromAddress}
                  insufficientBalance={false}
                  showOnrampOption
                />
              </>
              )}

            </SelectedWallet>

            <SelectedWallet
              label="Deliever to"
              caption=""
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              chainInfo={getChainInfo()}
              onClick={() => setShowDeliverToWalletDrawer(true)}
              disabled={lockedToProvider}
            />
          </Stack>
          <Button
            testId="add-tokens-button"
            size="large"
            variant={readyToPay ? 'primary' : 'secondary'}
            disabled={!readyToPay}
            onClick={() => undefined}
            sx={{ opacity: readyToPay ? 1 : 0.5 }}
          >
            Pay
          </Button>

          <SquidFooter />

        </Stack>
      </Stack>
      <PayWithWalletDrawer
        visible={showPayWithWalletDrawer}
        walletOptions={walletOptions}
        onClose={() => setShowPayWithWalletDrawer(false)}
        onPayWithCard={() => undefined}
        onConnect={() => undefined}
      />
      <DeliverToWalletDrawer
        visible={showDeliverToWalletDrawer}
        walletOptions={walletOptions}
        onClose={handleDeliverToWalletClose}
        onConnect={() => undefined}
      />
    </SimpleLayout>
  );
}
