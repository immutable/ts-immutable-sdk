import { MenuItem } from '@biom3/react';
import { ReactElement, useState } from 'react';
import { RawImage } from '../../../components/RawImage/RawImage';
import { EIP1193Provider, EIP6963ProviderDetail } from '../../../lib/provider';

export interface WalletItemProps<RC extends ReactElement | undefined = undefined> {
  testId: string;
  providerDetail: EIP6963ProviderDetail<EIP1193Provider>;
  onWalletItemClick: (providerDetail: EIP6963ProviderDetail<EIP1193Provider>) => Promise<void>;
  loading: boolean;
  rc?: RC;
}

export function WalletItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  testId,
  providerDetail,
  onWalletItemClick,
  loading,
}: WalletItemProps<RC>) {
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  return (
    <MenuItem
      rc={rc}
      testId={`${testId}-wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setShowLoadingIcon(true);
        // let the parent handle errors
        try {
          await onWalletItemClick(providerDetail);
        } finally {
          setShowLoadingIcon(false);
        }
      }}
      sx={{ position: 'relative' }}
    >
      <RawImage
        src={providerDetail.info.icon}
        alt={providerDetail.info.name}
        sx={{
          position: 'absolute',
          left: 'base.spacing.x3',
        }}
      />
      <MenuItem.Label size="medium" sx={{ marginLeft: '65px' }}>
        {providerDetail.info.name}
      </MenuItem.Label>
      {showLoadingIcon && (<MenuItem.StatefulButtCon state="loading" icon="Loading" />)}
    </MenuItem>
  );
}
