import { Box, Heading } from '@biom3/react';
import { BigNumber } from 'ethers';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { useState } from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapButton } from '../components/SwapButton/SwapButton';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm/SwapForm';
import { Fees } from '../components/Fees';

type AmountAndPercentage = {
  amount: {
    bn: BigNumber;
    formatted: string;
  };
  percent: number;
};

type QuoteSlippage = AmountAndPercentage;

type QuoteFees = AmountAndPercentage & {
  token: TokenInfo;
};

type TradeInfo = {
  amountIn: BigNumber;
  amountOut: BigNumber;
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  fees: QuoteFees;
  slippage: QuoteSlippage;
};

export type QuoteResponse = {
  status: string;
  trade: TradeInfo;
};

export type BuyField = {
  amount?: BigNumber;
  token?: TokenInfo;
};

export type WithField = {
  quote?: QuoteResponse;
  token?: TokenInfo;
};

export interface SwapFormProps {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}
export interface SwapCoinsProps {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapCoins({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  amount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fromContractAddress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toContractAddress,
}: SwapCoinsProps) {
  const { header, content } = text.views[SwapWidgetViews.SWAP];

  const [loading, setLoading] = useState(false);

  const updateSetLoading = (value: boolean) => {
    setLoading(value);
  };

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          showBack
          title={header.title}
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.container.200"
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ paddingX: 'base.spacing.x4' }}>
          <Heading
            size="small"
            weight="regular"
            sx={{ paddingBottom: 'base.spacing.x4' }}
          >
            {content.title}
          </Heading>
          <SwapForm setLoading={updateSetLoading} />
          <Fees />
        </Box>
        <SwapButton loading={loading} />
      </Box>
    </SimpleLayout>
  );
}
