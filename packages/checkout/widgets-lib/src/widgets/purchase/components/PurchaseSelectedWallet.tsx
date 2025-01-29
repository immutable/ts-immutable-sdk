import {
  ButtCon,
  EllipsizedText,
  MenuItem,
  MenuItemProps,
  SxProps,
} from '@biom3/react';
import { EIP6963ProviderInfo } from '@imtbl/checkout-sdk';
import { MouseEventHandler, ReactElement, ReactNode } from 'react';

const disabledStyles = {
  cursor: 'not-allowed',
  bg: 'base.color.translucent.inverse.800',
};
export type ChainInfo = {
  name: string;
  iconUrl: string;
};

export interface PurchaseSelectedWalletProps {
  children?: ReactNode;
  label: string;
  caption?: string;
  providerInfo?: Partial<EIP6963ProviderInfo & { address?: string }>;
  onClick: MouseEventHandler<HTMLSpanElement>;
  disabled?: boolean;
  sx?: SxProps;
  size?: MenuItemProps['size'];
}

export function PurchaseSelectedWallet({
  label,
  caption,
  children,
  onClick,
  providerInfo,
  disabled,
  sx,
  size = 'small',
}: PurchaseSelectedWalletProps) {
  const selected = !!children && providerInfo?.rdns;

  const getMenuItemImage = () => {
    const menuItemImage = !providerInfo?.icon ? (
      <MenuItem.FramedIcon icon="Wallet" variant="bold" emphasized={false} />
    ) : (
      ((
        <MenuItem.FramedImage
          padded
          sx={{ mx: selected ? 'base.spacing.x2' : undefined }}
          use={<img src={providerInfo.icon} alt={providerInfo.name} />}
        />
      ) as ReactElement)
    );

    return menuItemImage;
  };

  return (
    <MenuItem
      size={size}
      disabled={disabled}
      emphasized={!disabled}
      onClick={(providerInfo?.address || disabled) ? undefined : onClick}
      sx={{
        py: selected ? 'base.spacing.x1' : undefined,
        ...(disabled ? disabledStyles : {}),
        ...sx,
      }}
    >
      {getMenuItemImage()}
      <MenuItem.Label>{label}</MenuItem.Label>
      {providerInfo?.name ? (
        <MenuItem.Caption>
          {providerInfo?.name}
          {' • '}
          <EllipsizedText
            text={providerInfo.address ?? ''}
            sx={{ c: 'inherit', fontSize: 'inherit' }}
          />
        </MenuItem.Caption>
      ) : (
        <MenuItem.Caption>{caption}</MenuItem.Caption>
      )}

      {children && (<MenuItem.BottomSlot>{children}</MenuItem.BottomSlot>
      )}
      {providerInfo?.address && (
      <ButtCon
        icon="Edit"
        size="small"
        variant="tertiary"
        onClick={onClick}
      />
      )}
    </MenuItem>
  );
}
