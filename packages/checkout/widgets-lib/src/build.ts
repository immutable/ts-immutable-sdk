/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ImmutableConnect } from './widgets/connect/ConnectWebComponent';
import { ImmutableSwap } from './widgets/swap/SwapWebComponent';
import { ImmutableWallet } from './widgets/wallet/WalletWebComponent';
import { ImmutableBridge } from './widgets/bridge/BridgeWebComponent';
import { ImmutableDiExample } from './widgets/examples/dependency-injection/DiExampleWebComponent';
import { ImmutableBuy } from './widgets/buy/BuyWebComponent';
import { ImmutableTransitionExample } from './widgets/examples/transition/TransitionExampleWebComponent';
import { ImmutableOuterExample } from './widgets/examples/connection-required/outer-widget/OuterWidgetWebComponent';

customElements.get('imtbl-connect')
  || customElements.define('imtbl-connect', ImmutableConnect);
customElements.get('imtbl-wallet')
  || customElements.define('imtbl-wallet', ImmutableWallet);
customElements.get('imtbl-swap')
  || customElements.define('imtbl-swap', ImmutableSwap);
customElements.get('imtbl-bridge')
  || customElements.define('imtbl-bridge', ImmutableBridge);
customElements.get('imtbl-buy')
  || customElements.define('imtbl-buy', ImmutableBuy);
customElements.get('imtbl-transition-example')
  || customElements.define('imtbl-transition-example', ImmutableTransitionExample);
customElements.get('imtbl-example')
  || customElements.define('imtbl-example', ImmutableDiExample);
customElements.get('imtbl-outer-widget-example')
  || customElements.define('imtbl-outer-widget-example', ImmutableOuterExample);
