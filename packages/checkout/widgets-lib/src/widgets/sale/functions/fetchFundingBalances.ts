import { BrowserProvider } from 'ethers';
import {
  Checkout, ItemBalance, TokenBalance, TransactionRequirement,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { compareStr } from '../../../lib/utils';
import {
  OrderQuoteCurrency,
  FundingBalance,
  FundingBalanceResult,
} from '../types';
import {
  getAlternativeFundingSteps,
  getERC20ItemRequirement,
  getFnToPushAndSortFundingBalances,
  getFundingBalances,
  getGasEstimate,
  processGasFreeBalances,
  wrapPromisesWithOnResolve,
} from './fetchFundingBalancesUtils';

const isTokenFee = (balance: ItemBalance): balance is TokenBalance => 'token' in balance && balance.token !== undefined;

export type FundingBalanceParams = {
  provider: BrowserProvider;
  checkout: Checkout;
  currencies: OrderQuoteCurrency[];
  baseCurrency: OrderQuoteCurrency;
  routingOptions: { bridge: boolean; onRamp: boolean; swap: boolean };
  getAmountByCurrency: (currency: OrderQuoteCurrency) => string;
  getIsGasless: () => boolean;
  onFundingBalance: (balances: FundingBalance[]) => void;
  onFundingRequirement: (
    fundingItemRequirement: TransactionRequirement
  ) => void;
  onComplete?: (balances: FundingBalance[]) => void;
  onUpdateGasFees?: (fees: TokenBalance) => void;
};

export const fetchFundingBalances = async (
  params: FundingBalanceParams,
): Promise<FundingBalanceResult[]> => {
  const {
    provider,
    checkout,
    currencies,
    baseCurrency,
    onFundingBalance,
    getAmountByCurrency,
    getIsGasless,
    onComplete,
    onFundingRequirement,
    onUpdateGasFees,
  } = params;

  const signer = await provider?.getSigner();
  const spenderAddress = (await signer?.getAddress()) || '';
  const environment = checkout.config.environment as Environment;

  const pushToFoundBalances = getFnToPushAndSortFundingBalances(baseCurrency);
  const updateFundingBalances = (balances: FundingBalance[] | null) => {
    if (Array.isArray(balances) && balances.length > 0) {
      onFundingBalance(
        pushToFoundBalances(processGasFreeBalances(balances, provider)),
      );
    }
  };

  const isBaseCurrency = (name: string) => compareStr(name, baseCurrency.name);

  const balancePromises: Promise<FundingBalanceResult>[] = currencies
    .map(async (currency) => {
      const amount = getAmountByCurrency(currency);

      if (!amount) {
        return null;
      }

      const itemRequirements = getERC20ItemRequirement(
        amount,
        spenderAddress,
        currency.address,
      );

      const transactionOrGasAmount = getIsGasless()
        ? undefined
        : getGasEstimate();

      const handleOnComplete = () => {
        onComplete?.(pushToFoundBalances([]));
      };

      const handleOnFundingRoute = (route) => {
        updateFundingBalances(getAlternativeFundingSteps([route], environment));
      };

      const smartCheckoutResult = await checkout.smartCheckout({
        provider,
        itemRequirements,
        transactionOrGasAmount,
        routingOptions: { bridge: false, onRamp: false, swap: true },
        fundingRouteFullAmount: true,
        onComplete: isBaseCurrency(currency.name)
          ? handleOnComplete
          : undefined,
        onFundingRoute: isBaseCurrency(currency.name)
          ? handleOnFundingRoute
          : undefined,
      });

      return { currency, smartCheckoutResult };
    })
    .filter(Boolean) as Promise<FundingBalanceResult>[];

  return await wrapPromisesWithOnResolve(
    balancePromises,
    ({ currency, smartCheckoutResult }) => {
      if (isBaseCurrency(currency.name)) {
        const fundingItemRequirement = smartCheckoutResult.transactionRequirements[0];
        onFundingRequirement(fundingItemRequirement);
      }

      if (smartCheckoutResult.sufficient) {
        updateFundingBalances(
          getFundingBalances(smartCheckoutResult, environment),
        );

        const feeRequirement = smartCheckoutResult.transactionRequirements.find((requirement) => requirement.isFee);

        if (feeRequirement && isTokenFee(feeRequirement.required) && onUpdateGasFees) {
          onUpdateGasFees(feeRequirement.required);
        }
      }
    },
  );
};
