export const baseWidgetProviderEvent = 'IMTBL_BASE_WIDGET_PROVIDER_EVENT';
export function handleAccountsChanged() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}
export function handleChainChanged() {
  window.dispatchEvent(new CustomEvent(baseWidgetProviderEvent));
}
