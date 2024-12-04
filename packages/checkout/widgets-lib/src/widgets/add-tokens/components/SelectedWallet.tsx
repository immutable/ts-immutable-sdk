import { MouseEventHandler, ReactElement, ReactNode } from 'react';
import {
  EllipsizedText,
  MenuItem,
  MenuItemProps,
  Sticker,
  SxProps, Tooltip,
} from '@biom3/react';
import { EIP6963ProviderInfo } from '@imtbl/checkout-sdk';

const disabledStyles = {
  cursor: 'not-allowed',
  bg: 'base.color.translucent.inverse.800',
};
export type ChainInfo = {
  name: string;
  iconUrl: string;
};

export interface SelectedWalletProps {
  children?: ReactNode;
  label: string;
  caption?: string;
  providerInfo?: Partial<EIP6963ProviderInfo & { address?: string }>;
  chainInfo?: ChainInfo;
  onClick: MouseEventHandler<HTMLSpanElement>;
  disabled?: boolean;
  sx?: SxProps;
}

export function SelectedWallet({
  label,
  caption,
  children,
  onClick,
  providerInfo,
  chainInfo,
  disabled,
  sx,
}: SelectedWalletProps) {
  const selected = !!children && providerInfo?.rdns;
  const size: MenuItemProps['size'] = selected ? 'xSmall' : 'small';

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

    if (chainInfo && providerInfo?.rdns) {
      return (
        <Sticker position={{ x: 'rightInside', y: 'bottomInside' }}>
          <Tooltip size="small">
            <Tooltip.Target>
              <Sticker.FramedImage
                use={<img src={chainInfo.iconUrl} alt={chainInfo.name} />}
                size="xSmall"
                sx={{ bottom: 'base.spacing.x2', right: 'base.spacing.x2' }}
              />
            </Tooltip.Target>
            <Tooltip.Content id="route_tooltip_content">
              {chainInfo.name}
            </Tooltip.Content>
          </Tooltip>
          {menuItemImage}
        </Sticker>
      );
    }
    return menuItemImage;
  };

  return (
    <MenuItem
      size={size}
      disabled={disabled}
      emphasized={!disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        py: selected ? 'base.spacing.x3' : undefined,
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

      <MenuItem.BottomSlot>{children}</MenuItem.BottomSlot>
    </MenuItem>
  );
}
