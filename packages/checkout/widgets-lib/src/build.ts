/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ImmutableConnect } from './widgets/connect/ConnectWebComponent';
import { ImmutableSwap } from './widgets/swap/SwapWebComponent';
import { ImmutableWallet } from './widgets/wallet/WalletWebComponent';
import { ImmutableBridge } from './widgets/bridge/BridgeWebComponent';
import { ImmutablePrimaryRevenue } from './widgets/primary-revenue/PrimaryRevenueWebComponent';
import { ImmutableOnRamp } from './widgets/on-ramp/OnRampWebComponent';

customElements.get('imtbl-connect')
  || customElements.define('imtbl-connect', ImmutableConnect);
customElements.get('imtbl-wallet')
  || customElements.define('imtbl-wallet', ImmutableWallet);
customElements.get('imtbl-swap')
  || customElements.define('imtbl-swap', ImmutableSwap);
customElements.get('imtbl-bridge')
  || customElements.define('imtbl-bridge', ImmutableBridge);
customElements.get('imtbl-primary-revenue')
  || customElements.define('imtbl-primary-revenue', ImmutablePrimaryRevenue);
customElements.get('imtbl-onramp')
|| customElements.define('imtbl-onramp', ImmutableOnRamp);
