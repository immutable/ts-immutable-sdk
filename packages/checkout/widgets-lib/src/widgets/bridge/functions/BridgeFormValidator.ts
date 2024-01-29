import { GetBalanceResult } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';

export function validateToken(fromToken: GetBalanceResult | undefined): string {
  const { t } = useTranslation();
  if (!fromToken) return t('views.BRIDGE_FORM.validation.noTokenSelected');
  return '';
}

export function validateAmount(amount: string, balance?: string): string {
  const { t } = useTranslation();
  if (!amount || parseFloat(amount) === 0) return t('views.BRIDGE_FORM.validation.noAmountInputted');
  if (balance && Number(amount) > Number(balance)) return t('views.BRIDGE_FORM.validation.insufficientBalance');
  return '';
}
