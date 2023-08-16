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
  useContext, useEffect, useState,
} from 'react';
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
import { getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { formatZeroAmount, tokenValueFormat } from '../../../../lib/utils';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../../lib/providerUtils';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
  bridgeToL2OnClick: (address?: string) => void;
}

export function BalanceItem({ balanceInfo, bridgeToL2OnClick }: BalanceItemProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const fiatAmount = `≈ USD $${formatZeroAmount(balanceInfo.fiatAmount)}`;
  const { walletState } = useContext(WalletContext);
  const { supportedTopUps, network } = walletState;
  const [isOnRampEnabled, setIsOnRampEnabled] = useState<boolean>();
  const [isBridgeEnabled, setIsBridgeEnabled] = useState<boolean>();
  const [isSwapEnabled, setIsSwapEnabled] = useState<boolean>();

  const isPassport = isPassportProvider(provider);

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

  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}-${balanceInfo.address}`}
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
          price={tokenValueFormat(balanceInfo.balance)}
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
              onClick={() => bridgeToL2OnClick(balanceInfo.address)}
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
