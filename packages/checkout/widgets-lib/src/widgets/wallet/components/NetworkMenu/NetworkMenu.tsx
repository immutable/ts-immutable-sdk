import {
  Body, Box, Button, HorizontalMenu,
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
import { logoColour, networkIcon } from 'lib';
import { WalletContext } from '../../context/WalletContext';
import { text } from '../../../../resources/text/textConfig';
import { sendNetworkSwitchEvent } from '../../WalletWidgetEvents';
import {
  activeNetworkButtonStyle,
  logoStyle,
  networkButtonStyle,
  networkHeadingStyle,
  networkMenuStyles,
} from './NetworkMenuStyles';
import { sortNetworksCompareFn } from '../../../../lib/utils';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';
import {
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface NetworkMenuProps {
  setBalancesLoading: (loading: boolean) => void;
}

export function NetworkMenu({ setBalancesLoading }: NetworkMenuProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { checkout, provider } = connectLoaderState;
  const { viewDispatch } = useContext(ViewContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { networkStatus } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { network } = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[] | undefined>(
    [],
  );
  const { track } = useAnalytics();

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!checkout || !provider || !network || network.chainId === chainId) return;
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
        setBalancesLoading(true);

        const switchNetworkResult = await checkout.switchNetwork({
          provider,
          chainId,
        } as SwitchNetworkParams);

        sendNetworkSwitchEvent(eventTarget, switchNetworkResult.provider, switchNetworkResult.network);
      } catch (err: any) {
        setBalancesLoading(false);
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
        {networkStatus.heading}
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
                onClick={() => switchNetwork(networkItem.chainId)}
              >
                <Button.Icon
                  icon={networkIcon[networkItem.chainId]}
                  iconVariant="bold"
                  sx={logoStyle(
                    logoColour[networkItem.chainId],
                    networkItem.chainId === network?.chainId,
                  )}
                />
                {networkItem.name}
              </HorizontalMenu.Button>
            ))}
      </HorizontalMenu>
    </Box>
  );
}
