import { Body, Box } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { BalanceItem } from '../BalanceItem/BalanceItem';
import { tokenBalanceListStyle, noTokensStyle } from './TokenBalanceListStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { isNativeToken } from '../../../../lib/utils';
import { ZERO_BALANCE_STRING } from '../../../../lib';

const filterZeroBalances = (balanceInfoItems: BalanceInfo[]) => balanceInfoItems.filter(
  (balance) => balance.balance !== ZERO_BALANCE_STRING || isNativeToken(balance.address),
);

interface TokenBalanceListProps {
  balanceInfoItems: BalanceInfo[];
  theme: WidgetTheme;
  bridgeToL2OnClick: (address?: string) => void;
}

export function TokenBalanceList({
  balanceInfoItems,
  theme,
  bridgeToL2OnClick,
}: TokenBalanceListProps) {
  const { t } = useTranslation();
  const filteredBalances = filterZeroBalances(balanceInfoItems);

  return (
    <Box sx={tokenBalanceListStyle}>
      {filteredBalances.length === 0
      && (
      <Box sx={noTokensStyle}>
        <Body testId="no-tokens-found">{t('views.WALLET_BALANCES.tokenBalancesList.noTokensFound')}</Body>
      </Box>
      )}
      {filteredBalances.map((balance) => (
        <BalanceItem
          key={balance.id}
          balanceInfo={balance}
          bridgeToL2OnClick={bridgeToL2OnClick}
          theme={theme}
        />
      ))}
    </Box>
  );
}
