# Crypto to Fiat conversion package

https://immutable.atlassian.net/browse/WT-1291

### Usage

This package uses CoinGecko to fetch crypto to fiat conversions. The dependency with CoinGecko will be eventually deprecated in favour to a custom Immutable solution.

Free CoinGecko APIs
```shell
const conv = new CryptoFiat() 
const rest = await conv.convert(["eth", "imx"])
console.log(res) // { BTC: { usd: 50000 }, ETH: { usd: 4000 } }
```

PRO CoinGecko APIs
```
const apiKey = "some-api-key"
const config = new CryptoFiatConfiguration({ apiKey });
const cryptoFiat = new CryptoFiat(config);
const rest = await conv.convert(["eth", "imx"])
console.log(res) // { BTC: { usd: 50000 }, ETH: { usd: 4000 } }
```
