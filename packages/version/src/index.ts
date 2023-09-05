import packageData from '../package.json';

export const sdkVersion = packageData.version;

// eslint-disable-next-line no-console
console.log(`version is ${sdkVersion}`);
