import { MenuItem, AllIconKeys } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { TokenImage } from '../TokenImage/TokenImage';

export interface CoinSelectorOptionProps {
  testId?: string;
  id: string;
  name: string;
  icon?: AllIconKeys | string;
  defaultTokenImage: string;
  symbol: string;
  onClick?: () => void
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
}

export function CoinSelectorOption({
  onClick, icon, name, symbol, balance, defaultTokenImage, testId, id,
}: CoinSelectorOptionProps) {
  const { t } = useTranslation();

  return (
    <MenuItem testId={`${testId}-coin-selector__option-${id}`} emphasized size="small" onClick={onClick}>
      <MenuItem.FramedImage
        circularFrame
        use={(
          <TokenImage src={icon} name={name} defaultImage={defaultTokenImage} />
        )}
      />

      <MenuItem.Label>{name}</MenuItem.Label>
      <MenuItem.Caption>{symbol}</MenuItem.Caption>
      {
        balance && (
          <MenuItem.PriceDisplay
            fiatAmount={`${t('drawers.coinSelector.option.fiatPricePrefix')}${balance.formattedFiatAmount}`}
            price={balance.formattedAmount}
          />
        )
      }
    </MenuItem>
  );
}
