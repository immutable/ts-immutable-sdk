/* eslint-disable @typescript-eslint/no-explicit-any */
import {Button} from '@biom3/react'
import {ChainId, Checkout} from '@imtbl/checkout-sdk-web'
import { ConnectContext } from '../../context/ConnectContext';
import { useContext } from 'react';
import { ConnectWidgetViews } from '../../ConnectWidget';

export interface ChooseNetworkProps {
  updateView: (newView: ConnectWidgetViews, err?: any) => void;
}

export function ChooseNetwork (props:ChooseNetworkProps) {
  const { state } = useContext(ConnectContext);
  const { provider } = state;

  // todo: do we want to move this to context?
  const checkout:Checkout = new Checkout()

  const { updateView } = props

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
