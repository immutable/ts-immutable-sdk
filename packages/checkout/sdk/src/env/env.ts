export const SDK_VERSION_MARKER = '__SDK_VERSION__';

export const useLocalBundle = () => process.env.CHECKOUT_LOCAL_MODE === 'true';

// This SDK version is replaced by the `pnpm build` command ran on the root level
export const globalPackageVersion = () => SDK_VERSION_MARKER;
