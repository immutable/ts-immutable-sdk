import { TokenInfo } from '@imtbl/checkout-sdk-web';

export const findTokenByAddress = (tokens: TokenInfo[], contractAddress: string | undefined): TokenInfo | undefined => {
    if (!contractAddress) return tokens[0];
    return tokens.find((t) => t.address?.toLowerCase() === contractAddress.toLowerCase());
}

export const alphaSortTokensList = (tokens: TokenInfo[]): TokenInfo[] => {
    return tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
}
