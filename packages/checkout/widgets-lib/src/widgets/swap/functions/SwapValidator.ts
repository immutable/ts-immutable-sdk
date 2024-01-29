import { TokenInfo } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';

export function validateFromToken(fromToken?: TokenInfo): string {
  const { t } = useTranslation();
  if (!fromToken) return t('views.SWAP.validation.noFromTokenSelected');
  return '';
}

export function validateFromAmount(amount: string, balance?: string): string {
  const { t } = useTranslation();
  if (!amount || parseFloat(amount) === 0) return t('views.SWAP.validation.noAmountInputted');
  if (balance && Number(amount) > Number(balance)) return t('views.SWAP.validation.insufficientBalance');
  return '';
}

export function validateToToken(toToken?: TokenInfo): string {
  const { t } = useTranslation();
  if (!toToken) return t('views.SWAP.validation.noToTokenSelected');
  return '';
}

export function validateToAmount(amount: string): string {
  const { t } = useTranslation();
  if (!amount || parseFloat(amount) === 0) return t('views.SWAP.validation.noAmountInputted');
  return '';
}
