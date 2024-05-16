import { Heading, MenuItem } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  IMTBLWidgetEvents, TokenFilterTypes, TokenInfo, WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { ShowMenuItem } from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import { orchestrationEvents } from '../../../../lib/orchestrationEvents';
import { getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { formatZeroAmount, getDefaultTokenImage, tokenValueFormat } from '../../../../lib/utils';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../../lib/provider';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
  theme: WidgetTheme;
  bridgeToL2OnClick: (address?: string) => void;
}

export function BalanceItem({
  balanceInfo,
  theme,
  bridgeToL2OnClick,
}: BalanceItemProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { track } = useAnalytics();
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
  const [iconError, setIconError] = useState<boolean>(false);

  const isPassport = isPassportProvider(provider);

  const tokenUrl = useMemo(() => {
    if (!checkout) return '';
    const environment = checkout?.config.environment ?? Environment.PRODUCTION;
    return iconError ? getDefaultTokenImage(environment, theme) : balanceInfo.icon;
  }, [balanceInfo.icon, checkout, theme, iconError]);

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

    const enableMoveCoin = (network.chainId === getL1ChainId(checkout.config)
    || network.chainId === getL2ChainId(checkout.config))
      && (supportedTopUps?.isBridgeEnabled ?? true);
    setIsBridgeEnabled(enableMoveCoin);

    const enableSwapCoin = network.chainId === getL2ChainId(checkout.config)
        && (supportedTopUps?.isSwapEnabled ?? true)
        && (supportedTopUps?.isSwapAvailable ?? true);
    setIsSwapEnabled(enableSwapCoin);
  }, [network, supportedTopUps, checkout, isPassport]);

  const showAddMenuItem = useMemo(
    () => Boolean(
      isOnRampEnabled
          && onRampAllowedTokens.length > 0
          && onRampAllowedTokens.find(
            (token) => token.address?.toLowerCase() === balanceInfo.address?.toLowerCase(),
          ),
    ),
    [isOnRampEnabled, onRampAllowedTokens],
  );

  return (
    <MenuItem testId={`balance-item-${balanceInfo.symbol}`} emphasized>
      <MenuItem.FramedImage
        use={(
          <img
            src={tokenUrl}
            alt={balanceInfo.symbol}
            onError={() => setIconError(true)}
          />
        )}
        circularFrame
      />
      <MenuItem.Label>{balanceInfo.symbol}</MenuItem.Label>
      <MenuItem.Caption>{balanceInfo.description}</MenuItem.Caption>
      <MenuItem.PriceDisplay
        testId={`balance-item-${balanceInfo.symbol}`}
        use={<Heading size="xSmall" />}
        price={tokenValueFormat(balanceInfo.balance)}
        fiatAmount={fiatAmount}
      />
      {(isOnRampEnabled || isSwapEnabled || isBridgeEnabled) && (
        <MenuItem.OverflowPopoverMenu
          size="small"
          testId="token-menu"
          onClick={() => {
            track({
              userJourney: UserJourney.WALLET,
              screen: 'WalletBalances',
              control: 'BalanceItem',
              controlType: 'Button',
              extras: {
                tokenSymbol: balanceInfo.symbol,
                tokenAddress: balanceInfo.address,
              },
            });
          }}
        >
          <MenuItem
            testId="balance-item-add-option"
            sx={ShowMenuItem(showAddMenuItem)}
            onClick={() => {
              track({
                userJourney: UserJourney.WALLET,
                screen: 'WalletBalances',
                control: 'AddTokens',
                controlType: 'Button',
                extras: {
                  tokenSymbol: balanceInfo.symbol,
                  tokenAddress: balanceInfo.address,
                },
              });
              orchestrationEvents.sendRequestOnrampEvent(
                eventTarget,
                IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
                {
                  tokenAddress: balanceInfo.address ?? '',
                  amount: '',
                },
              );
            }}
          >
            <MenuItem.Icon icon="Add" />
            <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
          <MenuItem
            testId="balance-item-swap-option"
            sx={ShowMenuItem(isSwapEnabled)}
            onClick={() => {
              track({
                userJourney: UserJourney.WALLET,
                screen: 'WalletBalances',
                control: 'SwapTokens',
                controlType: 'Button',
                extras: {
                  tokenSymbol: balanceInfo.symbol,
                  tokenAddress: balanceInfo.address,
                },
              });
              orchestrationEvents.sendRequestSwapEvent(
                eventTarget,
                IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
                {
                  fromTokenAddress: balanceInfo.address ?? '',
                  toTokenAddress: '',
                  amount: '',
                },
              );
            }}
          >
            <MenuItem.Icon icon="Exchange" />
            <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
          <MenuItem
            testId="balance-item-move-option"
            sx={ShowMenuItem(isBridgeEnabled)}
            onClick={() => {
              track({
                userJourney: UserJourney.WALLET,
                screen: 'WalletBalances',
                control: 'MoveTokens',
                controlType: 'Button',
                extras: {
                  tokenSymbol: balanceInfo.symbol,
                  tokenAddress: balanceInfo.address,
                },
              });
              bridgeToL2OnClick(balanceInfo.address);
            }}
          >
            <MenuItem.Icon icon="Minting" />
            <MenuItem.Label>{`Move ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
        </MenuItem.OverflowPopoverMenu>
      )}
    </MenuItem>
  );
}
