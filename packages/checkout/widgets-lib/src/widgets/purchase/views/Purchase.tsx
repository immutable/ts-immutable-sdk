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
import { useTranslation } from 'react-i18next';
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
import { RouteData } from '../../../lib/squid/types';

const mockRouteData = {
  amountData: {
    fromToken: {
      chainId: '13371',
      address: '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
      decimals: 6,
      symbol: 'USDC',
      name: 'USDC',
      usdPrice: 1.0000063864021391,
      iconUrl: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/usdc.svg',
    },
    fromAmount: '12.585542887809128',
    toToken: {
      chainId: '13371',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      decimals: 18,
      symbol: 'IMX',
      name: 'IMX',
      usdPrice: 1.239962883167207,
      iconUrl: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
    },
    toAmount: '10',
    balance: {
      balance: '18667677',
      symbol: 'USDC',
      address: '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
      decimals: 6,
      chainId: '13371',
    },
    additionalBuffer: 0,
  },
  route: {
    route: {
      estimate: {
        actions: [
          {
            type: 'swap',
            chainType: 'evm',
            data: {
              address: '0x5f5664979ed0f8124e9910f9476b12304ed85e61',
              chainId: '13371',
              coinAddresses: [
                '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
                '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
              ],
              dex: 'Quickswap V3',
              enabled: true,
              path: [
                '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
                '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              ],
              slippage: 0.003,
              aggregateSlippage: 0.003,
              target: '0x6c28AeF8977c9B773996d0e8376d2EE379446F2f',
            },
            fromChain: '13371',
            toChain: '13371',
            fromToken: {
              id: '13371_0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
              symbol: 'USDC',
              address: '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
              chainId: '13371',
              name: 'USDC',
              decimals: 6,
              usdPrice: 1.0000063864021391,
              coingeckoId: 'usd-coin',
              type: 'evm',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/usdc.svg',
              axelarNetworkSymbol: 'USDC',
              subGraphIds: [
                'immutable-usdc',
                'immutable-USDC-USDC',
              ],
              enabled: true,
              subGraphOnly: false,
              active: true,
            },
            toToken: {
              id: '13371_0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              symbol: 'WIMX',
              address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              chainId: '13371',
              name: 'Wrapped IMX',
              decimals: 18,
              usdPrice: 1.239962883167207,
              coingeckoId: 'immutable-x',
              type: 'evm',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
              axelarNetworkSymbol: 'WIMX',
              subGraphIds: [
                'immutable-wimx',
              ],
              enabled: true,
              subGraphOnly: false,
              active: true,
            },
            aggregatedVolatility: 2,
            fromAmount: '12585543',
            toAmount: '10132852924972077320',
            toAmountMin: '10102454366197161088',
            exchangeRate: '0.805118454163803446',
            priceImpact: '0.0004043410857945',
            stage: 3,
            provider: 'Quickswap V3',
            logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/providers/quickswap.svg',
            description: 'Swap USDC to WIMX',
          },
          {
            type: 'wrap',
            chainType: 'evm',
            data: {
              address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              chainId: '13371',
              enabled: true,
              type: 'WrappedNative',
              path: [
                '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
                '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              ],
              id: '13371_0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              name: 'Native Wrapper',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/master/providers/squid-purple.svg',
              properties: {
                address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
                coinAddresses: [
                  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                  '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
                ],
                type: 'WrappedNative',
              },
              target: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              direction: 'unwrap',
            },
            fromChain: '13371',
            toChain: '13371',
            fromToken: {
              id: '13371_0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              symbol: 'WIMX',
              address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
              chainId: '13371',
              name: 'Wrapped IMX',
              decimals: 18,
              usdPrice: 1.239962883167207,
              coingeckoId: 'immutable-x',
              type: 'evm',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
              axelarNetworkSymbol: 'WIMX',
              subGraphIds: [
                'immutable-wimx',
              ],
              enabled: true,
              subGraphOnly: false,
              active: true,
            },
            toToken: {
              id: '13371_0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              symbol: 'IMX',
              address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              chainId: '13371',
              name: 'IMX',
              decimals: 18,
              usdPrice: 1.239962883167207,
              coingeckoId: 'immutable-x',
              type: 'evm',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
              axelarNetworkSymbol: 'IMX',
              subGraphIds: [
                'immutable-imx',
              ],
              enabled: true,
              subGraphOnly: false,
              active: true,
            },
            aggregatedVolatility: 4,
            fromAmount: '10132852924972077320',
            toAmount: '10132852924972077320',
            toAmountMin: '10102454366197161088',
            exchangeRate: '1.0',
            priceImpact: '0.00',
            stage: 3,
            provider: 'Native Wrapper',
            logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/master/providers/squid-purple.svg',
            description: 'Unwrap WIMX to IMX',
          },
        ],
        fromAmount: '12585543',
        toAmount: '10132852924972077320',
        toAmountMin: '10102454366197161088',
        exchangeRate: '0.805118454163803446',
        aggregatePriceImpact: '0.0',
        fromAmountUSD: '12.58',
        toAmountUSD: '12.56',
        toAmountMinUSD: '12.52',
        aggregateSlippage: 0.3,
        fromToken: {
          id: '13371_0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
          symbol: 'USDC',
          address: '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
          chainId: '13371',
          name: 'USDC',
          decimals: 6,
          usdPrice: 1.0000063864021391,
          coingeckoId: 'usd-coin',
          type: 'evm',
          logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/usdc.svg',
          volatility: 0,
          axelarNetworkSymbol: 'USDC',
          subGraphIds: [
            'immutable-usdc',
            'immutable-USDC-USDC',
          ],
          enabled: true,
          subGraphOnly: false,
          active: true,
        },
        toToken: {
          id: '13371_0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'IMX',
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          chainId: '13371',
          name: 'IMX',
          decimals: 18,
          usdPrice: 1.239962883167207,
          coingeckoId: 'immutable-x',
          type: 'evm',
          logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
          volatility: 2,
          axelarNetworkSymbol: 'IMX',
          subGraphIds: [
            'immutable-imx',
          ],
          enabled: true,
          subGraphOnly: false,
          active: true,
        },
        isBoostSupported: false,
        gasCosts: [
          {
            type: 'executeCall',
            token: {
              id: '13371_0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              symbol: 'IMX',
              address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              chainId: '13371',
              name: 'IMX',
              decimals: 18,
              usdPrice: 1.239962883167207,
              coingeckoId: 'immutable-x',
              type: 'evm',
              logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/imx.svg',
              volatility: 2,
              axelarNetworkSymbol: 'IMX',
              subGraphIds: [
                'immutable-imx',
              ],
              enabled: true,
              subGraphOnly: false,
              active: true,
            },
            amount: '6884900031295000',
            gasLimit: '625900',
            amountUsd: '0.01',
          },
        ],
        feeCosts: [],
        estimatedRouteDuration: 1,
      },
      transactionRequest: {},
      params: {
        fromChain: '13371',
        fromToken: '0x6de8acc0d406837030ce4dd28e7c08c5a96a30d2',
        fromAmount: '12585543',
        toChain: '13371',
        toToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        toAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        quoteOnly: true,
        enableBoost: true,
        receiveGasOnDestination: true,
      },
    },
  },
  isInsufficientGas: false,
} as RouteData;

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

  const { t } = useTranslation();

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
              label={t('views.PURCHASE.walletSelection.from.label')}
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
                routeData={mockRouteData} // TODO
                chains={chains}
                onClick={() => setShowOptionsDrawer(true)}
                insufficientBalance={false} // TODO
                showOnrampOption
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
