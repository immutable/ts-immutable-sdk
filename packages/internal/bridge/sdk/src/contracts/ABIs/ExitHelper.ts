export const EXIT_HELPER = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bool',
        name: 'success',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'returnData',
        type: 'bytes',
      },
    ],
    name: 'ExitProcessed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'blockNumber',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leafIndex',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'unhashedLeaf',
            type: 'bytes',
          },
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct IExitHelper.BatchExitInput[]',
        name: 'inputs',
        type: 'tuple[]',
      },
    ],
    name: 'batchExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkpointManager',
    outputs: [
      {
        internalType: 'contract ICheckpointManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'leafIndex',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'unhashedLeaf',
        type: 'bytes',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
    ],
    name: 'exit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ICheckpointManager',
        name: 'newCheckpointManager',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'processedExits',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
