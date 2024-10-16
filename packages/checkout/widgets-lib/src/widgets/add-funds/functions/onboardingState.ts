import localForage from 'localforage';

export const addFundsOnboardingCache = localForage.createInstance({
  name: 'AddFunds Onboarding State',
  version: 1.0,
  storeName: 'Internal state',
  description:
    'A small IndexDB for storage of state relating to the AddFunds Onboarding Drawer',
});

export const SEEN_ONBOARDING_KEY = 'seen-onboarding';

type CacheItem = {
  value: boolean;
} | null;

export async function getCacheItem(key: string) {
  const data: CacheItem = await addFundsOnboardingCache.getItem(key);
  if (!data) return null;
  const { value } = data;
  return value;
}

export async function setCacheItem(key: string, value: boolean) {
  return addFundsOnboardingCache.setItem(key, {
    value,
  });
}

export async function clearCacheItems() {
  return addFundsOnboardingCache.clear();
}
