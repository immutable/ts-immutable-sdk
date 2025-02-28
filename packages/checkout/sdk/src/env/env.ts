export const SDK_VERSION_MARKER = '__SDK_VERSION__';

// This SDK version is replaced by the `pnpm build` command ran on the root level
export const globalPackageVersion = () => SDK_VERSION_MARKER;
