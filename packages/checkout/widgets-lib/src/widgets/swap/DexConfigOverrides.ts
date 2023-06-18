const chainId: number = 11155111;
const commonRoutingTokens = [
  {
    chainId,
    address: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
    decimals: 18,
    symbol: 'FUN',
    name: 'The Fungibles Token',
  },
  {
    chainId,
    address: '0x1836E16b2036088490C2CFe4d11970Fc8e5884C4',
    decimals: 18,
    symbol: 'USDC',
    name: 'US Dollar Coin',
  },
  {
    chainId,
    address: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
    decimals: 18,
    symbol: 'DEX',
    name: 'Dex',
  },
];

const contractOverrides = {
  multicall: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
  coreFactory: '0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d',
  quoterV2: '0x7aDf9BF0f38f57f270cb54A56330d8dA59EFad24',
  peripheryRouter: '0xF674847fBcca5C80315e3AE37043Dce99F6CC529',
  migrator: '0x5031E825fcC0615979408bf98275da475D7a9D61',
  nonfungiblePositionManager:
    '0x38034F18D38b74bdE496bdF60CCdBcb25B879e8d',
  tickLens: '0xD17c98b38bA28c7eA1080317EB9AB2b9663BEd92',
};

export const getDexConfigOverrides = (): any => ({
  rpcURL: 'https://checkout-api.dev.immutable.com/v1/rpc/eth-sepolia',
  exchangeContracts: contractOverrides,
  commonRoutingTokens,
  nativeToken: {
    chainId,
    address: '0xd1da7e9b2Ce1a4024DaD52b3D37F4c5c91a525C1',
    decimals: 18,
    symbol: 'IMX',
    name: 'Immutable X Token',
  },
});
