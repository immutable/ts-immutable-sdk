/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react'
import { useContext } from 'react';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';
import { ButtonWrapperStyle } from '../../ConnectStyles'
import { ConnectWidgetViews } from '../../../../context/ConnectViewContextTypes';

export function ConnectWallet () {
  const { viewDispatch } = useContext(ViewContext);

  const dispatch = (type: ConnectWidgetViews.PASSPORT | ConnectWidgetViews.OTHER_WALLETS) => viewDispatch({
    payload: {
      type: ViewActions.UPDATE_VIEW,
      view: { type }
    }
  });

  return (
    <div>
    <Button 
      testId='connect-passport'
      sx={ButtonWrapperStyle} 
      onClick={() => dispatch(ConnectWidgetViews.PASSPORT)}>Passport</Button>
    <Button 
      testId='connect-other'
      onClick={() => dispatch(ConnectWidgetViews.OTHER_WALLETS)}>Other Wallets</Button>
    </div>
  )
}
