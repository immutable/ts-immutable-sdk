import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  ERC20ItemRequirement,
  GasAmount,
  GasTokenType,
  ItemType,
  SmartCheckoutResult,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useCallback, useState } from 'react';
import { IMX_ADDRESS_ZKEVM } from '../../../lib/constants';
import { getL2ChainId } from '../../../lib/networkUtils';
import {
  Item, SaleErrorTypes, SmartCheckoutError, SmartCheckoutErrorTypes,
} from '../types';

type UseSmartCheckoutInput = {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
  items: Item[],
  amount: string,
  contractAddress: string,
};

const MAX_GAS_LIMIT = '30000000';

const getItemRequirements = (amount: string, spenderAddress: string, contractAddress: string)
: ERC20ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    contractAddress,
    spenderAddress,
    amount,
  },
];

const getGasEstimate = (): GasAmount => ({
  type: TransactionOrGasType.GAS,
  gasToken: {
    type: GasTokenType.NATIVE,
    limit: BigNumber.from(MAX_GAS_LIMIT),
  },
});

export const useSmartCheckout = ({
  checkout, provider, items, amount, contractAddress,
}: UseSmartCheckoutInput) => {
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<SmartCheckoutResult | undefined>(
    undefined,
  );
  const [smartCheckoutError, setSmartCheckoutError] = useState<SmartCheckoutError | undefined>(
    undefined,
  );

  const isUserFractionalBalanceBlocked = async (walletAddress: string) => {
    const chainId = getL2ChainId(checkout!.config);
    const balanceResponse = await checkout!.getAllBalances({ provider: provider!, walletAddress, chainId });
    const zero = BigNumber.from('0');

    const purchaseBalance = balanceResponse.balances.find((balance) => balance.token.address === contractAddress);
    if (!purchaseBalance) {
      return false;
    }
    const formattedAmount = parseUnits(amount, purchaseBalance.token.decimals);

    if (purchaseBalance.balance.gt(zero) && purchaseBalance.balance.lt(formattedAmount)) {
      return true;
    }

    const isPassport = !!(provider?.provider as any)?.isPassport;
    if (isPassport) {
      return false;
    }
    const imxBalance = balanceResponse.balances.find((balance) => balance.token.address === IMX_ADDRESS_ZKEVM);
    const imxBalanceAmount = imxBalance ? imxBalance.balance : BigNumber.from('0');
    if (imxBalanceAmount.gte(zero) && imxBalanceAmount.lt(BigNumber.from(MAX_GAS_LIMIT))) {
      return true;
    }
    return false;
  };

  const smartCheckout = useCallback(async () => {
    try {
      const signer = provider?.getSigner();
      const spenderAddress = await signer?.getAddress() || '';

      const userFractionalBalanceBlocked = await isUserFractionalBalanceBlocked(spenderAddress);
      if (userFractionalBalanceBlocked) {
        throw new Error(SmartCheckoutErrorTypes.FRACTIONAL_BALANCE_BLOCKED);
      }

      const itemRequirements = getItemRequirements(amount, spenderAddress, contractAddress);
      const gasEstimate = getGasEstimate();
      const res = await checkout?.smartCheckout(
        {
          provider: provider!,
          itemRequirements,
          transactionOrGasAmount: gasEstimate,
        },
      );
      if (!res) {
        throw new Error();
      }
      const result = { ...res };
      setSmartCheckoutResult(result);
      return result;
    } catch (err: any) {
      setSmartCheckoutError({
        type: SaleErrorTypes.SMART_CHECKOUT_ERROR,
        data: { error: err },
      });
    }
    return undefined;
  }, [checkout, provider, items, amount, contractAddress]);

  return {
    smartCheckout, smartCheckoutResult, smartCheckoutError,
  };
};
