import { ConnectionProviders, WalletInfo } from '@imtbl/checkout-sdk-web';
import { MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface WalletProps {
  onWalletClick: (providerPreference: ConnectionProviders) => void;
  wallet: WalletInfo;
}
export const WalletItem = (props: WalletProps) => {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;
  console.log(wallets[wallet.connectionProvider]);

  const walletText = wallets[wallet.connectionProvider];
  const Logo = {
    [ConnectionProviders.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    <>
      {walletText && (
        <MenuItem
          testId={`wallet-list-${wallet.connectionProvider}`}
          size="medium"
          emphasized
          onClick={() => onWalletClick(wallet.connectionProvider)}
        >
          <MenuItem.FramedLogo
            logo={Logo[wallet.connectionProvider] as any}
            sx={{
              width: 'base.icon.size.500',
              backgroundColor: 'base.color.translucent.container.200',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.connectionProvider].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon></MenuItem.IntentIcon>
          <MenuItem.Caption>
            {wallets[wallet.connectionProvider].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
};
