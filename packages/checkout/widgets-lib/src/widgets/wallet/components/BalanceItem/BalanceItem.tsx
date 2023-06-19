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
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import {
  balanceItemContainerStyle,
  balanceItemCoinBoxStyle,
  balanceItemPriceBoxStyle,
  ShowMenuItem,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import {
  orchestrationEvents,
} from '../../../../lib/orchestrationEvents';
import { l1Network, zkEVMNetwork } from '../../../../lib/networkUtils';
import { formatZeroAmount } from '../../../../lib/utils';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}

export function BalanceItem(props: BalanceItemProps) {
  const { balanceInfo } = props;
  const fiatAmount = `≈ USD $${formatZeroAmount(balanceInfo.fiatAmount)}`;
  const { walletState } = useContext(WalletContext);
  const { supportedTopUps, network, checkout } = walletState;
  const [isOnRampEnabled, setIsOnRampEnabled] = useState<boolean>();
  const [isBridgeEnabled, setIsBridgeEnabled] = useState<boolean>();
  const [isSwapEnabled, setIsSwapEnabled] = useState<boolean>();

  useEffect(() => {
    if (!network || !supportedTopUps || !checkout) return;

    const enableAddCoin = network.chainId === zkEVMNetwork(checkout.config.environment)
      && (supportedTopUps?.isOnRampEnabled ?? true);
    setIsOnRampEnabled(enableAddCoin);

    const enableMoveCoin = network.chainId === l1Network(checkout.config.environment)
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
                orchestrationEvents.sendRequestOnrampEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                  tokenAddress: balanceInfo.address ?? '',
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
                orchestrationEvents.sendRequestSwapEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                  fromTokenAddress: balanceInfo.address ?? '',
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
                orchestrationEvents.sendRequestBridgeEvent(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                  tokenAddress: balanceInfo.address ?? '',
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
