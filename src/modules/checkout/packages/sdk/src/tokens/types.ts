export interface GetTokenAllowListResult {
    tokens: Token[];
}

export interface Token {
    name: string;
    ticker: string;
    contractAddress: string;
    decimal: number;
    icon: string;
}
