import { Box } from '@biom3/react';
import { BigNumber, utils } from 'ethers';
import { TokenInfo, Transaction } from '@imtbl/checkout-sdk';
import { useContext, useState } from 'react';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { Buy } from '../components/Buy';
// TODO: Fix circular dependency
// eslint-disable-next-line import/no-cycle
import With from '../components/With';
import { Fees } from '../components/Fees';
import { SwapButton } from '../components/SwapButton';
import { SwapContext } from '../context/SwapContext';
import { alphaSortTokensList, findTokenByAddress } from '../helpers';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapForm } from '../components/SwapForm/SwapForm';

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
  amount: string | undefined;
  fromContractAddress: string | undefined;
  toContractAddress: string | undefined;
}

export function SwapCoins({
  amount,
  fromContractAddress,
  toContractAddress,
}: SwapCoinsProps) {
  const { title } = text.views[SwapWidgetViews.SWAP].header;

  const { swapState } = useContext(SwapContext);
  const { provider, allowedTokens } = swapState;

  const sortedAllowList: TokenInfo[] = alphaSortTokensList(allowedTokens);
  const validatedAmount = Number.isNaN(Number(amount))
    ? BigNumber.from(0)
    : BigNumber.from(amount);

  const [buyAmount, setBuyAmount] = useState<BigNumber>(validatedAmount || 0);
  const [buyToken, setBuyToken] = useState<TokenInfo>(
    findTokenByAddress(sortedAllowList, toContractAddress) || sortedAllowList[0],
  );
  const [withQuote, setWithQuote] = useState<QuoteResponse>();
  const [withToken, setWithToken] = useState<TokenInfo | undefined>(
    findTokenByAddress(sortedAllowList, fromContractAddress),
  );

  const onBuyFieldAmountChange = (event: any) => {
    const newAmount = event.target.value;
    let resolvedValue: BigNumber;

    if (!newAmount || Number.isNaN(newAmount)) {
      resolvedValue = BigNumber.from(0);
    } else {
      resolvedValue = utils.parseUnits(
        newAmount.toString(),
        buyToken?.decimals,
      );
    }

    setBuyAmount(resolvedValue);
  };

  const onBuyFieldTokenChange = (token: TokenInfo) => {
    setBuyToken(token);
  };

  const onWithFieldTokenChange = (token: TokenInfo) => {
    setWithToken(token);
  };

  const onWithFieldQuoteChange = (newQuote: QuoteResponse) => {
    setWithQuote(newQuote);
  };

  // Stubbed exchange.getTransaction
  const getTransaction = (): Transaction => ({
    nonce: '0x00', // ignored by MetaMask
    gasPrice: '0x000', // customizable by user during MetaMask confirmation.
    gas: '0x000', // customizable by user during MetaMask confirmation.
    to: '', // To address.
    from: '', // User's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: '0x000', // Optional, but used for defining smart contract creation and interaction.
    chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  });
  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          title={title}
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <SwapForm />

        {/* todo: remove buy/with components */}
        <Buy
          onTokenChange={onBuyFieldTokenChange}
          onAmountChange={onBuyFieldAmountChange}
          token={buyToken}
          amount={buyAmount}
        />
        <With
          onTokenChange={onWithFieldTokenChange}
          onQuoteChange={onWithFieldQuoteChange}
          token={withToken}
          quote={withQuote}
          buyToken={buyToken}
          buyAmount={buyAmount}
        />
        {withQuote && (
          <Fees
            fees={withQuote.trade.fees.amount.formatted}
            fiatPrice={withQuote.trade.slippage.amount.formatted}
            tokenSymbol="imx"
          />
        )}
        {provider && (
        <SwapButton provider={provider} transaction={getTransaction()} />
        )}
      </Box>
    </SimpleLayout>
  );
}
