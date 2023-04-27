import { ImmutableConnect } from './widgets/connect/ConnectWebComponent';
import { ImmutableSwap } from './widgets/swap/SwapWebComponent';
import { ImmutableWallet } from './widgets/wallet/WalletWebComponent';
import { ImmutableBridge } from './widgets/bridge/BridgeWebComponent';
import { ImmutableDiExample } from './widgets/examples/dependency-injection/DiExampleWebComponent';
import { ImmutableBuy } from './widgets/buy/BuyWebComponent';
import { ImmutableTransitionExample } from './widgets/examples/transition/TransitionExampleWebComponent';
import { ImmutableOuterExample } from './widgets/examples/connection-required/outer-widget/OuterWidgetWebComponent';

customElements.define('imtbl-connect', ImmutableConnect);
customElements.define('imtbl-wallet', ImmutableWallet);
customElements.define('imtbl-swap', ImmutableSwap);
customElements.define('imtbl-bridge', ImmutableBridge);
customElements.define('imtbl-buy', ImmutableBuy);
customElements.define('imtbl-transition-example', ImmutableTransitionExample);
customElements.define('imtbl-example', ImmutableDiExample);
customElements.define('imtbl-outer-widget-example', ImmutableOuterExample);
