import { Token } from '../types';
import { SQUID_SDK_BASE_URL } from '../utils/config';

type SquidTokenResponse = {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
  usdPrice: number;
  logoURI: string;
};

type SquidTokensResponse = {
  tokens: SquidTokenResponse[];
};

export const fetchTokens = async (integratorId: string): Promise<Token[]> => {
  const url = `${SQUID_SDK_BASE_URL}/v2/sdk-info`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'x-integrator-id': integratorId,
    },
  });

  const data: SquidTokensResponse = await response.json();

  if (!data.tokens) {
    return [];
  }

  return data.tokens.map((tokenResponse: SquidTokenResponse) => ({
    chainId: tokenResponse.chainId.toString(),
    address: tokenResponse.address,
    decimals: tokenResponse.decimals,
    symbol: tokenResponse.symbol,
    name: tokenResponse.name,
    usdPrice: tokenResponse.usdPrice,
    iconUrl: tokenResponse.logoURI,
  }));
};
