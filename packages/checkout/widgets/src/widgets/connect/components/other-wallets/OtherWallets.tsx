/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react'
import {ConnectionProviders, Checkout, ConnectResult} from '@imtbl/checkout-sdk-web'
import { ConnectWidgetViews } from '../../ConnectWidget'
import { Web3Provider } from '@ethersproject/providers'
import { ButtonWrapperStyle } from '../../ConnectStyles'

export interface OtherWalletProps {
  updateView: (newView: ConnectWidgetViews, err?: any) => void;
  updateProvider: (provider: Web3Provider) => void;
}

export function OtherWallets (props:OtherWalletProps) {
  const checkout:Checkout = new Checkout()

  const { updateView, updateProvider } = props

  async function metamaskClick() {

    let connectResult:ConnectResult

    try {
      connectResult = await checkout.connect({ providerPreference: ConnectionProviders.METAMASK });
    } catch (err:any) {
      updateView(ConnectWidgetViews.FAIL, err)
      return
    }
    updateProvider(connectResult.provider)
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
