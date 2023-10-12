import {
  Body, Box, HorizontalMenu,
} from '@biom3/react';
import {
  Fragment,
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
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
} from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { ButtonGroup, Button, Card } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SvgIconImmutable from "../../../../theme/icons/imx";
import SvgIconChain from "../../../../theme/icons/chain";

const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

// todo: add corresponding network symbols
const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: <SvgIconImmutable sx={{ fill: 'rgb(241, 145, 250)' }} />,
  [ChainId.IMTBL_ZKEVM_MAINNET]: <SvgIconImmutable sx={{ fill: 'rgb(241, 145, 250)' }} />,
  [ChainId.IMTBL_ZKEVM_TESTNET]: <SvgIconImmutable sx={{ fill: 'rgb(241, 145, 250)' }} />,
  [ChainId.ETHEREUM]: <SvgIconChain sx={{ fill: 'rgb(182, 182, 182)' }} />,
  [ChainId.SEPOLIA]: <SvgIconChain sx={{ fill: 'rgb(182, 182, 182)' }} />,
};

export interface NetworkMenuProps {
  setBalancesLoading: (loading: boolean) => void;
}

export function NetworkMenu({ setBalancesLoading }: NetworkMenuProps) {
  const { connectLoaderState, connectLoaderDispatch } = useContext(ConnectLoaderContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { checkout, provider } = connectLoaderState;
  const { viewDispatch } = useContext(ViewContext);
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { networkStatus } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { network } = walletState;
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
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: switchNetworkResult.provider,
          },
        });

        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK,
            network: switchNetworkResult.network,
          },
        });

        sendNetworkSwitchEvent(eventTarget, switchNetworkResult.provider, switchNetworkResult.network);
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
    <Box testId="network-menu" sx={networkMenuStyles}>
      <Body testId="network-heading" size="medium" sx={networkHeadingStyle}>
        {networkStatus.heading}
      </Body>
      <Box sx={{
        justifyContent: "stretch",
        background: "rgba(243, 243, 243, 0.08)",
        position: "relative",
        overflowY: "auto",
        display: "flex",
        width: "100%",
        gap: "4px",
        padding: "8px",
        borderRadius: "16px",
      }}>
        {checkout && allowedNetworks?.sort((a: NetworkInfo, b: NetworkInfo) => sortNetworksCompareFn(a, b, checkout.config))
          .map(networkItem => (
            <Fragment key={networkItem.name}>
              <Button variant="outlined" fullWidth size='small' color='inherit' startIcon={networkIcon[networkItem.chainId]}
              sx={{
              ...(networkItem.chainId === network?.chainId? {

                  fontWeight: '700',
                  borderColor: 'rgb(243, 243, 243)',
                  borderStyle: 'solid',
                  borderWidth: '2px',
                } : {})
              }}>
                {networkItem.name}
              </Button>
            </Fragment>
          ))}
      </Box>
    </Box>
  );
}
