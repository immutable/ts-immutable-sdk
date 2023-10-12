import {
  Heading,
} from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { TokenFilterTypes, TokenInfo } from '@imtbl/checkout-sdk';
import {
  ShowMenuItem,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import { orchestrationEvents } from '../../../../lib/orchestrationEvents';
import { getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { formatZeroAmount, tokenValueFormat } from '../../../../lib/utils';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../../lib/providerUtils';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton, ListItemIcon,
  ListItemText, Menu,
  MenuItem,
  Stack,
  Typography
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SvgIconCoin from "../../../../theme/icons/coin";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
  bridgeToL2OnClick: (address?: string) => void;
}

export function BalanceItem({
  balanceInfo,
  bridgeToL2OnClick,
}: BalanceItemProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const fiatAmount = `≈ USD $${formatZeroAmount(balanceInfo.fiatAmount)}`;
  const { walletState } = useContext(WalletContext);
  const { supportedTopUps, network } = walletState;
  const [isOnRampEnabled, setIsOnRampEnabled] = useState<boolean>();
  const [isBridgeEnabled, setIsBridgeEnabled] = useState<boolean>();
  const [isSwapEnabled, setIsSwapEnabled] = useState<boolean>();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const [onRampAllowedTokens, setOnRampAllowedTokens] = useState<TokenInfo[]>(
    [],
  );

  const isPassport = isPassportProvider(provider);

  useEffect(() => {
    const getOnRampAllowedTokens = async () => {
      if (!checkout) return;
      const onRampAllowedTokensResult = await checkout.getTokenAllowList({
        type: TokenFilterTypes.ONRAMP,
        chainId: getL2ChainId(checkout.config),
      });
      setOnRampAllowedTokens(onRampAllowedTokensResult.tokens);
    };
    getOnRampAllowedTokens();
  }, [checkout]);

  useEffect(() => {
    if (!network || !supportedTopUps || !checkout) return;

    const enableAddCoin = network.chainId === getL2ChainId(checkout.config)
      && (supportedTopUps?.isOnRampEnabled ?? true);
    setIsOnRampEnabled(enableAddCoin);

    const enableMoveCoin = network.chainId === getL1ChainId(checkout.config)
      && (supportedTopUps?.isBridgeEnabled ?? true)
      && !isPassport;
    setIsBridgeEnabled(enableMoveCoin);

    const enableSwapCoin = network.chainId === getL2ChainId(checkout.config)
      && (supportedTopUps?.isSwapEnabled ?? true);
    setIsSwapEnabled(enableSwapCoin);
  }, [network, supportedTopUps, checkout, isPassport]);

  const showAddMenuItem = useMemo(
    () => Boolean(
      isOnRampEnabled
          && onRampAllowedTokens.length > 0
          && onRampAllowedTokens.find(
            (token) => token.address?.toLowerCase()
              === balanceInfo.address?.toLowerCase(),
          ),
    ),
    [isOnRampEnabled, onRampAllowedTokens],
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <SvgIconCoin />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={balanceInfo.symbol} secondary={balanceInfo.description} />
        <Stack direction='row'>
          <Stack alignItems='flex-end'>
            <Typography sx={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'rgb(243, 243, 243)',
            }}>
              {tokenValueFormat(balanceInfo.balance)}
            </Typography>
            <Typography sx={{
              fontSize: '12px',
              fontWeight: '400',
              color: 'rgb(182, 182, 182)',
            }}>
              {fiatAmount}
            </Typography>
          </Stack>
          <IconButton
            color="inherit"
            size='medium'
            sx={{
              marginLeft: '10px'
            }}
            onClick={handleClick}
          >
            <MoreVertIcon fontSize='small' />
          </IconButton>
        </Stack>
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClose} sx={{ minHeight: '48px' }}>
          <ListItemIcon>
            <AddIcon sx={{
              color: 'rgb(243, 243, 243)'
            }} />
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{
              fontSize: '16px',
              fontWeight: '400',
              color: 'rgb(243, 243, 243)'
            }}>
              Add IMX
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ minHeight: '48px' }}>
          <ListItemIcon>
            <SwapHorizIcon sx={{
              color: 'rgb(243, 243, 243)'
            }} />
          </ListItemIcon>
          <ListItemText sx={{
            fontSize: '16px',
            fontWeight: '400',
          }}><Typography sx={{
            fontSize: '16px',
            fontWeight: '400',
            color: 'rgb(243, 243, 243)'
          }}>
            Swap IMX
          </Typography></ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
