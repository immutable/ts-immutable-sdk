import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, PopulatedTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { CheckoutConfiguration } from '../config';
import { DEFAULT_TOKEN_DECIMALS, WRAPPED_IMX_ADDRESS, WrappedIMXABI } from '../env';
import { sendTransaction } from '../transaction';
import { WrapDirection, WrapResult } from '../types/wrap';

const prepareTransaction = (
  transaction: TransactionRequest,
  isGasFree: boolean = false,
) => ({
  ...transaction,
  gasPrice: isGasFree ? BigNumber.from(0) : undefined,
});

const wrap = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  amount: string,
  direction: WrapDirection,
): Promise<WrapResult> => {
  const wrappedIMXContract = new Contract(
    WRAPPED_IMX_ADDRESS[config.environment],
    WrappedIMXABI,
    web3Provider.getSigner(),
  );

  let transaction: PopulatedTransaction;
  const transactionAmount = parseUnits(amount, DEFAULT_TOKEN_DECIMALS);

  if (direction === WrapDirection.WRAP) {
    transaction = await wrappedIMXContract.populateTransaction.deposit();
    transaction.value = transactionAmount;
  } else {
    transaction = await wrappedIMXContract.populateTransaction.withdraw(
      transactionAmount.toString(),
    );
  }

  const response = await sendTransaction(
    web3Provider,
    prepareTransaction(transaction, (web3Provider.provider as any).isPassport),
  );

  const receipt = await response.transactionResponse.wait();

  return {
    receipt,
    transaction: response.transactionResponse,
  };
};

export { wrap };
