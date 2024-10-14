# Crypto to Fiat conversion package

https://immutable.atlassian.net/browse/WT-1291

### Usage

This package uses CoinGecko to fetch crypto to fiat conversions. The dependency with CoinGecko will be eventually deprecated in favour to a custom Immutable solution.

Free CoinGecko APIs
```ts
const config = new CryptoFiatConfiguration({});
const conv = new CryptoFiat(config);
const rest = await conv.convert({
  tokenSymbols: ['eth', 'imx'],
  fiatSymbols: ['aud', 'usd'],
});
console.log(rest);
```
Result
```json
{
    "eth": {
        "usd": 1846.46,
        "aud": 2728.21
    },
    "imx": {
        "usd": 0.764824,
        "aud": 1.13
    }
}
```

PRO CoinGecko APIs
```ts
const apiKey = "some-api-key"
const config = new CryptoFiatConfiguration({ apiKey });
const conv = new CryptoFiat(config);
const rest = await conv.convert({ tokenSymbols: ['eth', 'imx'] });
console.log(rest);
```
Result
```json
{
    "eth": {
        "usd": 1846.46
    },
    "imx": {
        "usd": 0.764824
    }
}
```
