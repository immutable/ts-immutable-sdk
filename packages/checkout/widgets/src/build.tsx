import { ImmutableConnect } from "./widgets/connect/ConnectWebComponent";
import { ImmutableSwap } from "./widgets/swap/SwapWebComponent";
import { ImmutableWallet } from "./widgets/wallet/WalletWebComponent";
import { ImmutableBridge } from "./widgets/bridge/BridgeWebComponent";
import { ImmutableExample } from "./widgets/example/ExampleWebComponent";
import { ImmutableBuy } from "./widgets/buy/BuyWebComponent";
import { ImmutableTransitionExample } from "./widgets/transition-example/TransitionExampleWebComponent";

customElements.define('imtbl-connect', ImmutableConnect);
customElements.define('imtbl-wallet', ImmutableWallet);
customElements.define('imtbl-swap', ImmutableSwap);
customElements.define('imtbl-bridge', ImmutableBridge);
customElements.define('imtbl-example', ImmutableExample);
customElements.define('imtbl-buy', ImmutableBuy);
customElements.define('imtbl-transition-example', ImmutableTransitionExample);
