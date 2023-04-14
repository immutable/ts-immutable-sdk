import {Body, Box, Option, OptionKey, Select, TextInput} from "@biom3/react";
import {ChainId, GetBalanceResult} from "@imtbl/checkout-sdk-web";
import {useEffect, useState} from "react";
import {Network} from "@imtbl/checkout-ui-types";
import { BridgeButton } from "./BridgeButton";
import { Web3Provider, TransactionResponse } from '@ethersproject/providers';
import { BridgeWidgetViews } from "../BridgeWidget";

interface BridgeFormProps {
  provider: Web3Provider;
  balances: GetBalanceResult[];
  chainId?: ChainId;
  selectedNetwork: OptionKey | undefined;
  onSelectedNetworkChange: (selectedOption: OptionKey) => void;
  toNetwork: string;
  nativeCurrencySymbol: string;
  defaultAmount?: string;
  defaultTokenAddress?:string;
  updateTransactionResponse: (transactionResponse: TransactionResponse) => void;
  updateView: (view: BridgeWidgetViews, err?: any) => void;
}

export const BridgeForm = (props: BridgeFormProps) => {
  const {
    provider,
    balances,
    chainId,
    selectedNetwork,
    onSelectedNetworkChange,
    toNetwork,
    updateTransactionResponse,
    updateView
  } = props;
  const { nativeCurrencySymbol, defaultAmount, defaultTokenAddress } = props;

  const [bridgeAmount, setBridgeAmount] = useState(defaultAmount || '0');
  const [selectedTokenOption, setSelectedTokenOption] = useState<OptionKey>()

  function handleBridgeAmountChange(event:any) {
    const value = event.target.value;
    setBridgeAmount(value);
  }

  function handleSelectToken (selectedOption: OptionKey){
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
    if(defaultTokenAddress){
      defaultToken = balances.find((balance) => balance.token.address === defaultTokenAddress);
    }
    if(!defaultToken) {
      defaultToken = balances.find((balance) => balance.token.symbol === nativeCurrencySymbol);
    }

    setSelectedTokenOption(defaultToken?.token.symbol as OptionKey);
  }, [balances, selectedNetwork, defaultTokenAddress, nativeCurrencySymbol])

  return(
    <Box sx={{paddingTop: 'base.spacing.x4'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', columnGap: 'base.spacing.x4'}}>
      <Body size={"small"}>From:</Body>
        <Select testId='select-network' selectedOption={selectedNetwork} onSelectChange={onSelectedNetworkChange}>
          <Option testId={`select-network-${Network.ETHEREUM}`} key={Network.ETHEREUM} optionKey={ChainId.ETHEREUM}>
            <Option.Label>{Network.ETHEREUM}</Option.Label>
          </Option>
          <Option testId={`select-network-${Network.POLYGON}`} key={Network.POLYGON} optionKey={ChainId.POLYGON}>
            <Option.Label>{Network.POLYGON}</Option.Label>
          </Option>
        </Select>
      </Box>
      <Box sx={{
        paddingTop: 'base.spacing.x4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 'base.spacing.x4',
        }}>
        <TextInput testId='amount' sx={{minWidth: 'base.spacing.x20', width: 'base.spacing.x40'}} value={bridgeAmount} onChange={handleBridgeAmountChange} type='number'></TextInput>
          <Select testId='select-token' sx={{
            minWidth: 'base.spacing.x20',
            width: 'base.spacing.x40'
            }}
            selectedOption={selectedTokenOption}
            onSelectChange={handleSelectToken}>
              {balances.map((balance)=>{
                  return (
                      <Option testId={`select-token-${balance.token.symbol}`} key={`${chainId}-${balance.token.symbol}`} optionKey={balance.token.symbol}>
                          <Option.Label>{balance.token.symbol}</Option.Label>
                      </Option>
                  )
              })}
          </Select>
      </Box>
      <Box sx={{
        paddingTop: 'base.spacing.x1',
        display: 'flex', justifyContent: 'flex-start'}}>
        {!selectedTokenOption && <Body size={'xSmall'}>You have no balances on this network</Body>}
      </Box>
      <Box sx={{paddingTop: 'base.spacing.x4', display: 'flex', flexDirection: 'column'}}>
        <Body testId="bridge-to-network">To: {toNetwork}</Body>
        <Body testId="receive-text">You will receive: {bridgeAmount && selectedTokenOption ? `${bridgeAmount} ${selectedTokenOption.toString()}`: ''}</Body>
      </Box>
      <BridgeButton
        provider={provider}
        amount={bridgeAmount}
        balance={balances.find((balance) => balance.token.symbol === selectedTokenOption)}
        fromNetwork={selectedNetwork}
        updateTransactionResponse={updateTransactionResponse}
        updateView={updateView}
      />
    </Box>
  )
};