export const CHECKPOINT_MANAGER = [
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
    inputs: [],
    name: 'DOMAIN',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bls',
    outputs: [
      {
        internalType: 'contract IBLS',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bn256G2',
    outputs: [
      {
        internalType: 'contract IBN256G2',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chainId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
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
    name: 'checkpointBlockNumbers',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
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
    name: 'checkpoints',
    outputs: [
      {
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'eventRoot',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentCheckpointBlockNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentEpoch',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
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
    name: 'currentValidatorSet',
    outputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'votingPower',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentValidatorSetHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentValidatorSetLength',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
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
    ],
    name: 'getCheckpointBlock',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
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
        internalType: 'bytes32',
        name: 'leaf',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'leafIndex',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
    ],
    name: 'getEventMembershipByBlockNumber',
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
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'leaf',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'leafIndex',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]',
      },
    ],
    name: 'getEventMembershipByEpoch',
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
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'getEventRootByBlock',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBLS',
        name: 'newBls',
        type: 'address',
      },
      {
        internalType: 'contract IBN256G2',
        name: 'newBn256G2',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'chainId_',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: '_address',
            type: 'address',
          },
          {
            internalType: 'uint256[4]',
            name: 'blsKey',
            type: 'uint256[4]',
          },
          {
            internalType: 'uint256',
            name: 'votingPower',
            type: 'uint256',
          },
        ],
        internalType: 'struct ICheckpointManager.Validator[]',
        name: 'newValidatorSet',
        type: 'tuple[]',
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
        components: [
          {
            internalType: 'bytes32',
            name: 'blockHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'blockRound',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'currentValidatorSetHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ICheckpointManager.CheckpointMetadata',
        name: 'checkpointMetadata',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'epoch',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'blockNumber',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'eventRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ICheckpointManager.Checkpoint',
        name: 'checkpoint',
        type: 'tuple',
      },
      {
        internalType: 'uint256[2]',
        name: 'signature',
        type: 'uint256[2]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: '_address',
            type: 'address',
          },
          {
            internalType: 'uint256[4]',
            name: 'blsKey',
            type: 'uint256[4]',
          },
          {
            internalType: 'uint256',
            name: 'votingPower',
            type: 'uint256',
          },
        ],
        internalType: 'struct ICheckpointManager.Validator[]',
        name: 'newValidatorSet',
        type: 'tuple[]',
      },
      {
        internalType: 'bytes',
        name: 'bitmap',
        type: 'bytes',
      },
    ],
    name: 'submit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalVotingPower',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
