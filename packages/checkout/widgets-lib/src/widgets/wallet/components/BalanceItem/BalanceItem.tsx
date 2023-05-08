import {
  Body,
  Box,
  Heading,
  Icon,
  MenuItem,
  OverflowPopoverMenu,
  PriceDisplay,
} from '@biom3/react';
import {
  BalanceItemContainerStyle,
  BalanceItemCoinBoxStyle,
  BalanceItemPriceBoxStyle,
  ShowMenuItem,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import { useContext, useEffect, useState } from 'react';
import { ChainId } from '@imtbl/checkout-sdk';
import {
  sendBridgeCoinsEvent,
  sendOnRampCoinsEvent,
  sendSwapCoinsEvent,
} from '../../CoinTopUpEvents';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const { balanceInfo } = props;
  const fiatAmount = `≈ USD $${balanceInfo.fiatAmount ?? '-.--'}`;
  const { walletState } = useContext(WalletContext);
  const { supportedTopUps, network } = walletState;
  const [isOnRampEnabled, setIsOnRampEnabled] = useState<boolean>();
  const [isBridgeEnabled, setIsBridgeEnabled] = useState<boolean>();
  const [isSwapEnabled, setIsSwapEnabled] = useState<boolean>();

  useEffect(() => {
    if (!network || !supportedTopUps) return;

    const enableAddCoin =
      network.chainId === ChainId.POLYGON &&
      (supportedTopUps?.isOnRampEnabled ?? true);
    setIsOnRampEnabled(enableAddCoin);

    const enableMoveCoin =
      network.chainId === ChainId.ETHEREUM &&
      (supportedTopUps?.isBridgeEnabled ?? true);
    setIsBridgeEnabled(enableMoveCoin);

    const enableSwapCoin =
      network.chainId === ChainId.POLYGON &&
      (supportedTopUps?.isSwapEnabled ?? true);
    setIsSwapEnabled(enableSwapCoin);
  }, [network, supportedTopUps]);

  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={BalanceItemContainerStyle}
    >
      <Box sx={BalanceItemCoinBoxStyle}>
        <Icon icon="Coins" sx={{ width: 'base.icon.size.300' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Body>{balanceInfo.symbol}</Body>
          <Body size="small">{balanceInfo.description}</Body>
        </Box>
      </Box>
      <Box sx={BalanceItemPriceBoxStyle}>
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
              <MenuItem.Icon icon="Add"></MenuItem.Icon>
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
              <MenuItem.Icon icon="Exchange"></MenuItem.Icon>
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
              <MenuItem.Icon icon="Minting"></MenuItem.Icon>
              <MenuItem.Label>{`Move ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
          </OverflowPopoverMenu>
        )}
      </Box>
    </Box>
  );
};
