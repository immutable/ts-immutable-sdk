import { ConnectionProviders, WalletInfo, WalletProviderName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface WalletProps {
  onWalletClick: (providerName: WalletProviderName) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;

  const walletText = wallets[wallet.providerName];
  const logo = {
    [ConnectionProviders.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    // TODO: Fragments should contain more than one child - otherwise, there’s no need for a Fragment at all.
    // Consider checking !walletText and rendering a callback component instead, then it would make sense
    // to use a Fragment.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {walletText && (
        <MenuItem
          testId={`wallet-list-${wallet.providerName}`}
          size="medium"
          emphasized
          onClick={() => onWalletClick(wallet.providerName)}
        >
          <MenuItem.FramedLogo
            logo={logo[wallet.providerName] as any}
            sx={{
              width: 'base.icon.size.500',
              backgroundColor: 'base.color.translucent.container.200',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.providerName].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon />
          <MenuItem.Caption>
            {wallets[wallet.providerName].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
}
