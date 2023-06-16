/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ImmutableConnect } from './widgets/connect/ConnectWebComponent';
import { ImmutableSwap } from './widgets/swap/SwapWebComponent';
import { ImmutableWallet } from './widgets/wallet/WalletWebComponent';
import { ImmutableBridge } from './widgets/bridge/BridgeWebComponent';

customElements.get('imtbl-connect')
  || customElements.define('imtbl-connect', ImmutableConnect);
customElements.get('imtbl-wallet')
  || customElements.define('imtbl-wallet', ImmutableWallet);
customElements.get('imtbl-swap')
  || customElements.define('imtbl-swap', ImmutableSwap);
customElements.get('imtbl-bridge')
  || customElements.define('imtbl-bridge', ImmutableBridge);
