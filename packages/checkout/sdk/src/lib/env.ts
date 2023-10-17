export const SDK_VERSION_MARKER = '__SDK_VERSION__';

export const isDevMode = () => process.env.CHECKOUT_LOCAL_MODE !== undefined;

// This SDK version is replaced by the `yarn build` command ran on the root level
export const globalPackageVersion = () => SDK_VERSION_MARKER;
