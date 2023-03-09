import { Button } from '@biom3/react'
import { ConnectionProviders, CheckoutSDK } from '@imtbl/checkout-sdk-web'
import { ConnectWidgetViews } from '../../ConnectWidget'
import { Web3Provider } from '@ethersproject/providers'
import { ButtonWrapperStyle } from '../../ConnectStyles'

export interface OtherWalletProps {
  updateView: Function,
  updateProvider: Function,
}

export function OtherWallets (props:OtherWalletProps) {
  const checkout:CheckoutSDK = new CheckoutSDK()

  const { updateView, updateProvider } = props
  
  async function metamaskClick() {

    let provider:Web3Provider|null

    try {
      provider = await checkout.connect({ providerPreference: ConnectionProviders.METAMASK });
    } catch (err:any) {
      updateView(ConnectWidgetViews.FAIL, err)
      return
    }
    updateProvider(provider)
    updateView(ConnectWidgetViews.CHOOSE_NETWORKS)
  }

    return (
      <div className="imtbl-other-wallets">
      <Button 
        testId='other-metamask'
        sx={ButtonWrapperStyle} onClick={metamaskClick}>MetaMask</Button>
      <Button 
        testId='other-walletconnect'
        onClick={() => updateView(ConnectWidgetViews.CHOOSE_NETWORKS)}>Wallet Connect</Button>
      </div>
    )
}
