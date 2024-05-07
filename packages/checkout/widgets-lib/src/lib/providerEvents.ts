import {
  IMTBLWidgetEvents, ProviderEvent, ProviderEventType, ProviderUpdated,
} from '@imtbl/checkout-sdk';

export function sendProviderUpdatedEvent(
  eventData: ProviderUpdated,
) {
  const providerUpdatedEvent = new CustomEvent<ProviderEvent<ProviderEventType.PROVIDER_UPDATED>>(
    IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
    {
      detail: {
        type: ProviderEventType.PROVIDER_UPDATED,
        data: eventData,
      },
    },
  );
  if (window !== undefined) window.dispatchEvent(providerUpdatedEvent);
}
