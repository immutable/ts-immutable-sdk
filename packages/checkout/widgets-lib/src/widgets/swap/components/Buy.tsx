import { Box, Body, TextInput } from '@biom3/react';
import { BigNumber, utils } from 'ethers';
import { useContext } from 'react';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { SwapContext } from '../context/swap-context/SwapContext';
import TokenSelect from './TokenSelect';

export interface BuyProps {
  onTokenChange: (token: TokenInfo) => void;
  onAmountChange: (event: any) => void;
  token: TokenInfo;
  amount: BigNumber;
}

export function Buy(props: BuyProps) {
  const {
    onTokenChange, onAmountChange, token, amount,
  } = props;
  const defaultValue = utils
    .formatUnits((amount || 0).toString(), token?.decimals || 18)
    ?.toString();

  const { swapState } = useContext(SwapContext);
  const { allowedTokens } = swapState;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Body size="medium">I want to buy:</Body>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextInput
          testId="buyField__amount"
          defaultValue={defaultValue}
          onChange={onAmountChange}
          type="number"
        />
        <TokenSelect
          testId="buyField"
          allowedTokens={allowedTokens}
          token={token}
          onChange={onTokenChange}
        />
      </Box>
    </Box>
  );
}
