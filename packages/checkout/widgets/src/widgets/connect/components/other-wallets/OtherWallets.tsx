/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react'
import {ConnectionProviders} from '@imtbl/checkout-sdk-web'
import { ButtonWrapperStyle } from '../../ConnectStyles'
import { Actions, ConnectContext } from '../../context/ConnectContext'
import { useContext } from 'react'
import { ConnectWidgetViews } from '../../ConnectWidget'

export interface OtherWalletProps {
  updateView: (newView: ConnectWidgetViews, err?: any) => void;
}

export function OtherWallets (props:OtherWalletProps) {
  const { state, dispatch } = useContext(ConnectContext);
  const { checkout } = state;
  const { updateView } = props

  async function metamaskClick() {
    try {
      if (!checkout) return;
      const connectResult = await checkout.connect({ providerPreference: ConnectionProviders.METAMASK });
      dispatch({
        payload: {
          type: Actions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });
    } catch (err:any) {
      updateView(ConnectWidgetViews.FAIL, err)
      return
    }
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
