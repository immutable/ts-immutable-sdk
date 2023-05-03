import { Body, Box, Button, HorizontalMenu, Icon } from '@biom3/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { WalletActions, WalletContext } from '../../context/WalletContext';
import {
  ChainId,
  NetworkFilterTypes,
  NetworkInfo,
  SwitchNetworkParams,
} from '@imtbl/checkout-sdk-web';
import { text } from '../../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../../context/WalletViewContextTypes';
import { sendNetworkSwitchEvent } from '../../WalletWidgetEvents';
import {
  ActiveNetworkButtonStyle,
  NetworkHeadingStyle,
  NetworkMenuStyles,
} from './NetworkMenuStyles';
import {
  BaseViews,
  ViewActions,
  ViewContext,
} from '../../../../context/ViewContext';
import { getTokenBalances } from '../../functions/tokenBalances';

export const NetworkMenu = () => {
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { viewDispatch } = useContext(ViewContext);

  const { networkStatus } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { checkout, network, provider } = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[] | undefined>(
    []
  );

  //todo: add corresponding network symbols
  const NetworkLogo = {
    [ChainId.POLYGON]: 'ImmutableSymbol',
    [ChainId.ETHEREUM]: 'ImmutableSymbol',
    [ChainId.GOERLI]: 'ImmutableSymbol',
  };

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!checkout || !provider || !network || network.chainId === chainId)
        return;
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider,
          chainId,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult?.provider,
          },
        });

        walletDispatch({
          payload: {
            type: WalletActions.SWITCH_NETWORK,
            network: switchNetworkResult.network,
            tokenBalances: await getTokenBalances(
              checkout,
              switchNetworkResult?.provider,
              switchNetworkResult.network.name,
              switchNetworkResult.network.chainId
            ),
          },
        });

        sendNetworkSwitchEvent(switchNetworkResult.network);
      } catch (err: any) {
        if (err.type === 'USER_REJECTED_REQUEST_ERROR') {
          //ignore error
        } else {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: { type: BaseViews.ERROR, error: err },
            },
          });
        }
      }
    },
    [checkout, provider, network, walletDispatch, viewDispatch]
  );

  useEffect(() => {
    (async () => {
      if (checkout) {
        const allowedNetworks = await checkout.getNetworkAllowList({
          type: NetworkFilterTypes.ALL,
        });
        setNetworks(allowedNetworks?.networks);
      } else {
        setNetworks([]);
      }
    })();
  }, [checkout]);

  return (
    <Box sx={NetworkMenuStyles}>
      <Box sx={NetworkHeadingStyle}>
        <Body testId="network-heading" size="medium">
          {networkStatus.heading}
        </Body>
        <Icon
          testId="network-icon"
          icon="InformationCircle"
          sx={{ width: 'base.icon.size.100' }}
        />
      </Box>
      <HorizontalMenu>
        {allowedNetworks?.map((networkItem) => (
          <HorizontalMenu.Button
            key={networkItem.chainId}
            testId={`${networkItem.name}-network-button`}
            sx={
              networkItem.chainId === network?.chainId
                ? ActiveNetworkButtonStyle
                : {}
            }
            size="medium"
            onClick={() => switchNetwork(networkItem.chainId)}
          >
            <Button.Logo
              logo={NetworkLogo[networkItem.chainId]}
              sx={{ paddingRight: 'base.spacing.x1', width: '22px' }}
            />
            {networkItem.name}
          </HorizontalMenu.Button>
        ))}
      </HorizontalMenu>
    </Box>
  );
};
