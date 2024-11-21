import { CancelOverrides } from './smartCheckout';
import { WrappedBrowserProvider } from './provider';

/**
 * Interface representing the parameters for {@link Checkout.cancel}
 * @property {BrowserProvider} provider - The provider to use for the cancel.
 * @property {string[]} orderIds - The order IDs to cancel.
 * @property {CancelOverrides} overrides - The overrides to use for the cancel.
 * Currently only processes the first order in the array until batch processing is supported.
 */
export interface CancelParams {
  provider: WrappedBrowserProvider;
  orderIds: string[];
  overrides?: CancelOverrides;
}
