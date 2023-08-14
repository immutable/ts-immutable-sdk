import {
  Body, Box, ButtCon,
} from '@biom3/react';
import { useContext } from 'react';
import {
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
}

export function TotalTokenBalance(props: TotalTokenBalanceProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { totalTokenBalance } = text.views[WalletWidgetViews.WALLET_BALANCES];
  const { totalBalance } = props;
  return (
    <Box sx={totalTokenBalanceStyle}>
      <Box sx={totalTokenBalanceValueStyle}>
        <Body size="medium">{totalTokenBalance.heading}</Body>
        <Box sx={{ pl: 'base.spacing.x1' }}>
          <ButtCon
            testId="coin-info-icon"
            variant="tertiary"
            icon="Information"
            sx={{
              width: 'base.icon.size.250',
              height: 'base.icon.size.250',
              fill: 'base.color.accent.4',
              cursor: 'pointer',
              borderRadius: '50%',
            }}
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
        <Body size="medium" weight="bold">
          {totalTokenBalance.totalHeading}
        </Body>
        <Body testId="total-token-balance" size="medium" weight="bold">
          &asymp; USD $
          {totalBalance.toFixed(2)}
        </Body>
      </Box>
    </Box>
  );
}
