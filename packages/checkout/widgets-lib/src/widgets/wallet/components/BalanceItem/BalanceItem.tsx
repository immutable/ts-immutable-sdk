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
import { ChainId, TokenInfo } from '@imtbl/checkout-sdk';
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
              sx={ShowMenuItem(isOnRampEnabled)}
              onClick={() => {
                sendOnRampCoinsEvent({
                  network: walletState.network ?? undefined,
                  token: {
                    name: balanceInfo.symbol,
                    symbol: balanceInfo.symbol,
                    icon: balanceInfo.iconLogo,
                  } as unknown as TokenInfo,
                  maxTokenAmount: balanceInfo.balance,
                });
              }}
            >
              <MenuItem.Icon icon="Add"></MenuItem.Icon>
              <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
            <MenuItem
              sx={ShowMenuItem(isSwapEnabled)}
              onClick={() => {
                sendSwapCoinsEvent({
                  network: walletState.network ?? undefined,
                  token: {
                    name: balanceInfo.symbol,
                    symbol: balanceInfo.symbol,
                    icon: balanceInfo.iconLogo,
                  } as unknown as TokenInfo,
                  maxTokenAmount: balanceInfo.balance,
                });
              }}
            >
              <MenuItem.Icon icon="Exchange"></MenuItem.Icon>
              <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
            <MenuItem
              sx={ShowMenuItem(isBridgeEnabled)}
              onClick={() => {
                sendBridgeCoinsEvent({
                  network: walletState.network ?? undefined,
                  token: {
                    name: balanceInfo.symbol,
                    symbol: balanceInfo.symbol,
                    icon: balanceInfo.iconLogo,
                  } as unknown as TokenInfo,
                  maxTokenAmount: balanceInfo.balance,
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
