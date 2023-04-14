import { alphaSortTokensList, findTokenByAddress } from '../helpers';
import { BigNumber, utils } from 'ethers';
import { Box } from '@biom3/react';
import { Buy } from './Buy';
import { Checkout, ConnectResult, GetTokenAllowListResult, TokenInfo, Transaction} from '@imtbl/checkout-sdk-web';
import { Fees } from './Fees';
import { SwapButton } from './SwapButton';
import { SwapWidgetViews } from '../SwapWidget';
import { useState, useMemo } from 'react';
import With from './With';

type AmountAndPercentage = {
  amount: {
    bn: BigNumber;
    formatted: string;
  }
  percent: number;
}

type QuoteSlippage = AmountAndPercentage;

type QuoteFees = AmountAndPercentage & {
  token: TokenInfo;
}

type TradeInfo = {
  amountIn: BigNumber;
  amountOut: BigNumber;
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  fees: QuoteFees;
  slippage: QuoteSlippage;
}

export type QuoteResponse = {
  status: string;
  trade: TradeInfo;
}

export type BuyField = {
  amount?: BigNumber;
  token?: TokenInfo;
}

export type WithField = {
  quote?: QuoteResponse;
  token?: TokenInfo;
}

export interface SwapFormProps {
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
  connection: ConnectResult;
  updateView: (view: SwapWidgetViews, err?: any) => void;
}

export function SwapForm(props: SwapFormProps) {
  const {
    amount,
    fromContractAddress,
    toContractAddress,
    connection,
    updateView
  } = props;

  const checkout = useMemo(() => new Checkout(), []);
  const allowList: GetTokenAllowListResult = checkout.getTokenAllowList(
    {chainId: 1} // TODO: THIS NEEDS TO BE CHANGED BACK TO THE NETWORK CHAIN ID
  )
  const sortedAllowList: TokenInfo[] = alphaSortTokensList(allowList.tokens);
  const validatedAmount = isNaN(Number(amount)) ? BigNumber.from(0) : BigNumber.from(amount);
  const [buyAmount, setBuyAmount] = useState<BigNumber>(validatedAmount || 0);
  const [buyToken, setBuyToken] = useState<TokenInfo>(
    findTokenByAddress(sortedAllowList, toContractAddress) || sortedAllowList[0]
  );
  const [withQuote, setWithQuote] = useState<QuoteResponse>();
  const [withToken, setWithToken] = useState<TokenInfo | undefined>(
    findTokenByAddress(sortedAllowList, fromContractAddress)
  );

  const onBuyFieldAmountChange = (event: any) => {
    const newAmount = event.target.value;
    let resolvedValue: BigNumber;

    if (!newAmount || isNaN(newAmount)) {
      resolvedValue = BigNumber.from(0);
    } else {
      resolvedValue = utils.parseUnits(newAmount.toString(), buyToken?.decimals);
    }

    setBuyAmount(resolvedValue);
  }

  const onBuyFieldTokenChange = (token: TokenInfo) => {
    setBuyToken(token);
  }

  const onWithFieldTokenChange = (token: TokenInfo) => {
    setWithToken(token);
  }

  const onWithFieldQuoteChange = (newQuote: QuoteResponse) => {
    setWithQuote(newQuote);
  }

  const getTransaction = (): Transaction => {
    // Stubbed exchange.getTransaction
    return {
      nonce: '0x00', // ignored by MetaMask
      gasPrice: '0x000', // customizable by user during MetaMask confirmation.
      gas: '0x000', // customizable by user during MetaMask confirmation.
      to: '', // To address.
      from: '', // User's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: '0x000', // Optional, but used for defining smart contract creation and interaction.
      chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Buy
        onTokenChange={onBuyFieldTokenChange}
        onAmountChange={onBuyFieldAmountChange}
        token={buyToken}
        amount={buyAmount}
        connection={connection} />
      <With
        onTokenChange={onWithFieldTokenChange}
        onQuoteChange={onWithFieldQuoteChange}
        token={withToken}
        quote={withQuote}
        buyToken={buyToken}
        buyAmount={buyAmount}
        connection={connection}
        tokenAllowList={sortedAllowList} />
      {withQuote && <Fees
        fees={withQuote.trade.fees.amount.formatted}
        slippage={withQuote.trade.slippage.amount.formatted}
        tokenSymbol='imx'
      />}
      <SwapButton
        provider={connection.provider}
        transaction={getTransaction()}
        updateView={updateView}
      />
    </Box>
  )
}
