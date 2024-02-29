import { MenuItem } from '@biom3/react';
import { ReactElement, useState } from 'react';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { EIP1193Provider } from 'mipd';
import { RawImage } from '../../../components/RawImage/RawImage';

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
    >
      <RawImage src={providerDetail.info.icon} alt={providerDetail.info.name} sx={{ position: 'absolute' }} />
      <MenuItem.Label size="medium" sx={{ marginLeft: '65px' }}>
        {providerDetail.info.name}
      </MenuItem.Label>
      {showLoadingIcon && (<MenuItem.StatefulButtCon state="loading" icon="Loading" />)}
    </MenuItem>
  );
}
