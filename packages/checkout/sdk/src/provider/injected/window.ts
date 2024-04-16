import type {
  EIP6963AnnounceProviderEvent,
  EIP6963RequestProviderEvent,
} from '../../types/eip6963';

export {};

declare global {
  interface WindowEventMap {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'eip6963:requestProvider': EIP6963RequestProviderEvent
  }
}
