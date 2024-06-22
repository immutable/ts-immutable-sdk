import { EIP1193Provider } from './eip1193';

/**
 * Event detail from the `eip6963:announceProvider` event.
 */
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

/**
 * Metadata of the EIP-1193 Provider.
 */
export interface EIP6963ProviderInfo {
  icon: `data:image/${string}`; // RFC-2397
  name: string;
  rdns: string;
  uuid: string;
}

/**
 * Event type to announce an EIP-1193 Provider.
 */
export interface EIP6963AnnounceProviderEvent extends CustomEvent<EIP6963ProviderDetail> {
  type: 'eip6963:announceProvider'
}

/**
 * Event type to request EIP-1193 Providers.
 */
export interface EIP6963RequestProviderEvent extends Event {
  type: 'eip6963:requestProvider'
}

// Extending WindowEventMap to include the custom event
declare global {
  interface WindowEventMap {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent;
  }
}
