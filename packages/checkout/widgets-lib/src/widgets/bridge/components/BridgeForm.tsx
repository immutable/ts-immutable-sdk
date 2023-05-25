import {
  Body, Box, Button, Option, OptionKey, Select, TextInput,
} from '@biom3/react';
import { GetBalanceResult } from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { BridgeContext } from '../context/BridgeContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { BridgeFormContext } from '../context/BridgeFormContext';

interface BridgeFormProps {
  defaultAmount?: string;
  defaultTokenAddress?: string;
  updateTransactionResponse: (transactionResponse: TransactionResponse) => void;
}

export function BridgeForm(props: BridgeFormProps) {
  const { bridgeState } = useContext(BridgeContext);
  const {
    checkout, network, tokenBalances, toNetwork,
  } = bridgeState;
  const { defaultAmount, defaultTokenAddress, updateTransactionResponse } = props;

  const { bridgeFormState: { bridgeFromAmount, bridgeFromToken } } = useContext(BridgeFormContext);

  const { viewDispatch } = useContext(ViewContext);
  const { bridgeState: { provider } } = useContext(BridgeContext);

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

  const isButtonDisabled = (): boolean => {
    if (!bridgeFromAmount || !bridgeFromToken) return true;

    return false;
  };

  const getUnsignedTransaction = () => ({
    // get the bridge transaction
    // Bridge.getBridgeTx(...)
    nonce: '0x00', // ignored by MetaMask
    gasPrice: '0x000', // customizable by user during MetaMask confirmation.
    gasLimit: '0x000', // customizable by user during MetaMask confirmation.
    to: '', // To address.
    from: '', // User's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: '0x000', // Optional, but used for defining smart contract creation and interaction.
    chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  });

  const submitBridge = useCallback(async () => {
    if (!checkout || !provider) return;

    // get unsigned transaction from the bridge/exchange sdk
    const transaction = getUnsignedTransaction();
    try {
      const response = await checkout.sendTransaction({
        provider,
        transaction,
      });
      updateTransactionResponse(response.transactionResponse);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    } catch (err: any) {
      // TODO: fix this with fail view... always succeeed for now
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    }
  }, [checkout]);

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
      <Button
        testId="bridge-button"
        disabled={isButtonDisabled()}
        variant={isButtonDisabled() ? 'tertiary' : 'primary'}
        onClick={submitBridge}
      >
        Bridge
      </Button>
    </Box>
  );
}
