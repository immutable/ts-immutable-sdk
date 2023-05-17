import {
  Body,
  Box,
  Heading,
  Icon,
  MenuItem,
  OverflowPopoverMenu,
  PriceDisplay,
} from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import {
  balanceItemContainerStyle,
  balanceItemCoinBoxStyle,
  balanceItemPriceBoxStyle,
  ShowMenuItem,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletActions, WalletContext } from '../../context/WalletContext';
import {
  sendBridgeCoinsEvent,
  sendOnRampCoinsEvent,
  sendSwapCoinsEvent,
} from '../../CoinTopUpEvents';
import { L1Network, zkEVMNetwork } from '../../../../lib/networkUtils';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export function BalanceItem(props: BalanceItemProps) {
  const { balanceInfo } = props;
  const fiatAmount = `≈ USD $${balanceInfo.fiatAmount ?? '-.--'}`;
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { supportedTopUps, network, checkout } = walletState;
  const [isOnRampEnabled, setIsOnRampEnabled] = useState<boolean>();
  const [isBridgeEnabled, setIsBridgeEnabled] = useState<boolean>();
  const [isSwapEnabled, setIsSwapEnabled] = useState<boolean>();

  useEffect(() => {
    walletDispatch({
      payload: {
        type: WalletActions.SET_SUPPORTED_TOP_UPS,
        supportedTopUps: { ...supportedTopUps, isBridgeEnabled: true },
      },
    });
  }, []);

  useEffect(() => {
    if (!network || !supportedTopUps || !checkout) return;

    const enableAddCoin = network.chainId === zkEVMNetwork(checkout.config.environment)
      && (supportedTopUps?.isOnRampEnabled ?? true);
    setIsOnRampEnabled(enableAddCoin);

    const enableMoveCoin = network.chainId === L1Network(checkout.config.environment)
      && (supportedTopUps?.isBridgeEnabled ?? true);
    setIsBridgeEnabled(enableMoveCoin);

    const enableSwapCoin = network.chainId === zkEVMNetwork(checkout.config.environment)
      && (supportedTopUps?.isSwapEnabled ?? true);
    setIsSwapEnabled(enableSwapCoin);
  }, [network, supportedTopUps, checkout]);

  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={balanceItemContainerStyle}
    >
      <Box sx={balanceItemCoinBoxStyle}>
        <Icon icon="Coins" sx={{ width: 'base.icon.size.300' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Body>{balanceInfo.symbol}</Body>
          <Body size="small">{balanceInfo.description}</Body>
        </Box>
      </Box>
      <Box sx={balanceItemPriceBoxStyle}>
        <PriceDisplay
          testId={`balance-item-${balanceInfo.symbol}`}
          use={Heading}
          size="xSmall"
          price={balanceInfo.balance}
          fiatAmount={fiatAmount}
        />
        {(isOnRampEnabled || isSwapEnabled || isBridgeEnabled) && (
          <OverflowPopoverMenu size="small" testId="token-menu">
            <MenuItem
              testId="balance-item-add-option"
              sx={ShowMenuItem(isOnRampEnabled)}
              onClick={() => {
                sendOnRampCoinsEvent({
                  tokenAddress: '',
                  amount: '',
                });
              }}
            >
              <MenuItem.Icon icon="Add" />
              <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
            <MenuItem
              testId="balance-item-swap-option"
              sx={ShowMenuItem(isSwapEnabled)}
              onClick={() => {
                sendSwapCoinsEvent({
                  fromTokenAddress: '',
                  toTokenAddress: '',
                  amount: '',
                });
              }}
            >
              <MenuItem.Icon icon="Exchange" />
              <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
            <MenuItem
              testId="balance-item-move-option"
              sx={ShowMenuItem(isBridgeEnabled)}
              onClick={() => {
                sendBridgeCoinsEvent({
                  fromNetwork: '',
                  tokenAddress: '',
                  amount: '',
                });
              }}
            >
              <MenuItem.Icon icon="Minting" />
              <MenuItem.Label>{`Move ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
          </OverflowPopoverMenu>
        )}
      </Box>
    </Box>
  );
}
