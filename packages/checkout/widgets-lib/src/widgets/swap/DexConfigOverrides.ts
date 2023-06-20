const chainId: number = 13383;
const commonRoutingTokens = [
  {
    chainId,
    address: '0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d',
    decimals: 18,
    symbol: 'FUN',
    name: 'The Fungibles Token',
  },
  {
    chainId,
    address: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',
    decimals: 18,
    symbol: 'USDC',
    name: 'US Dollar Coin',
  },
  {
    chainId,
    address: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
    decimals: 18,
    symbol: 'DEX',
    name: 'Dex',
  },
];

const contractOverrides = {
  multicall: '0x7b19942581c9462D54155801fCA4a17edf3fD135',
  coreFactory: '0xD17c98b38bA28c7eA1080317EB9AB2b9663BEd92',
  quoterV2: '0x786ec643F231960D4C1A4E336990F8E7bF8f1277',
  peripheryRouter: '0x0d44bB14Cc1dD999255aBB1576b4964D0439C63D',
  migrator: '0x0Afe6F5f4DC34461A801420634239FFaD50A2e44',
  nonfungiblePositionManager: '0xF674847fBcca5C80315e3AE37043Dce99F6CC529',
  tickLens: '0x38034F18D38b74bdE496bdF60CCdBcb25B879e8d',
};

export const getDexConfigOverrides = (): any => ({
  rpcURL: 'https://zkevm-rpc.dev.x.immutable.com',
  exchangeContracts: contractOverrides,
  commonRoutingTokens,
  nativeToken: {
    chainId,
    address: '',
    decimals: 18,
    symbol: 'IMX',
    name: 'Immutable X Token',
  },
});
