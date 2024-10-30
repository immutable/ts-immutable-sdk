import localForage from 'localforage';

export const addTokensOnboardingCache = localForage.createInstance({
  name: 'AddTokens Onboarding State',
  version: 1.0,
  storeName: 'Internal state',
  description:
    'A small IndexDB for storage of state relating to the AddTokens Onboarding Drawer',
});

export const SEEN_ONBOARDING_KEY = 'seen-onboarding';

type CacheItem = {
  value: boolean;
} | null;

export async function getCacheItem(key: string) {
  const data: CacheItem = await addTokensOnboardingCache.getItem(key);
  if (!data) return null;
  const { value } = data;
  return value;
}

export async function setCacheItem(key: string, value: boolean) {
  return addTokensOnboardingCache.setItem(key, {
    value,
  });
}

export async function clearCacheItems() {
  return addTokensOnboardingCache.clear();
}
