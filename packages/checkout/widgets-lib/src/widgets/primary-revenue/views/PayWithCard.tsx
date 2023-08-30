import { Environment } from '@imtbl/config';

import { OnRampWidget } from '../../on-ramp/OnRampWidget';
import { WidgetTheme } from '../../../lib';

export function PayWithCard() {
  // FIXME: Render transak single NFT checkout widget instead of on ramp
  return (
    <OnRampWidget
      config={{
        theme: WidgetTheme.LIGHT,
        environment: Environment.SANDBOX,
        isBridgeEnabled: true,
        isSwapEnabled: true,
        isOnRampEnabled: true,
      }}
      params={{
        amount: '100',
      }}
    />
  );
}
