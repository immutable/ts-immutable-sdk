import { WalletProviderName, WalletInfo } from '@imtbl/checkout-sdk';
import { Box, MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';
import {
  Avatar,
  IconButton,
  List,
  ListItem, ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuList,
  Paper,
  Typography
} from "@mui/material";
import InboxIcon from '@mui/icons-material/Inbox';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DraftsIcon from '@mui/icons-material/Drafts';
export interface WalletProps {
  onWalletClick: (walletProvider: WalletProviderName) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;

  const walletText = wallets[wallet.walletProvider];
  const logo = {
    [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
    [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    // TODO: Fragments should contain more than one child - otherwise, there’s no need for a Fragment at all.
    // Consider checking !walletText and rendering a callback component instead, then it would make sense
    // to use a Fragment.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <ListItem>
        <ListItemButton onClick={() => onWalletClick(wallet.walletProvider)}>
          <ListItemAvatar>
            <Avatar variant="square" src="metamask.png" />
          </ListItemAvatar>
          <ListItemText primary={wallets[wallet.walletProvider].heading} secondary={wallets[wallet.walletProvider].description} />
          <NavigateNextIcon />
        </ListItemButton>
      </ListItem>
    </>
  );
}
