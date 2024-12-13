import {
  Body,
  Box,
  HorizontalMenu,
} from '@biom3/react';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  ChainId,
  CheckoutErrorType,
  NetworkFilterTypes,
  NetworkInfo,
  SwitchNetworkParams,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { WalletContext } from '../../context/WalletContext';
import { sendNetworkSwitchEvent } from '../../WalletWidgetEvents';
import {
  activeNetworkButtonStyle,
  logoStyle,
  networkButtonStyle,
  networkHeadingStyle,
  networkMenuStyles,
} from './NetworkMenuStyles';
import { getChainImage, sortNetworksCompareFn } from '../../../../lib/utils';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../../context/view-context/ViewContext';
import {
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

export function NetworkMenu() {
  const { t } = useTranslation();
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { checkout, provider } = connectLoaderState;
  const { viewDispatch } = useContext(ViewContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { network } = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[] | undefined>(
    [],
  );
  const { track } = useAnalytics();

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!checkout || !provider || !network || Number(network.chainId) === chainId) return;
      track({
        userJourney: UserJourney.WALLET,
        screen: 'WalletBalances',
        control: 'SwitchNetwork',
        controlType: 'Button',
        extras: {
          chainId,
        },
      });

      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider,
          chainId,
        } as SwitchNetworkParams);

        sendNetworkSwitchEvent(eventTarget, switchNetworkResult.provider, switchNetworkResult.network);
      } catch (err: any) {
        if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          // ignore error
        } else {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: SharedViews.ERROR_VIEW, error: err },
            },
          });
        }
      }
    },
    [checkout, provider, network, walletDispatch, viewDispatch],
  );

  useEffect(() => {
    (async () => {
      if (checkout) {
        const allowedNetworksResponse = await checkout.getNetworkAllowList({
          type: NetworkFilterTypes.ALL,
        });
        setNetworks(allowedNetworksResponse?.networks ?? []);
      } else {
        setNetworks([]);
      }
    })();
  }, [checkout]);

  return (
    <Box testId="network-menu" sx={networkMenuStyles}>
      <Body testId="network-heading" size="medium" sx={networkHeadingStyle}>
        {t('views.WALLET_BALANCES.networkStatus.heading')}
      </Body>
      <HorizontalMenu>
        {checkout
          && allowedNetworks
            ?.sort((a: NetworkInfo, b: NetworkInfo) => sortNetworksCompareFn(a, b, checkout.config))
            .map((networkItem) => (
              <HorizontalMenu.Button
                key={networkItem.chainId}
                testId={`${networkItem.name}-network-button`}
                sx={
                  networkItem.chainId === network?.chainId
                    ? activeNetworkButtonStyle
                    : networkButtonStyle
                }
                size="small"
                onClick={() => switchNetwork(Number(networkItem.chainId))}
              >
                <HorizontalMenu.Button.FramedImage
                  sx={logoStyle(networkItem.chainId === network?.chainId)}
                  use={(
                    <img
                      src={getChainImage(checkout?.config.environment, Number(networkItem.chainId))}
                      alt={networkItem.name}
                    />
                  )}
                />
                {networkItem.name}
              </HorizontalMenu.Button>
            ))}
      </HorizontalMenu>
    </Box>
  );
}
