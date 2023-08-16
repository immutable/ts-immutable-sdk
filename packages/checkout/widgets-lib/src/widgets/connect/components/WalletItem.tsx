import { WalletProviderName, WalletInfo } from '@imtbl/checkout-sdk';
import { Box, MenuItem } from '@biom3/react';
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
    [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
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
          sx={{ marginBottom: 'base.spacing.x1' }}
        >
          <MenuItem.FramedLogo
            logo={logo[wallet.walletProvider] as any}
            sx={{
              minWidth: 'base.icon.size.500',
              padding: 'base.spacing.x1',
              backgroundColor: 'base.color.translucent.standard.100',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.walletProvider].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon />
          <MenuItem.Caption>
            {wallet.walletProvider === WalletProviderName.PASSPORT ? (
              <Box as="span" sx={{ c: 'base.gradient.1' }}>
                Recommended
              </Box>
            ) : null}
            {' '}
            {wallets[wallet.walletProvider].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
}
