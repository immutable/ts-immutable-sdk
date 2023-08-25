import { MenuItem, LogoProps } from '@biom3/react';

import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';

export interface PaymentOptionProps {
  type: PrimaryRevenueWidgetViews;
  onClick: (type: PrimaryRevenueWidgetViews) => void;
}

export function PaymentOption(props: PaymentOptionProps) {
  const { type, onClick } = props;
  const { options } = text.views[PrimaryRevenueWidgetViews.PAYMENT_METHODS];
  const optionText = options[type];

  const logo: Record<string, LogoProps['logo']> = {
    [PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO]: 'PassportSymbol',
    [PrimaryRevenueWidgetViews.PAY_WITH_CARD]: 'ImmutableSymbol',
  };

  if (!optionText) return null;

  return (
    <MenuItem size="medium" emphasized onClick={() => onClick(type)}>
      <MenuItem.FramedLogo
        logo={logo[type]}
        sx={{
          width: 'base.icon.size.500',
          backgroundColor: 'base.color.translucent.emphasis.200',
          borderRadius: 'base.borderRadius.x2',
        }}
      />
      <MenuItem.Label size="medium">{optionText.heading}</MenuItem.Label>
      <MenuItem.IntentIcon />
      <MenuItem.Caption>{optionText.caption}</MenuItem.Caption>
    </MenuItem>
  );
}
