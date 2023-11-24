import { WalletProviderName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface BridgeWalletProps {
  walletProviderName: WalletProviderName
  onWalletClick: (walletProviderName: WalletProviderName) => void;
}
export function BridgeWalletItem(props: BridgeWalletProps) {
  const { walletProviderName, onWalletClick } = props;
  const { wallets } = text;

  const logo = {
    [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
    [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    <MenuItem
      testId={`wallet-list-${walletProviderName}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(walletProviderName)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedLogo
        logo={logo[walletProviderName] as any}
        sx={{
          minWidth: 'base.icon.size.500',
          padding: 'base.spacing.x1',
          backgroundColor: 'base.color.translucent.standard.100',
          borderRadius: 'base.borderRadius.x2',
        }}
      />
      <MenuItem.Label size="medium">
        {wallets[walletProviderName].heading}
      </MenuItem.Label>
    </MenuItem>
  );
}
