# Immutable Bridge SDK

## Setup

First copy the ``.example.env`` file to `.env` and fill it out with your own private key and deposit/recipient addresses.

```
# REQUIRED -----------------------------------------------------------------

# RPC URL for the root chain, i.e. L1
ROOT_PROVIDER_RPC=https://1rpc.io/sepolia
# RPC URL for child chain, i.e. L2
CHILD_PROVIDER_RPC=https://rpc.testnet.immutable.com
# Private key of the depositor
PRIVATE_KEY=XXX
# Address of the sender
SENDER_ADDRESS=0xEac347177DbA4a190B632C7d9b8da2AbfF57c772
# Address of the desired recipient on L2
RECIPIENT_ADDRESS=0xEac347177DbA4a190B632C7d9b8da2AbfF57c772
# Token address to be deposited
SEPOLIA_TOKEN_ADDRESS=0x40b87d235A5B010a20A241F15797C9debf1ecd01
# Token address to be withdawn
ZKEVM_TESTNET_TOKEN_ADDRESS=0x3B2d8A1931736Fc321C24864BceEe981B11c3c57
# Depsit amount (amount will be multiplied by 10^18)
SEND_AMOUNT=0.001
# Deposit token decimals
SEND_DECIMALS=6
# Address of the root bridge 
ROOT_BRIDGE_ADDRESS=0x0D3C59c779Fd552C27b23F723E80246c840100F5
# Address of the child bridge
CHILD_BRIDGE_ADDRESS=0x0D3C59c779Fd552C27b23F723E80246c840100F5

# MAP TOKEN ----------------------------------------------------------------

# Used to map a token from root -> child
ROOT_TOKEN_TO_MAP=0x40b87d235A5B010a20A241F15797C9debf1ecd01
# Used to check on mapped token status
AXELAR_API_URL=https://testnet.api.gmp.axelarscan.io

# STATUS -------------------------------------------------------------------

# Transaction hash to check the status of
STATUS_TX_HASH=0x89d9a95ccdb7d4370f86fd9a6680d141367e5c24b2d111ec1fc6c87037ecfddb
# Chain ID of the source chain where the bridge tx to check originated from
STATUS_SOURCE_CHAIN_ID=13473
```

The params under `SDK METHOD TESTS` are required to run the smoke tests.
The optional params under `MAP TOKEN` are only required if you want to map a token on testnet.

## Tests

First build the Bridge SDK following the instructions it the readme there.

Then you can run each of the tests;

### Test tokenBridge.getFee

`yarn run fees`

Console logs the fees for all the various transaction types.

### Test tokenBrige.getUnsignedApproveBridgeTx

`yarn run approval`

Console logs the approval tansactions for all the various transaction types.

### Test tokenBrige.getUnsignedBridgeTx

`yarn run bridge`

Console logs the bridge tansactions for all the various transaction types.


### Test Deposit

`yarn run deposit`

@TODO should do the e2e test including getting fees, signing the approval and signing the deposit tx

### Test Withdraw

`yarn run withdraw`

@TODO should do the e2e test including getting fees, signing the approval and signing the withdraw tx


## Scripts

### Map Token

Fill out the optional params listed in the setup section under `MAP TOKEN` including the address of the root token you want to map on Sepolia.

`yarn run mapToken`

This will console log out the token status and wait for the mapping to be completed on Layer 2. If you stop the process and run it again it will resume waiting for layer 2, or tell you if its completed on both chains.