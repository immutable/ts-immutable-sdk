import { ConnectionProviders, WalletInfo } from "@imtbl/checkout-sdk-web";
import { MenuItem } from "@biom3/react";
import { text } from "../../../../resources/text/textConfig";

export interface WalletProps {
  onWalletClick: (providerPreference: ConnectionProviders)=>void;
  logoName: string;
  wallet: WalletInfo;
}
export const WalletItem = (props:WalletProps)=>{
  const {wallet, onWalletClick} = props;
  const { wallets } = text;
  console.log(wallets[wallet.connectionProvider]);

  return (
    <MenuItem
    testId={`wallet-list-${wallet.connectionProvider}`}
    size="medium"
    emphasized={true}
    onClick={() => onWalletClick(wallet.connectionProvider)}
  >
    <MenuItem.FramedLogo
      logo="MetaMaskSymbol"
      sx={{
        width: 'base.icon.size.500',
        backgroundColor: 'base.color.translucent.container.200',
        borderRadius: 'base.borderRadius.x2',
      }}
    />
    <MenuItem.Label size="medium">
      {wallet.name}
    </MenuItem.Label>
    <MenuItem.IntentIcon></MenuItem.IntentIcon>
    <MenuItem.Caption>
      {wallet.description}
    </MenuItem.Caption>
  </MenuItem>)
}