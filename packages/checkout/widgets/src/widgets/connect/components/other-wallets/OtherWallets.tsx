/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react'
import {ConnectionProviders, Checkout, ConnectResult} from '@imtbl/checkout-sdk-web'
import { ButtonWrapperStyle } from '../../ConnectStyles'
import { Actions, ConnectContext } from '../../context/ConnectContext'
import { useContext } from 'react'
import { ConnectWidgetViews } from '../../ConnectWidget'

export interface OtherWalletProps {
  updateView: (newView: ConnectWidgetViews, err?: any) => void;
}

export function OtherWallets (props:OtherWalletProps) {
  const { dispatch } = useContext(ConnectContext);

  // todo: maybe move checkout onto context
  const checkout:Checkout = new Checkout()

  const { updateView } = props

  async function metamaskClick() {

    let connectResult:ConnectResult

    try {
      connectResult = await checkout.connect({ providerPreference: ConnectionProviders.METAMASK });
    } catch (err:any) {
      updateView(ConnectWidgetViews.FAIL, err)
      return
    }

    dispatch({
      payload: {
        type: Actions.SET_PROVIDER,
        provider: connectResult.provider,
      },
    });

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
