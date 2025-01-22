import {
  ButtCon,
  Button,
  Stack,
} from '@biom3/react';
import {
  Checkout, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { RouteOptionsDrawer } from '../../../components/RouteOptionsDrawer/RouteOptionsDrawer';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import { PurchaseDeliverToWalletDrawer } from '../components/PurchaseDeliverToWalletDrawer';
import { PurchaseItemHero } from '../components/PurchaseItemHero';
import { PurchasePayWithWalletDrawer } from '../components/PurchasePayWithWalletDrawer';
import { PurchaseSelectedRouteOption } from '../components/PurchaseSelectedRouteOption';
import { PurchaseSelectedWallet } from '../components/PurchaseSelectedWallet';
import { PurchaseContext } from '../context/PurchaseContext';
import { CryptoFiatContext, CryptoFiatActions } from '../../../context/crypto-fiat-context/CryptoFiatContext';

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

  const {
    purchaseState: {
      items, selectedToken, chains, quote,
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

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log({
      checkout,
      environmentId,
    });
  }, [checkout, environmentId]);

  useEffect(() => {
    if (!quote) return;
    // eslint-disable-next-line no-console
    console.log('Order quote fetched', {
      quote,
    });

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

  const handleRouteClick = () => {
    setShowOptionsDrawer(false);
    setShowPayWithWalletDrawer(false);
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
            {!fromProviderInfo && (
            <PurchaseSelectedWallet
              label="Pay with"
              caption=""
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithWalletDrawer(true);
              }}
            />
            )}

            {fromAddress && (
              <PurchaseSelectedRouteOption
                checkout={checkout}
                routeData={undefined} // TODO
                chains={chains}
                onClick={() => setShowOptionsDrawer(true)}
                insufficientBalance={false} // TODO
                showOnrampOption
              />
            )}

            <PurchaseSelectedWallet
              label="Deliver to"
              caption=""
              size={toProviderInfo ? 'xSmall' : 'small'}
              providerInfo={{
                ...toProviderInfo,
                address: toAddress,
              }}
              onClick={() => setShowDeliverToWalletDrawer(true)}
              disabled={lockedToProvider}
            />
          </Stack>
          <RouteOptionsDrawer
            checkout={checkout}
            routes={[]}
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onCardClick={() => undefined}
            onRouteClick={handleRouteClick}
          />
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

      <PurchasePayWithWalletDrawer
        visible={showPayWithWalletDrawer}
        walletOptions={walletOptions}
        onClose={() => setShowPayWithWalletDrawer(false)}
        onPayWithCard={() => undefined}
        onConnect={() => undefined}
      />
      <PurchaseDeliverToWalletDrawer
        visible={showDeliverToWalletDrawer}
        walletOptions={walletOptions}
        onClose={handleDeliverToWalletClose}
        onConnect={() => undefined}
      />
    </SimpleLayout>
  );
}
