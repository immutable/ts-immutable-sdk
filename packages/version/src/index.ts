import { sdkVersionCheck } from 'versionCheck';
import packageData from '../package.json';

export const { version } = packageData;

// eslint-disable-next-line no-console
sdkVersionCheck(version);
