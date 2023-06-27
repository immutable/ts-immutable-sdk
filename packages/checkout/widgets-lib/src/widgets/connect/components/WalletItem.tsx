import { WalletProviderName, WalletInfo } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface WalletProps {
  onWalletClick: (walletProvider: WalletProviderName) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;

  const walletText = wallets[wallet.walletProvider];
  const logo = {
    [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    // TODO: Fragments should contain more than one child - otherwise, there’s no need for a Fragment at all.
    // Consider checking !walletText and rendering a callback component instead, then it would make sense
    // to use a Fragment.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {walletText && (
        <MenuItem
          testId={`wallet-list-${wallet.walletProvider}`}
          size="medium"
          emphasized
          onClick={() => onWalletClick(wallet.walletProvider)}
        >
          <MenuItem.FramedLogo
            logo={logo[wallet.walletProvider] as any}
            sx={{
              width: 'base.icon.size.500',
              backgroundColor: 'base.color.translucent.emphasis.200',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.walletProvider].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon />
          <MenuItem.Caption>
            {wallets[wallet.walletProvider].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
}
