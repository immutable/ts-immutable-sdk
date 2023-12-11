import { Web3Provider } from '@ethersproject/providers';
import { useContext } from 'react';
import { Transactions as CommonTransactions } from '../../../components/Transactions/Index';
import { XBridgeContext } from '../context/XBridgeContext';

interface TransactionsProps {
  globalWeb3Provider: Web3Provider | undefined;
}

export function Transactions({ globalWeb3Provider }: TransactionsProps) {
  const { bridgeState: { web3Provider, checkout } } = useContext(XBridgeContext);
  return (
    <CommonTransactions
      provider={web3Provider ?? globalWeb3Provider}
      checkout={checkout}
    />
  );
}
