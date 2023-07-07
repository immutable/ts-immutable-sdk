import {
  Body, Box, Button, HorizontalMenu,
} from '@biom3/react';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  ChainId,
  NetworkFilterTypes,
  NetworkInfo,
  SwitchNetworkParams,
} from '@imtbl/checkout-sdk';
import { WalletActions, WalletContext } from '../../context/WalletContext';
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

const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

// todo: add corresponding network symbols
const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};

export interface NetworkMenuProps {
  setBalancesLoading: (loading: boolean) => void;
}

export function NetworkMenu({ setBalancesLoading }: NetworkMenuProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { networkStatus } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { checkout, network, provider } = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[] | undefined>(
    [],
  );

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!checkout || !provider || !network || network.chainId === chainId) return;
      setBalancesLoading(true);
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider,
          chainId,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult.provider,
          },
        });

        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK,
            network: switchNetworkResult.network,
          },
        });

        sendNetworkSwitchEvent(switchNetworkResult.provider, switchNetworkResult.network);
      } catch (err: any) {
        setBalancesLoading(false);
        if (err.type === 'USER_REJECTED_REQUEST_ERROR') {
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
    <Box sx={networkMenuStyles}>
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
