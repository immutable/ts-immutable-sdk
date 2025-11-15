import type { AttributionData } from './attribution';

/**
 * Deep link data extracted from URL parameters
 */
export interface DeepLinkData {
  /** Deep link path (e.g., '/product/123') */
  path?: string;
  /** Deep link value (alternative to path) */
  value?: string;
  /** All deep link parameters */
  params?: Record<string, string>;
  /** Full deep link URL */
  url?: string;
}

/**
 * Common deep link parameter names used by AppsFlyer/Adjust
 */
const DEEP_LINK_PARAM_NAMES = [
  'deep_link',
  'deep_link_value',
  'deep_link_path',
  'af_dp', // AppsFlyer deep link path
  'af_dl', // AppsFlyer deep link value
  'af_web_dp', // AppsFlyer web deep link path
  'adjust_deeplink', // Adjust deep link
  'deeplink',
  'deeplink_path',
  'deeplink_value',
];

/**
 * Extract deep link data from attribution data
 */
export function extractDeepLinkData(attribution: AttributionData | null): DeepLinkData | null {
  if (!attribution || !attribution.custom) {
    return null;
  }

  const deepLink: DeepLinkData = {
    params: {},
  };

  // Check for common deep link parameter names
  for (const paramName of DEEP_LINK_PARAM_NAMES) {
    const value = attribution.custom[paramName];
    if (value) {
      if (paramName.includes('path') || paramName === 'af_dp' || paramName === 'af_web_dp') {
        deepLink.path = value;
      } else if (paramName.includes('value') || paramName === 'af_dl') {
        deepLink.value = value;
      } else {
        // Generic deep link parameter
        deepLink.path = deepLink.path || value;
        deepLink.value = deepLink.value || value;
      }
    }
  }

  // If no standard deep link params found, check for any custom params
  // that might be deep link related
  if (!deepLink.path && !deepLink.value && Object.keys(attribution.custom).length > 0) {
    // Use first custom param as potential deep link
    const firstParam = Object.entries(attribution.custom)[0];
    if (firstParam) {
      deepLink.value = firstParam[1];
      deepLink.params = { [firstParam[0]]: firstParam[1] };
    }
  } else {
    // Include all custom params as deep link params
    deepLink.params = { ...attribution.custom };
  }

  // Include landing page URL if available
  if (attribution.landingPage) {
    deepLink.url = attribution.landingPage;
  }

  // Return null if no deep link data found
  if (!deepLink.path && !deepLink.value && Object.keys(deepLink.params || {}).length === 0) {
    return null;
  }

  return deepLink;
}

