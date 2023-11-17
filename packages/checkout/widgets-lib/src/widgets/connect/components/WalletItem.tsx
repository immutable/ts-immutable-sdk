import { WalletProviderName, WalletInfo } from '@imtbl/checkout-sdk';
import { Box, MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface WalletProps {
  onWalletClick: (walletProviderName: WalletProviderName) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;

  const walletText = wallets[wallet.walletProviderName];
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
          testId={`wallet-list-${wallet.walletProviderName}`}
          size="medium"
          emphasized
          onClick={() => onWalletClick(wallet.walletProviderName)}
          sx={{ marginBottom: 'base.spacing.x1' }}
        >
          <MenuItem.FramedLogo
            logo={logo[wallet.walletProviderName] as any}
            sx={{
              minWidth: 'base.icon.size.500',
              padding: 'base.spacing.x1',
              backgroundColor: 'base.color.translucent.standard.100',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.walletProviderName].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon />
          <MenuItem.Caption>
            {wallet.walletProviderName === WalletProviderName.PASSPORT ? (
              <Box rc={<span />} sx={{ c: 'base.gradient.1' }}>
                {wallets[wallet.walletProviderName].accentText}
              </Box>
            ) : null}
            {' '}
            {wallets[wallet.walletProviderName].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
}
