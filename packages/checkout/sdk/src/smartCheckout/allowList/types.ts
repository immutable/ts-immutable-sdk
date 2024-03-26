import { TokenInfo } from '../../types';

export type RoutingTokensAllowList = {
  'bridge'?: TokenInfo[],
  'swap'?: TokenInfo[],
  'onRamp'?: TokenInfo[],
};
