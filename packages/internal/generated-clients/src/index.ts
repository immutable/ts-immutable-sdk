import * as imxImport from './imx';
import * as BlockchainDataImport from './blockchain-data/index';

import * as mrImport from './multi-rollup';

export const imx = { ...imxImport };
export const mr = { ...mrImport };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlockchainData = { ...BlockchainDataImport };

export { ImxApiClients } from './imx-api-clients';
export { MultiRollupApiClients } from './mr-api-clients';
export {
  ImmutableAPIConfiguration,
  imxApiConfig,
  multiRollupConfig,
  MultiRollupAPIConfiguration,
  createConfig,
} from './config';
