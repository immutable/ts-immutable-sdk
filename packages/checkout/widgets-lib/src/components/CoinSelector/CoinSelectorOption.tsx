import { MenuItem, AllIconKeys } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';

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
  const [iconError, setIconError] = useState<boolean>(false);
  const { t } = useTranslation();
  const tokenUrl = useMemo(
    () => ((!icon || iconError) ? defaultTokenImage : icon),
    [icon, iconError, defaultTokenImage],
  );

  return (
    <MenuItem testId={`${testId}-coin-selector__option-${id}`} emphasized size="small" onClick={onClick}>
      <MenuItem.FramedImage
        circularFrame
        use={(
          <img
            src={tokenUrl}
            alt={name}
            onError={() => setIconError(true)}
          />
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
