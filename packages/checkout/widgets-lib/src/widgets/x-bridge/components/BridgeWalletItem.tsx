import { WalletProviderName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { useState } from 'react';
import { text } from '../../../resources/text/textConfig';
import { walletItemLogoStyles } from './BridgeWalletItemStyles';

export interface BridgeWalletProps {
  testId: string;
  walletProviderName: WalletProviderName
  onWalletClick: (walletProviderName: WalletProviderName) => void;
  loading: boolean;
  setLoading: (loading:boolean) => void;
}
export function BridgeWalletItem({
  testId,
  walletProviderName,
  onWalletClick,
  loading,
  setLoading,
}: BridgeWalletProps) {
  const { wallets } = text;
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  const logo = {
    [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
    [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    <MenuItem
      testId={`${testId}-wallet-list-${walletProviderName.toLowerCase()}`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        setShowLoadingSpinner(true);
        try {
          await onWalletClick(walletProviderName);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err);
        } finally {
          setShowLoadingSpinner(true);
          setLoading(false);
        }
      }}
    >
      <MenuItem.FramedLogo
        logo={logo[walletProviderName] as any}
        sx={walletItemLogoStyles}
      />
      <MenuItem.Label size="medium">
        {wallets[walletProviderName].heading}
      </MenuItem.Label>
      {showLoadingSpinner && (<MenuItem.StatefulButtCon state="loading" icon="Loading" />)}
    </MenuItem>
  );
}
