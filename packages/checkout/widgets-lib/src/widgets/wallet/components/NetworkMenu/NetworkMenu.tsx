import { Body, Box, Button, HorizontalMenu, Icon } from '@biom3/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { WalletActions, WalletContext } from '../../context/WalletContext';
import {
  ChainId,
  NetworkFilterTypes,
  NetworkInfo,
  SwitchNetworkParams,
} from '@imtbl/checkout-sdk';
import { text } from '../../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../../context/WalletViewContextTypes';
import { sendNetworkSwitchEvent } from '../../WalletWidgetEvents';
import {
  ActiveNetworkButtonStyle,
  LogoStyle,
  NetworkButtonStyle,
  NetworkHeadingStyle,
  NetworkMenuStyles,
} from './NetworkMenuStyles';
import {
  BaseViews,
  ViewActions,
  ViewContext,
} from '../../../../context/ViewContext';
import { sortNetworksCompareFn } from '../../../../lib/utils';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';

export const NetworkMenu = () => {
  const { viewDispatch } = useContext(ViewContext);
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const { cryptoFiat } = cryptoFiatState;
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { networkStatus } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { checkout, network, provider } = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[] | undefined>(
    []
  );
  const LogoColor = {
    [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
    [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
    [ChainId.ETHEREUM]: 'base.color.accent.5',
    [ChainId.SEPOLIA]: 'base.color.accent.5',
  };

  //todo: add corresponding network symbols
  const NetworkIcon = {
    [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
    [ChainId.ETHEREUM]: 'EthToken',
    [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
    [ChainId.SEPOLIA]: 'EthToken',
  };

  const switchNetwork = useCallback(
    async (chainId: ChainId) => {
      if (
        !checkout ||
        !provider ||
        !network ||
        network.chainId === chainId ||
        !cryptoFiat
      )
        return;
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult?.provider,
          },
        });

        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK,
            network: switchNetworkResult.network,
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
    [checkout, provider, network, walletDispatch, viewDispatch, cryptoFiat]
  );

  useEffect(() => {
    (async () => {
      if (checkout) {
        const allowedNetworks = await checkout.getNetworkAllowList({
          type: NetworkFilterTypes.ALL,
        });
        setNetworks(allowedNetworks?.networks ?? []);
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
        {checkout &&
          allowedNetworks
            ?.sort((a: NetworkInfo, b: NetworkInfo) =>
              sortNetworksCompareFn(a, b, checkout.config.environment)
            )
            .map((networkItem) => (
              <HorizontalMenu.Button
                key={networkItem.chainId}
                testId={`${networkItem.name}-network-button`}
                sx={
                  networkItem.chainId === network?.chainId
                    ? ActiveNetworkButtonStyle
                    : NetworkButtonStyle
                }
                size="small"
                onClick={() => switchNetwork(networkItem.chainId)}
              >
                <Button.Icon
                  icon={NetworkIcon[networkItem.chainId]}
                  iconVariant="bold"
                  sx={LogoStyle(
                    LogoColor[networkItem.chainId],
                    networkItem.chainId === network?.chainId
                  )}
                />
                {networkItem.name}
              </HorizontalMenu.Button>
            ))}
      </HorizontalMenu>
    </Box>
  );
};
