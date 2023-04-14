/* eslint-disable @typescript-eslint/no-explicit-any */
import {Button} from '@biom3/react'
import {ConnectWidgetViews} from '../../ConnectWidget'
import {ChainId, Checkout} from '@imtbl/checkout-sdk-web'
import {Web3Provider} from '@ethersproject/providers'

export interface ChooseNetworkProps {
  updateView: (newView: ConnectWidgetViews, err?: any) => void;
  provider: Web3Provider|null;
}

export function ChooseNetwork (props:ChooseNetworkProps) {
  const checkout:Checkout = new Checkout()

  const { updateView, provider } = props

  async function connectPolygonClick() {
    try {
      if (!provider) {
        updateView(ConnectWidgetViews.FAIL, 'No wallet provider connected')
        return
      }
      await checkout.switchNetwork({ provider, chainId: ChainId.POLYGON });
      updateView(ConnectWidgetViews.SUCCESS)

    } catch (err:any) {
      updateView(ConnectWidgetViews.FAIL, err)
      return
    }

  }

  return (
    <div>
    <Button
      testId='network-zkevm'
      onClick={() => connectPolygonClick()}>Connect Polygon</Button>
    </div>
  )

}
