import { Token } from '@uniswap/sdk-core';
import { ExchangeContracts } from "config/config"

export type Chain = {
    chainId: number,
    rpcUrl: string,
    contracts: ExchangeContracts,
    commonRoutingTokens: Token[]
}