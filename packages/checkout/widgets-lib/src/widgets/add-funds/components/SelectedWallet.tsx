import { MouseEventHandler, ReactNode } from 'react';
import { EllipsizedText, MenuItem, MenuItemProps } from '@biom3/react';
import { EIP6963ProviderInfo } from '@imtbl/checkout-sdk';

const disabledStyles = {
  cursor: 'not-allowed',
  bg: 'base.color.translucent.inverse.800',
};

export interface SelectedWalletProps {
  children?: ReactNode;
  label: string;
  providerInfo?: Partial<EIP6963ProviderInfo & { address?: string }>;
  onClick: MouseEventHandler<HTMLSpanElement>;
  disabled?: boolean;
}

export function SelectedWallet({
  label,
  children,
  onClick,
  providerInfo,
  disabled,
}: SelectedWalletProps) {
  const selected = !!children && providerInfo?.rdns;
  const size: MenuItemProps['size'] = selected ? 'xSmall' : 'small';

  return (
    <MenuItem
      size={size}
      disabled={disabled}
      emphasized={!disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        py: selected ? 'base.spacing.x3' : undefined,
        ...(disabled ? disabledStyles : {}),
      }}
    >
      {!providerInfo?.icon && (
        <MenuItem.FramedIcon icon="Wallet" variant="bold" emphasized={false} />
      )}
      {providerInfo?.icon && (
        <MenuItem.FramedImage
          padded
          sx={{ mx: selected ? 'base.spacing.x2' : undefined }}
          use={<img src={providerInfo.icon} alt={providerInfo.name} />}
        />
      )}
      <MenuItem.Label>{label}</MenuItem.Label>
      {providerInfo?.name && (
        <MenuItem.Caption>
          {providerInfo?.name}
          {' • '}
          <EllipsizedText
            text={providerInfo.address ?? ''}
            sx={{ c: 'inherit', fontSize: 'inherit' }}
          />
        </MenuItem.Caption>
      )}
      <MenuItem.BottomSlot>{children}</MenuItem.BottomSlot>
    </MenuItem>
  );
}
