import { Button } from '@biom3/react'
import { ButtonWrapperStyle } from '../../ConnectStyles'
import { ConnectWidgetViews } from '../../ConnectWidget'

export interface ConnectWalletProps {
  updateView: Function
}

export function ConnectWallet (props:ConnectWalletProps) {

  const { updateView } = props

    return (
      <div>
      <Button 
        testId='connect-passport'
        sx={ButtonWrapperStyle} 
        onClick={() => updateView(ConnectWidgetViews.PASSPORT)}>Passport</Button>
      <Button 
        testId='connect-other'
        onClick={() => updateView(ConnectWidgetViews.OTHER_WALLETS)}>Other Wallets</Button>
      </div>
    )
}
