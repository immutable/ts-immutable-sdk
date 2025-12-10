export {
  generateLegacyStarkPrivateKey,
  generateStarkPrivateKey,
  createStarkSigner,
  starkEcOrder,
  serializePackedSignature,
  signRegisterEthAddress,
} from './utils';

export type { LegacySigner } from './utils/stark/starkCurve';
