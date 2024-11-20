import { MenuItem } from '@biom3/react';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  IMTBLWidgetEvents,
  TokenFilterTypes,
  TokenInfo,
  WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { TokenImage } from '../../../../components/TokenImage/TokenImage';
import { ShowMenuItem } from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import { orchestrationEvents } from '../../../../lib/orchestrationEvents';
import { getL1ChainId, getL2ChainId } from '../../../../lib/networkUtils';
import { formatZeroAmount, tokenValueFormat } from '../../../../lib/utils';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../../lib/provider';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import {
  UserJourney,
  useAnalytics,
} from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

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
  const [isAddTokensEnabled, setIsAddTokensEnabled] = useState<boolean>();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const [onRampAllowedTokens, setOnRampAllowedTokens] = useState<TokenInfo[]>(
    [],
  );
  const [swapAllowedTokens, setSwapAllowedTokens] = useState<TokenInfo[]>([]);

  const isPassport = isPassportProvider(provider);

  useEffect(() => {
    (async () => {
      if (!checkout) return;
      const onRampTokens = checkout.getTokenAllowList({
        type: TokenFilterTypes.ONRAMP,
        chainId: getL2ChainId(checkout.config),
      });
      const swapTokens = checkout.getTokenAllowList({
        type: TokenFilterTypes.SWAP,
        chainId: getL2ChainId(checkout.config),
      });

      const [onRampAllowedTokensResult, swapAllowedTokensResult] = await Promise.all([onRampTokens, swapTokens]);

      setOnRampAllowedTokens(onRampAllowedTokensResult.tokens);
      setSwapAllowedTokens(swapAllowedTokensResult.tokens);
    })();
  }, [checkout]);

  useEffect(() => {
    if (!network || !supportedTopUps || !checkout) return;

    const currentChainId = Number(network.chainId);

    const enableAddCoin = (supportedTopUps?.isAddTokensEnabled ?? true)
    && (supportedTopUps?.isSwapAvailable ?? true);
    setIsAddTokensEnabled(enableAddCoin);

    const enableBuyCoin = !enableAddCoin
      && currentChainId === getL2ChainId(checkout.config)
      && (supportedTopUps?.isOnRampEnabled ?? true);
    setIsOnRampEnabled(enableBuyCoin);

    const enableMoveCoin = !enableAddCoin
      && (currentChainId === getL1ChainId(checkout.config)
        || currentChainId === getL2ChainId(checkout.config))
      && (supportedTopUps?.isBridgeEnabled ?? true);
    setIsBridgeEnabled(enableMoveCoin);

    const enableSwapCoin = !enableAddCoin
      && currentChainId === getL2ChainId(checkout.config)
      && (supportedTopUps?.isSwapEnabled ?? true)
      && (supportedTopUps?.isSwapAvailable ?? true);
    setIsSwapEnabled(enableSwapCoin);
  }, [network, supportedTopUps, checkout, isPassport]);

  const showAddTokenMenuItem = useMemo(() => {
    const canBuy = Boolean(
      isOnRampEnabled
        && onRampAllowedTokens.length > 0
        && onRampAllowedTokens.find(
          (token) => token.address?.toLowerCase() === balanceInfo.address?.toLowerCase(),
        ),
    );

    const canAdd = Boolean(
      isAddTokensEnabled
        && swapAllowedTokens.length > 0
        && swapAllowedTokens.find(
          (token) => token.address?.toLowerCase() === balanceInfo.address?.toLowerCase(),
        ),
    );

    return canBuy || canAdd;
  }, [
    isOnRampEnabled,
    onRampAllowedTokens,
    isAddTokensEnabled,
    swapAllowedTokens,
  ]);

  const handleAddTokenClick = () => {
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

    if (isAddTokensEnabled) {
      orchestrationEvents.sendRequestAddTokensEvent(
        eventTarget,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        {
          toAmount: '',
          toTokenAddress: balanceInfo.address ?? '',
        },
      );

      return;
    }

    orchestrationEvents.sendRequestOnrampEvent(
      eventTarget,
      IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
      {
        tokenAddress: balanceInfo.address ?? '',
        amount: '',
      },
    );
  };

  return (
    <MenuItem testId={`balance-item-${balanceInfo.symbol}`} emphasized>
      <MenuItem.FramedImage
        use={(
          <TokenImage
            theme={theme}
            src={balanceInfo.icon}
            name={balanceInfo.symbol}
            environment={checkout?.config.environment ?? Environment.PRODUCTION}
          />
        )}
        circularFrame
      />
      <MenuItem.Label>{balanceInfo.symbol}</MenuItem.Label>
      <MenuItem.Caption>{balanceInfo.description}</MenuItem.Caption>
      <MenuItem.PriceDisplay
        testId={`balance-item-${balanceInfo.symbol}`}
        price={tokenValueFormat(balanceInfo.balance)}
        fiatAmount={fiatAmount}
      />
      {(isOnRampEnabled || isSwapEnabled || isBridgeEnabled || isAddTokensEnabled) && (
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
            sx={ShowMenuItem(showAddTokenMenuItem)}
            onClick={handleAddTokenClick}
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
