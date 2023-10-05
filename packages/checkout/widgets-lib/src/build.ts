// Define dynamic imports
const importConnect = () => import('./widgets/connect/ConnectWebComponent');
const importSwap = () => import('./widgets/swap/SwapWebComponent');
const importWallet = () => import('./widgets/wallet/WalletWebComponent');
const importBridge = () => import('./widgets/bridge/BridgeWebComponent');

// Use the dynamic imports to load components asynchronously
Promise.all([
  customElements.get('imtbl-connect')
    || customElements.define('imtbl-connect', (await importConnect()).ImmutableConnect),
  customElements.get('imtbl-wallet')
    || customElements.define('imtbl-wallet', (await importWallet()).ImmutableWallet),
  customElements.get('imtbl-swap')
    || customElements.define('imtbl-swap', (await importSwap()).ImmutableSwap),
  customElements.get('imtbl-bridge')
    || customElements.define('imtbl-bridge', (await importBridge()).ImmutableBridge),
]);
export { };
