import { Box, MenuItem } from '@biom3/react';
import { useContext } from 'react';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../../context/ConnectViewContextTypes';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { ConnectActions, ConnectContext } from '../../context/ConnectContext';
import { text } from '../../../../resources/text/textConfig';

export const WalletList = () => {
  const { connectDispatch } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { wallets } = text;

  const onWalletClick = (providerPreference: ConnectionProviders) => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER_PREFERENCE,
        providerPreference,
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: ConnectWidgetViews.READY_TO_CONNECT },
      },
    });
  };

  // get wallet list
  // check if browser extensions enabled
  // filter down list

  // intent is that MenuItem can be extracted to a component and configured with
  // ConnectionProviders enum and a logo. everything should be configured from that

  return (
    <Box
      testId="wallet-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <MenuItem
        testId={`wallet-list-${ConnectionProviders.METAMASK}`}
        size="medium"
        emphasized={true}
        onClick={() => onWalletClick(ConnectionProviders.METAMASK)}
      >
        <MenuItem.FramedLogo
          logo="MetaMaskSymbol"
          sx={{
            width: 'base.icon.size.500',
            backgroundColor: 'base.color.translucent.container.200',
            borderRadius: 'base.borderRadius.x2',
          }}
        />
        <MenuItem.Label size="medium">
          {wallets[ConnectionProviders.METAMASK].heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon></MenuItem.IntentIcon>
        <MenuItem.Caption>
          {wallets[ConnectionProviders.METAMASK].description}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );
};
