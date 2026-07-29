import type { AttributionNetwork } from '@imtbl/audience-core';

/**
 * Reserved event property carrying the shared conversion event id. The same
 * value is passed to the ad-network browser pixel so the network can
 * deduplicate the browser event against the server-side Conversions API event
 * (which reads this property downstream). The leading underscore marks it as
 * SDK-owned (callers must not set it by hand), matching the reserved `_imtbl_`
 * identifier convention; snake_case keeps it BigQuery / Goal-filter friendly.
 * This name is a cross-service contract with the postbacks builders - do not
 * change it without updating them.
 */
export const CONVERSION_ID_PROPERTY = '_imtbl_conversion_id';

/**
 * Reserved event property naming the network the conversion id was minted for.
 * Lets the server reuse the id only when dispatching to the same network the
 * client fired a dedup pixel for. SDK-owned (see {@link CONVERSION_ID_PROPERTY});
 * cross-service contract with postbacks.
 */
export const CONVERSION_NETWORK_PROPERTY = '_imtbl_conversion_network';

/**
 * Networks whose browser pixel and server Conversions API can deduplicate on a
 * shared, client-minted id passed to both legs. Each network names the field
 * differently (Meta `eventID`, TikTok `event_id`, Reddit/X `conversion_id`,
 * Google `transaction_id`/`order_id`) but the value is the same. Google dedup
 * relies on the postbacks upload sending the id as `order_id`; the browser
 * gtag must send it as `transaction_id`.
 */
export const DEDUP_CAPABLE_NETWORKS: ReadonlySet<AttributionNetwork> = new Set<AttributionNetwork>([
  'meta',
  'tiktok',
  'reddit',
  'x',
  'google',
]);

/** Result of {@link Audience.trackConversion}. */
export interface ConversionResult {
  /**
   * The shared id to pass to the ad-network browser pixel (e.g. Meta
   * `eventID`, TikTok `event_id`, Reddit/X `conversion_id`, Google gtag
   * `transaction_id`). `null` when the visit isn't attributed to a
   * dedup-capable paid network, or when consent doesn't permit tracking — in
   * both cases no dedup id is emitted and the caller should not fire a
   * deduplicated pixel event.
   */
  eventId: string | null;
  /** The network the visit was attributed to. */
  network: AttributionNetwork;
}
