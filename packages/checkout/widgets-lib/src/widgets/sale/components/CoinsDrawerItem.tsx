import { Heading, MenuItem, prettyFormatNumber } from '@biom3/react';
import {
  Fee,
  FundingStepType,
  ItemType,
  TransactionRequirement,
} from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react';
import { BigNumber, utils } from 'ethers';
import { useSaleContext } from '../context/SaleContextProvider';
import { FundingBalance } from '../types';

type FeesBySymbol = Record<
string,
{ amount: BigNumber; formattedAmount: string; symbol: string }
>;
const calculateFeeAmount = (balance: FundingBalance): FeesBySymbol => {
  let fees: Fee[] = [];
  if (balance.type === FundingStepType.SWAP) {
    fees = [
      balance.fees.approvalGasFee,
      balance.fees.swapGasFee,
      ...balance.fees.swapFees,
    ];
  }

  const totalFees = fees
    .filter((fee) => fee.amount.gt(0) && fee.token)
    .reduce((acc, { amount, token }) => {
      if (!token) return acc;

      if (acc[token.symbol]) {
        const newAmount = acc[token.symbol].amount.add(amount);
        return {
          ...acc,
          [token.symbol]: {
            ...acc[token.symbol],
            amount: newAmount,
            formattedAmount: utils.formatUnits(newAmount, token.decimals),
          },
        };
      }

      if (token.symbol) {
        return {
          ...acc,
          [token.symbol]: {
            amount,
            symbol: token.symbol,
            formattedAmount: utils.formatUnits(amount, token.decimals),
          },
        };
      }

      return acc;
    }, {} as FeesBySymbol);

  return totalFees;
};

export interface CoinDrawerItemProps<
  RC extends ReactElement | undefined = undefined,
> {
  rc?: RC;
  balance: FundingBalance;
  conversions: Map<string, number>;
  selected: boolean;
  transactionRequirement?: TransactionRequirement;
  onClick: () => void;
}

export function CoinsDrawerItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  balance,
  conversions,
  selected,
  transactionRequirement,
  onClick,
}: CoinDrawerItemProps<RC>) {
  const { t } = useTranslation();
  const {
    environment,
    config: { theme },
  } = useSaleContext();

  const { token, userBalance, fundsRequired } = balance.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
    conversions,
    '',
  );
  const fees = Object.entries(calculateFeeAmount(balance));

  const menuProps = {
    onClick,
    selected,
  };

  return (
    <MenuItem
      rc={rc}
      sx={{ mb: 'base.spacing.x1' }}
      size="medium"
      emphasized
      {...menuProps}
    >
      <MenuItem.FramedImage
        circularFrame
        alt={token.name}
        imageUrl={token.icon}
        defaultImageUrl={getDefaultTokenImage(environment, theme)}
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={
          fiatAmount
            ? t('views.ORDER_SUMMARY.currency.fiat', { amount: fiatAmount })
            : undefined
        }
        price={tokenValueFormat(userBalance.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {token.symbol}
      </MenuItem.Label>
      <MenuItem.Caption>
        {t(
          `views.ORDER_SUMMARY.coinsDrawer.stepType${
            transactionRequirement?.sufficient ? '.' : '.delta.'
          }${balance.type}`,
          {
            required: {
              symbol:
                transactionRequirement?.current.type !== ItemType.ERC721
                && transactionRequirement?.current.token.symbol,
              amount: prettyFormatNumber(
                tokenValueFormat(
                  transactionRequirement?.current.formattedBalance || 0,
                ),
              ),
            },
            symbol: balance.fundingItem.token.symbol,
            amount: prettyFormatNumber(
              tokenValueFormat(fundsRequired.formattedAmount),
            ),
          },
        )}
        {fees.length > 0 && ' | '}
        {fees.length > 0
          && fees.map(([symbol, { formattedAmount }]) => (
            <span key={symbol}>
              {t('views.ORDER_SUMMARY.coinsDrawer.fee', {
                symbol,
                amount: prettyFormatNumber(tokenValueFormat(formattedAmount)),
              })}
              &nbsp;
            </span>
          ))}
      </MenuItem.Caption>
    </MenuItem>
  );
}
