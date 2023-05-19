import {
  Body, Box, Option, OptionKey, Select, TextInput,
} from '@biom3/react';
import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { BridgeContext } from '../context/BridgeContext';

interface BridgeFormProps {
  defaultAmount?: string;
  defaultTokenAddress?: string;
}

export function BridgeForm(props: BridgeFormProps) {
  const { bridgeState } = useContext(BridgeContext);
  const { network, tokenBalances, toNetwork } = bridgeState;
  const { defaultAmount, defaultTokenAddress } = props;

  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount || '0');
  const [selectedTokenOption, setSelectedTokenOption] = useState<OptionKey>();

  function handleBridgeAmountChange(event: any) {
    const { value } = event.target;
    setBridgeAmount(value);
  }

  function handleSelectToken(selectedOption: OptionKey) {
    setSelectedTokenOption(selectedOption);
  }

  /**
   * This effect is used to set the default token option
   * Set as the token that is passed in as a prop if it has an available balance
   * Otherwise will default to the native currency of the chain
   * If the user does not have any non-zero balances, this will not be set
   */
  useEffect(() => {
    let defaultToken: GetBalanceResult | undefined;
    if (defaultTokenAddress) {
      defaultToken = tokenBalances.find(
        (balance) => balance.token.address === defaultTokenAddress,
      );
    }
    if (!defaultToken) {
      defaultToken = tokenBalances.find(
        (balance) => balance.token.symbol === network?.nativeCurrency.symbol,
      );
    }

    setSelectedTokenOption(defaultToken?.token.symbol as OptionKey);
  }, [tokenBalances, network, defaultTokenAddress]);

  return (
    <Box sx={{ paddingTop: 'base.spacing.x4' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          columnGap: 'base.spacing.x4',
        }}
      >
        <Body size="small">
          {`From: ${network?.name}`}
        </Body>
      </Box>
      <Box
        sx={{
          paddingTop: 'base.spacing.x4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          columnGap: 'base.spacing.x4',
        }}
      >
        <TextInput
          testId="amount"
          sx={{ minWidth: 'base.spacing.x20', width: 'base.spacing.x40' }}
          value={bridgeAmount}
          onChange={(e) => handleBridgeAmountChange(e)}
          type="number"
        />
        <Select
          testId="select-token"
          sx={{
            minWidth: 'base.spacing.x20',
            width: 'base.spacing.x40',
          }}
          selectedOption={selectedTokenOption}
          onSelectChange={(o) => handleSelectToken(o)}
        >
          {tokenBalances.map((balance) => (
            <Option
              testId={`select-token-${balance.token.symbol}`}
              key={`${network?.chainId}-${balance.token.symbol}`}
              optionKey={balance.token.symbol}
            >
              <Option.Label>{balance.token.symbol}</Option.Label>
            </Option>
          ))}
        </Select>
      </Box>
      <Box
        sx={{
          paddingTop: 'base.spacing.x1',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        {tokenBalances.length === 0 && (
          <Body size="xSmall">You have no balances on this network</Body>
        )}
      </Box>
      <Box
        sx={{
          paddingTop: 'base.spacing.x4',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Body testId="bridge-to-network">
          {`To: ${toNetwork?.name}`}
        </Body>
        <Body testId="receive-text">
          You will receive:
          {' '}
          {bridgeAmount && selectedTokenOption
            ? `${bridgeAmount} ${selectedTokenOption.toString()}`
            : ''}
        </Body>
      </Box>
    </Box>
  );
}
