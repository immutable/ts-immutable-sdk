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
PRIVATE_KEY=
# Address of the depositor
DEPOSITOR_ADDRESS=
# Address of the desired recipient on L2
RECIPIENT_ADDRESS=
# Token address to be deposited
SEPOLIA_TOKEN_ADDRESS=0x40b87d235A5B010a20A241F15797C9debf1ecd01
# Token address to be withdawn
ZKEVM_TESTNET_TOKEN_ADDRESS=0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2
# Depsit amount (amount will be multiplied by 10^18)
DEPOSIT_AMOUNT=0.001
# Deposit token decimals
DEPOSIT_DECIMALS=6
# Address of the root bridge 
ROOT_BRIDGE_ADDRESS=0x8d4528775a4406Def316DC2b450eE539750F8FAA
# Address of the child bridge
CHILD_BRIDGE_ADDRESS=0xb0f971e2d11A4D410148af51b170D64E725c0bB9

# MAP TOKEN ----------------------------------------------------------------

# Used to map a token from root -> child
ROOT_TOKEN_TO_MAP=0x40b87d235A5B010a20A241F15797C9debf1ecd01
# Used to check on mapped token status
AXELAR_API_URL=https://testnet.api.gmp.axelarscan.io

# STATUS -------------------------------------------------------------------

# Transaction hash to check the status of
STATUS_TX_HASH=0x5c192bf2b3be59de3a69877f6c71fd0affe6e1a1c05a75f51d4a60692001d8f3
# Chain ID of the source chain where the bridge tx to check originated from
STATUS_SOURCE_CHAIN_ID=11155111
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