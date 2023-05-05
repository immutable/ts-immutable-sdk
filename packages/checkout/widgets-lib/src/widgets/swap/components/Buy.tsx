import { Box, Body, TextInput } from '@biom3/react';
import TokenSelect from './TokenSelect';
import { BigNumber, utils } from 'ethers';
import { TokenInfo, ConnectResult } from '@imtbl/checkout-sdk';
export interface BuyProps {
  onTokenChange: (token: TokenInfo) => void;
  onAmountChange: (event: any) => void;
  token: TokenInfo;
  amount: BigNumber;
  connection: ConnectResult;
}

export function Buy(props: BuyProps) {
  const { onTokenChange, onAmountChange, token, amount, connection } = props;
  const defaultValue = utils
    .formatUnits((amount || 0).toString(), token?.decimals || 18)
    ?.toString();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Body size={'medium'}>I want to buy:</Body>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <TextInput
          testId="buyField__amount"
          defaultValue={defaultValue}
          onChange={onAmountChange}
          type="number"
        />
        <TokenSelect
          testId="buyField"
          token={token}
          onChange={onTokenChange}
          connection={connection}
        />
      </Box>
    </Box>
  );
}
