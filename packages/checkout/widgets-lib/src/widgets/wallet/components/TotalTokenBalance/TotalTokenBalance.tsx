import {
  Body, Box, ButtCon,
} from '@biom3/react';
import { useContext } from 'react';
import {
  coinInfoButtonStyle,
  totalTokenBalanceStyle,
  totalTokenBalanceValueStyle,
} from './TotalTokenBalanceStyles';
import {
  ViewActions,
  ViewContext,
} from '../../../../context/view-context/ViewContext';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';
import { text } from '../../../../resources/text/textConfig';

interface TotalTokenBalanceProps {
  totalBalance: number;
  loading: boolean;
}

export function TotalTokenBalance(props: TotalTokenBalanceProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { totalTokenBalance } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { totalBalance, loading } = props;
  return (
    <Box sx={totalTokenBalanceStyle}>
      <Box sx={totalTokenBalanceValueStyle}>
        <Body size="medium">{totalTokenBalance.heading}</Body>
        <Box sx={{ pl: 'base.spacing.x1' }}>
          <ButtCon
            testId="coin-info-icon"
            variant="tertiary"
            icon="Information"
            sx={coinInfoButtonStyle}
            onClick={() => viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: WalletWidgetViews.COIN_INFO },
              },
            })}
          />
        </Box>
      </Box>
      <Box sx={totalTokenBalanceValueStyle}>
        <Body weight="bold" shimmer={loading ? 1 : 0} shimmerSx={{ minw: '100px' }}>
          {totalTokenBalance.totalHeading}
        </Body>
        {!loading && (
        <Body testId="total-token-balance" weight="bold">
          &asymp; USD $
          {totalBalance.toFixed(2)}
        </Body>
        )}
      </Box>
    </Box>
  );
}
