import type { Address } from 'abitype';
import { Prettify } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */

export type EIP1474Methods = []; // [...PublicRpcSchema, ...WalletRpcSchema];

export interface EIP1193Provider {
  request: EIP1193RequestFn<EIP1474Methods>;
  on<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
  removeListener<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
}

/**
 * Errors
 */

export type ProviderRpcErrorType = ProviderRpcError & {
  name: 'ProviderRpcError'
};

export class ProviderRpcError extends Error {
  code: number;

  details: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.details = message;
  }
}

/**
 *  Provider Events
 */

export type ProviderConnectInfo = {
  chainId: string
};

export type ProviderMessage = {
  type: string
  data: unknown
};

export type EIP1193EventMap = {
  accountsChanged(accounts: Address[]): void
  chainChanged(chainId: string): void
  connect(connectInfo: ProviderConnectInfo): void
  disconnect(error: ProviderRpcError): void
  message(message: ProviderMessage): void
};

// export type PublicRpcSchema = [
//   /**
//    * @description Returns the version of the current client
//    *
//    * @example
//    * provider.request({ method: 'web3_clientVersion' })
//    * // => 'MetaMask/v1.0.0'
//    */
//   {
//     Method: 'web3_clientVersion'
//     Parameters?: undefined
//     ReturnType: string
//   },
//   /**
//    * @description Hashes data using the Keccak-256 algorithm
//    *
//    * @example
//    * provider.request({ method: 'web3_sha3', params: ['0x68656c6c6f20776f726c64'] })
//    * // => '0xc94770007dda54cF92009BFF0dE90c06F603a09f'
//    */
//   {
//     Method: 'web3_sha3'
//     Parameters: [data: Hash]
//     ReturnType: string
//   },
//   /**
//    * @description Determines if this client is listening for new network connections
//    *
//    * @example
//    * provider.request({ method: 'net_listening' })
//    * // => true
//    */
//   {
//     Method: 'net_listening'
//     Parameters?: undefined
//     ReturnType: boolean
//   },
//   /**
//    * @description Returns the number of peers currently connected to this client
//    *
//    * @example
//    * provider.request({ method: 'net_peerCount' })
//    * // => '0x1'
//    */
//   {
//     Method: 'net_peerCount'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the chain ID associated with the current network
//    *
//    * @example
//    * provider.request({ method: 'net_version' })
//    * // => '1'
//    */
//   {
//     Method: 'net_version'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the current blob price of gas expressed in wei
//    *
//    * @example
//    * provider.request({ method: 'eth_blobGasPrice' })
//    * // => '0x09184e72a000'
//    */
//   {
//     Method: 'eth_blobGasPrice'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the number of the most recent block seen by this client
//    *
//    * @example
//    * provider.request({ method: 'eth_blockNumber' })
//    * // => '0x1b4'
//    */
//   {
//     Method: 'eth_blockNumber'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Executes a new message call immediately without submitting a transaction to the network
//    *
//    * @example
//    * provider.request({ method: 'eth_call', params: [{ to: '0x...', data: '0x...' }] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_call'
//     Parameters:
//       | [transaction: Partial<TransactionRequest>]
//       | [
//       transaction: Partial<TransactionRequest>,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//     ]
//       | [
//       transaction: Partial<TransactionRequest>,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//       stateOverrideSet: RpcStateOverride,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Returns the chain ID associated with the current network
//    * @example
//    * provider.request({ method: 'eth_chainId' })
//    * // => '1'
//    */
//   {
//     Method: 'eth_chainId'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the client coinbase address.
//    * @example
//    * provider.request({ method: 'eth_coinbase' })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_coinbase'
//     Parameters?: undefined
//     ReturnType: Address
//   },
//   /**
//    * @description Estimates the gas necessary to complete a transaction without submitting it to the network
//    *
//    * @example
//    * provider.request({
//    *  method: 'eth_estimateGas',
//    *  params: [{ from: '0x...', to: '0x...', value: '0x...' }]
//    * })
//    * // => '0x5208'
//    */
//   {
//     Method: 'eth_estimateGas'
//     Parameters:
//       | [transaction: TransactionRequest]
//       | [transaction: TransactionRequest, block: BlockNumber | BlockTag]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns a collection of historical gas information
//    *
//    * @example
//    * provider.request({
//    *  method: 'eth_feeHistory',
//    *  params: ['4', 'latest', ['25', '75']]
//    * })
//    * // => {
//    * //   oldestBlock: '0x1',
//    * //   baseFeePerGas: ['0x1', '0x2', '0x3', '0x4'],
//    * //   gasUsedRatio: ['0x1', '0x2', '0x3', '0x4'],
//    * //   reward: [['0x1', '0x2'], ['0x3', '0x4'], ['0x5', '0x6'], ['0x7', '0x8']]
//    * // }
//    * */
//   {
//     Method: 'eth_feeHistory'
//     Parameters: [
//       /** Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available. */
//       blockCount: Quantity,
//       /** Highest number block of the requested range. */
//       newestBlock: BlockNumber | BlockTag,
//       /** A monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used. */
//       rewardPercentiles: number[] | undefined,
//     ]
//     ReturnType: FeeHistory
//   },
//   /**
//    * @description Returns the current price of gas expressed in wei
//    *
//    * @example
//    * provider.request({ method: 'eth_gasPrice' })
//    * // => '0x09184e72a000'
//    */
//   {
//     Method: 'eth_gasPrice'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the balance of an address in wei
//    *
//    * @example
//    * provider.request({ method: 'eth_getBalance', params: ['0x...', 'latest'] })
//    * // => '0x12a05...'
//    */
//   {
//     Method: 'eth_getBalance'
//     Parameters: [
//       address: Address,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//     ]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns information about a block specified by hash
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getBlockByHash', params: ['0x...', true] })
//    * // => {
//    * //   number: '0x1b4',
//    * //   hash: '0x...',
//    * //   parentHash: '0x...',
//    * //   ...
//    * // }
//    */
//   {
//     Method: 'eth_getBlockByHash'
//     Parameters: [
//       /** hash of a block */
//       hash: Hash,
//       /** true will pull full transaction objects, false will pull transaction hashes */
//       includeTransactionObjects: boolean,
//     ]
//     ReturnType: Block | null
//   },
//   /**
//    * @description Returns information about a block specified by number
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getBlockByNumber', params: ['0x1b4', true] })
//    * // => {
//    * //   number: '0x1b4',
//    * //   hash: '0x...',
//    * //   parentHash: '0x...',
//    * //   ...
//    * // }
//    */
//   {
//     Method: 'eth_getBlockByNumber'
//     Parameters: [
//       /** block number, or one of "latest", "safe", "finalized", "earliest" or "pending" */
//       block: BlockNumber | BlockTag,
//       /** true will pull full transaction objects, false will pull transaction hashes */
//       includeTransactionObjects: boolean,
//     ]
//     ReturnType: Block | null
//   },
//   /**
//    * @description Returns the number of transactions in a block specified by block hash
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getBlockTransactionCountByHash', params: ['0x...'] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_getBlockTransactionCountByHash'
//     Parameters: [hash: Hash]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the number of transactions in a block specified by block number
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getBlockTransactionCountByNumber', params: ['0x1b4'] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_getBlockTransactionCountByNumber'
//     Parameters: [block: BlockNumber | BlockTag]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the contract code stored at a given address
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getCode', params: ['0x...', 'latest'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_getCode'
//     Parameters: [
//       address: Address,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Returns a list of all logs based on filter ID since the last log retrieval
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getFilterChanges', params: ['0x...'] })
//    * // => [{ ... }, { ... }]
//    */
//   {
//     Method: 'eth_getFilterChanges'
//     Parameters: [filterId: Quantity]
//     ReturnType: Log[] | Hex[]
//   },
//   /**
//    * @description Returns a list of all logs based on filter ID
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getFilterLogs', params: ['0x...'] })
//    * // => [{ ... }, { ... }]
//    */
//   {
//     Method: 'eth_getFilterLogs'
//     Parameters: [filterId: Quantity]
//     ReturnType: Log[]
//   },
//   /**
//    * @description Returns a list of all logs based on a filter object
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getLogs', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
//    * // => [{ ... }, { ... }]
//    */
//   {
//     Method: 'eth_getLogs'
//     Parameters: [
//         {
//           address?: Address | Address[]
//           topics?: LogTopic[]
//         } & (
//         | {
//         fromBlock?: BlockNumber | BlockTag
//         toBlock?: BlockNumber | BlockTag
//         blockHash?: never
//       }
//         | {
//         fromBlock?: never
//         toBlock?: never
//         blockHash?: Hash
//       }
//         ),
//     ]
//     ReturnType: Log[]
//   },
//   /**
//    * @description Returns the account and storage values of the specified account including the Merkle-proof.
//    * @link https://eips.ethereum.org/EIPS/eip-1186
//    * @example
//    * provider.request({ method: 'eth_getProof', params: ['0x...', ['0x...'], 'latest'] })
//    * // => {
//    * //   ...
//    * // }
//    */
//   {
//     Method: 'eth_getProof'
//     Parameters: [
//       /** Address of the account. */
//       address: Address,
//       /** An array of storage-keys that should be proofed and included. */
//       storageKeys: Hash[],
//       block: BlockNumber | BlockTag,
//     ]
//     ReturnType: Proof
//   },
//   /**
//    * @description Returns the value from a storage position at an address
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getStorageAt', params: ['0x...', '0x...', 'latest'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_getStorageAt'
//     Parameters: [
//       address: Address,
//       index: Quantity,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Returns information about a transaction specified by block hash and transaction index
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getTransactionByBlockHashAndIndex', params: ['0x...', '0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getTransactionByBlockHashAndIndex'
//     Parameters: [hash: Hash, index: Quantity]
//     ReturnType: Transaction | null
//   },
//   /**
//    * @description Returns information about a transaction specified by block number and transaction index
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getTransactionByBlockNumberAndIndex', params: ['0x...', '0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getTransactionByBlockNumberAndIndex'
//     Parameters: [block: BlockNumber | BlockTag, index: Quantity]
//     ReturnType: Transaction | null
//   },
//   /**
//    * @description Returns information about a transaction specified by hash
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getTransactionByHash', params: ['0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getTransactionByHash'
//     Parameters: [hash: Hash]
//     ReturnType: Transaction | null
//   },
//   /**
//    * @description Returns the number of transactions sent from an address
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getTransactionCount', params: ['0x...', 'latest'] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_getTransactionCount'
//     Parameters: [
//       address: Address,
//       block: BlockNumber | BlockTag | BlockIdentifier,
//     ]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the receipt of a transaction specified by hash
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getTransactionReceipt', params: ['0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getTransactionReceipt'
//     Parameters: [hash: Hash]
//     ReturnType: TransactionReceipt | null
//   },
//   /**
//    * @description Returns information about an uncle specified by block hash and uncle index position
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getUncleByBlockHashAndIndex', params: ['0x...', '0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getUncleByBlockHashAndIndex'
//     Parameters: [hash: Hash, index: Quantity]
//     ReturnType: Uncle | null
//   },
//   /**
//    * @description Returns information about an uncle specified by block number and uncle index position
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getUncleByBlockNumberAndIndex', params: ['0x...', '0x...'] })
//    * // => { ... }
//    */
//   {
//     Method: 'eth_getUncleByBlockNumberAndIndex'
//     Parameters: [block: BlockNumber | BlockTag, index: Quantity]
//     ReturnType: Uncle | null
//   },
//   /**
//    * @description Returns the number of uncles in a block specified by block hash
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getUncleCountByBlockHash', params: ['0x...'] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_getUncleCountByBlockHash'
//     Parameters: [hash: Hash]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the number of uncles in a block specified by block number
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_getUncleCountByBlockNumber', params: ['0x...'] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_getUncleCountByBlockNumber'
//     Parameters: [block: BlockNumber | BlockTag]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the current maxPriorityFeePerGas in wei.
//    * @link https://ethereum.github.io/execution-apis/api-documentation/
//    * @example
//    * provider.request({ method: 'eth_maxPriorityFeePerGas' })
//    * // => '0x5f5e100'
//    */
//   {
//     Method: 'eth_maxPriorityFeePerGas'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Creates a filter to listen for new blocks that can be used with `eth_getFilterChanges`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_newBlockFilter' })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_newBlockFilter'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Creates a filter to listen for specific state changes that can then be used with `eth_getFilterChanges`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_newFilter', params: [{ fromBlock: '0x...', toBlock: '0x...', address: '0x...', topics: ['0x...'] }] })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_newFilter'
//     Parameters: [
//       filter: {
//         fromBlock?: BlockNumber | BlockTag
//         toBlock?: BlockNumber | BlockTag
//         address?: Address | Address[]
//         topics?: LogTopic[]
//       },
//     ]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Creates a filter to listen for new pending transactions that can be used with `eth_getFilterChanges`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_newPendingTransactionFilter' })
//    * // => '0x1'
//    */
//   {
//     Method: 'eth_newPendingTransactionFilter'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Returns the current Ethereum protocol version
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_protocolVersion' })
//    * // => '54'
//    */
//   {
//     Method: 'eth_protocolVersion'
//     Parameters?: undefined
//     ReturnType: string
//   },
//   /**
//    * @description Sends a **signed** transaction to the network
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_sendRawTransaction', params: ['0x...'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_sendRawTransaction'
//     Parameters: [signedTransaction: Hex]
//     ReturnType: Hash
//   },
//   /**
//    * @description Destroys a filter based on filter ID
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_uninstallFilter', params: ['0x1'] })
//    * // => true
//    */
//   {
//     Method: 'eth_uninstallFilter'
//     Parameters: [filterId: Quantity]
//     ReturnType: boolean
//   },
// ];
//
//
// export type WalletRpcSchema = [
//   /**
//    * @description Returns a list of addresses owned by this client
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_accounts' })
//    * // => ['0x0fB69...']
//    */
//   {
//     Method: 'eth_accounts'
//     Parameters?: undefined
//     ReturnType: Address[]
//   },
//   /**
//    * @description Returns the current chain ID associated with the wallet.
//    * @example
//    * provider.request({ method: 'eth_chainId' })
//    * // => '1'
//    */
//   {
//     Method: 'eth_chainId'
//     Parameters?: undefined
//     ReturnType: Quantity
//   },
//   /**
//    * @description Estimates the gas necessary to complete a transaction without submitting it to the network
//    *
//    * @example
//    * provider.request({
//    *  method: 'eth_estimateGas',
//    *  params: [{ from: '0x...', to: '0x...', value: '0x...' }]
//    * })
//    * // => '0x5208'
//    */
//   {
//     Method: 'eth_estimateGas'
//     Parameters:
//       | [transaction: TransactionRequest]
//       | [transaction: TransactionRequest, block: BlockNumber | BlockTag]
//     ReturnType: Quantity
//   },
//   /**
//    * @description Requests that the user provides an Ethereum address to be identified by. Typically causes a browser extension popup to appear.
//    * @link https://eips.ethereum.org/EIPS/eip-1102
//    * @example
//    * provider.request({ method: 'eth_requestAccounts' }] })
//    * // => ['0x...', '0x...']
//    */
//   {
//     Method: 'eth_requestAccounts'
//     Parameters?: undefined
//     ReturnType: Address[]
//   },
//   /**
//    * @description Creates, signs, and sends a new transaction to the network
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_sendTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_sendTransaction'
//     Parameters: [transaction: TransactionRequest]
//     ReturnType: Hash
//   },
//   /**
//    * @description Sends and already-signed transaction to the network
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_sendRawTransaction', params: ['0x...'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_sendRawTransaction'
//     Parameters: [signedTransaction: Hex]
//     ReturnType: Hash
//   },
//   /**
//    * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_sign', params: ['0x...', '0x...'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_sign'
//     Parameters: [
//       /** Address to use for signing */
//       address: Address,
//       /** Data to sign */
//       data: Hex,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Signs a transaction that can be submitted to the network at a later time using with `eth_sendRawTransaction`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_signTransaction', params: [{ from: '0x...', to: '0x...', value: '0x...' }] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_signTransaction'
//     Parameters: [request: TransactionRequest]
//     ReturnType: Hex
//   },
//   /**
//    * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_signTypedData_v4', params: [{ from: '0x...', data: [{ type: 'string', name: 'message', value: 'hello world' }] }] })
//    * // => '0x...'
//    */
//   {
//     Method: 'eth_signTypedData_v4'
//     Parameters: [
//       /** Address to use for signing */
//       address: Address,
//       /** Message to sign containing type information, a domain separator, and data */
//       message: string,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Returns information about the status of this client’s network synchronization
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'eth_syncing' })
//    * // => { startingBlock: '0x...', currentBlock: '0x...', highestBlock: '0x...' }
//    */
//   {
//     Method: 'eth_syncing'
//     Parameters?: undefined
//     ReturnType: NetworkSync | false
//   },
//   /**
//    * @description Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`
//    * @link https://eips.ethereum.org/EIPS/eip-1474
//    * @example
//    * provider.request({ method: 'personal_sign', params: ['0x...', '0x...'] })
//    * // => '0x...'
//    */
//   {
//     Method: 'personal_sign'
//     Parameters: [
//       /** Data to sign */
//       data: Hex,
//       /** Address to use for signing */
//       address: Address,
//     ]
//     ReturnType: Hex
//   },
//   /**
//    * @description Add an Ethereum chain to the wallet.
//    * @link https://eips.ethereum.org/EIPS/eip-3085
//    * @example
//    * provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/...' }] })
//    * // => { ... }
//    */
//   {
//     Method: 'wallet_addEthereumChain'
//     Parameters: [chain: AddEthereumChainParameter]
//     ReturnType: null
//   },
//   /**
//    * @description Gets the wallets current permissions.
//    * @link https://eips.ethereum.org/EIPS/eip-2255
//    * @example
//    * provider.request({ method: 'wallet_getPermissions' })
//    * // => { ... }
//    */
//   {
//     Method: 'wallet_getPermissions'
//     Parameters?: undefined
//     ReturnType: WalletPermission[]
//   },
//   /**
//    * @description Requests the given permissions from the user.
//    * @link https://eips.ethereum.org/EIPS/eip-2255
//    * @example
//    * provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
//    * // => { ... }
//    */
//   {
//     Method: 'wallet_requestPermissions'
//     Parameters: [permissions: { eth_accounts: Record<string, any> }]
//     ReturnType: WalletPermission[]
//   },
//   /**
//    * @description Switch the wallet to the given Ethereum chain.
//    * @link https://eips.ethereum.org/EIPS/eip-3326
//    * @example
//    * provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf00' }] })
//    * // => { ... }
//    */
//   {
//     Method: 'wallet_switchEthereumChain'
//     Parameters: [chain: { chainId: string }]
//     ReturnType: null
//   },
//   /**
//    * @description Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.
//    * @link https://eips.ethereum.org/EIPS/eip-747
//    * @example
//    * provider.request({ method: 'wallet_watchAsset' }] })
//    * // => true
//    */
//   {
//     Method: 'wallet_watchAsset'
//     Parameters: WatchAssetParams
//     ReturnType: boolean
//   },
// ];

/**
 * Utils
 */

export type RpcSchema = readonly {
  Method: string
  Parameters?: unknown
  ReturnType: unknown
}[];

export type RpcSchemaOverride = Omit<RpcSchema[number], 'Method'>;

export type EIP1193Parameters<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = TRpcSchema extends RpcSchema
  ? {
    [K in keyof TRpcSchema]: Prettify<{
      method: TRpcSchema[K] extends TRpcSchema[number]
        ? TRpcSchema[K]['Method']
        : never
    } & (TRpcSchema[K] extends TRpcSchema[number]
      ? TRpcSchema[K]['Parameters'] extends undefined
        ? { params?: never }
        : { params: TRpcSchema[K]['Parameters'] }
      : never)
    >
  }[number]
  : {
    method: string
    params?: unknown
  };

export type EIP1193RequestOptions = {
  // The base delay (in ms) between retries.
  retryDelay?: number
  // The max number of times to retry.
  retryCount?: number
};

type DerivedRpcSchema<
  TRpcSchema extends RpcSchema | undefined,
  TRpcSchemaOverride extends RpcSchemaOverride | undefined,
> = TRpcSchemaOverride extends RpcSchemaOverride
  ? [TRpcSchemaOverride & { Method: string }]
  : TRpcSchema;

export type EIP1193RequestFn<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = <
  TRpcSchemaOverride extends RpcSchemaOverride | undefined = undefined,
  TParameters extends EIP1193Parameters<DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>
  > = EIP1193Parameters<DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>>,
  _ReturnType = DerivedRpcSchema<
  TRpcSchema,
  TRpcSchemaOverride
  > extends RpcSchema
    ? Extract<
    DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>[number],
    { Method: TParameters['method'] }
    >['ReturnType']
    : unknown,
>(
  args: TParameters,
  options?: EIP1193RequestOptions,
) => Promise<_ReturnType>;
