import { TokenInfo } from '../../types';

export type OnRampTokensAllowList = { [key: string]: TokenInfo[] };

export type RoutingTokensAllowList = {
  'bridge'?: TokenInfo[],
  'swap'?: TokenInfo[],
  'onRamp'?: OnRampTokensAllowList,
};
