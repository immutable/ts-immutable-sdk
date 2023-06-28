import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ERC20__factory } from '@imtbl/contracts/';
import {
  TransactionRequest,
  Web3Provider,
  JsonRpcSigner,
} from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import moment from 'moment';
import { formatBytes32String } from 'ethers/lib/utils';
import { BigNumberish, ethers } from 'ethers';

// mocked eth_signTypedData_v4 parameters. All of these parameters affect the resulting signature.
const mockMsgDataParams = {
  domain: {
    // This defines the network, in this case, Mainnet.
    chainId: 1,
    // Give a user-friendly name to the specific contract you're signing for.
    name: 'Ether Mail',
    // Add a verifying contract to make sure you're establishing contracts with the proper entity.
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    // This identifies the latest version.
    version: '1',
  },

  // This defines the message you're proposing the user to sign, is dapp-specific, and contains
  // anything you want. There are no required fields. Be as explicit as possible when building out
  // the message schema.
  message: {
    contents: 'Hello, Bob!',
    attachedMoneyInEth: 4.2,
    from: {
      name: 'Cow',
      wallets: [
        '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
      ],
    },
    to: [
      {
        name: 'Bob',
        wallets: [
          '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
          '0xB0B0b0b0b0b0B000000000000000000000000000',
        ],
      },
    ],
  },
  // This refers to the keys of the following types object.
  primaryType: 'Mail',
  types: {
    // This refers to the domain the contract is hosted on.
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    // Not an EIP712Domain definition.
    Group: [
      { name: 'name', type: 'string' },
      { name: 'members', type: 'Person[]' },
    ],
    // Refer to primaryType.
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person[]' },
      { name: 'contents', type: 'string' },
    ],
    // Not an EIP712Domain definition.
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallets', type: 'address[]' },
    ],
  },
};

@customElement('imtbl-primary-sales-demo')
export class PrimarySalesDemo extends LitElement {
  private checkoutSDK: Checkout | undefined = undefined;

  private provider: Web3Provider | undefined = undefined;

  // private signTypedData: any = undefined;

  @property({ type: String, attribute: 'wallet-address' })
  connectedAddress: string | undefined = undefined;

  constructor() {
    super();

    this.checkoutSDK = new Checkout();
  }

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // this.connect();

    this.connectCheckoutSDK();

    // this.checkoutWidgetConnect();
  }

  async connectCheckoutSDK() {
    if (this.checkoutSDK) {
      const resp = await this.checkoutSDK.createProvider({
        walletProvider: WalletProviderName.METAMASK,
      });

      this.provider = resp.provider;

      await this.checkoutSDK.connect({provider: resp.provider})
      const res = await this.checkoutSDK.checkIsWalletConnected({
        provider: resp.provider,
      });


      this.connectedAddress = res.walletAddress;

      console.log('@@@@@@@@ res checkIsWalletConnected', res);

      console.log('@@@@@@@ checkoutSDKConnect - resp', resp);

    const signer = await this.provider?.getSigner(res.walletAddress);
    console.log('@@@@@@@ checkoutSDKConnect - signer', signer);

    }
  }

  async checkoutWidgetConnect() {
    const handleConnectEvent = (event: any) => {
      switch (event.detail.type) {
        case 'success': {
          console.log('success: ', event);
          this.success();
          break;
        }
        case 'failure': {
          console.log('failure: ', event);
          break;
        }
        case 'close-widget': {
          console.log(event);
          break;
        }
        default:
          console.log('Unsupported event type');
      }
    };

    window.removeEventListener('imtbl-connect-widget', handleConnectEvent);
    window.addEventListener('imtbl-connect-widget', handleConnectEvent);
  }

  async success() {
    if (this.checkoutSDK) {
      const res = await this.checkoutSDK.checkIsWalletConnected({
        provider: this.provider as Web3Provider,
      });

      console.log('@@@@@@@@ res', res);

      if (res.isConnected) {
        this.connectedAddress = res.walletAddress;
      } else {
        this.connectedAddress = undefined;
      }
    }

    this.requestUpdate();
  }

  async connect() {
    return;

    const checkout = new Checkout();
    const resp = await checkout.createProvider({
      walletProvider: WalletProviderName.METAMASK,
    });
    const connect = await checkout.connect({ provider: resp.provider });
    const provider = connect.provider;

    // const usdcAddress = '0xA40b0dA87577Cd224962e8A3420631E1C4bD9A9f'; // polygon zkevm

    const usdcAddress = '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5'; // sepolia
    // 0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5

    const walletA = '0x7e562dE84C5e01cF0C098b9396b2a469AB4002e0';
    const walletB = '0x7a88d8d76a6422631C00Fc70E2CAab810B662D3d';

    const erc20ContractFactory = ERC20__factory.connect(usdcAddress, provider);
    console.log('@@@@@ erc20ContractFactory', erc20ContractFactory);

    // Approve first for wallet B
    // erc20ContractFactory.connect(provider.getSigner()).approve(walletA, 1000);

    // Then connect to wallet A and perform transfer on behalf of wallet B
    erc20ContractFactory
      .connect(provider.getSigner())
      .transferFrom(walletB, walletA, 1000);

    // note approve costs gas

    return;
    const totalSupply = await erc20ContractFactory.totalSupply();
    console.log('@@@@@ totalSupply', totalSupply.toString());

    const allowance = await erc20ContractFactory.allowance(walletA, walletB);
    console.log('@@@@@ allowance', allowance);

    console.log(
      '@@@@@@ owner balance',
      (await erc20ContractFactory.balanceOf(walletA)).toString()
    );
    console.log(
      '@@@@@@ recipient balance',
      (await erc20ContractFactory.balanceOf(walletB)).toString()
    );

    const erc20Contract = ERC20__factory.createInterface();
    const callData = erc20Contract.encodeFunctionData('approve', [
      walletA,
      1000,
    ]);

    const nonce = await provider.getTransactionCount(walletA);
    const network = await provider.getNetwork();

    const gasPrice = await provider.getGasPrice();

    const unsignedTx: TransactionRequest = {
      data: callData,
      to: walletB,
      value: '1000',
      from: walletA,
      gasPrice: gasPrice.toString(),
      gasLimit: '1000000',
      nonce: `${nonce}`,
      chainId: network.chainId,
    };

    console.log('@@@@@ sending tx ', unsignedTx);

    const txnResult = await checkout.sendTransaction({
      provider,
      transaction: unsignedTx,
    });

    console.log('@@@@@ txnResult ', txnResult);

    // return {
    //   data: callData,
    //   to: tokenAddress,
    //   value: 0,
    //   from: ownerAddress,
    // };

    // const approveTransaction = await getApproveTransaction(
    //   provider,
    //   fromAddress,
    //   tokenInAddress,
    //   ethers.BigNumber.from(amount),
    //   this.router.routingContracts.peripheryRouterAddress,
    // );

    // const txnResult = await checkout.sendTransaction({
    //   provider,
    //   transaction: data.approveTransaction.unsignedTx,
    // });
  }

  async generateSignTypedData() {
    console.log('generating sign typed data');
    const msgParams = JSON.stringify(mockMsgDataParams);

    const params = [this.connectedAddress, msgParams];
    const method = 'eth_signTypedData_v4';

    // web3.currentProvider.sendAsync(
    //   {
    //     method,
    //     params,
    //     from: from[0],
    //   },
    //   function (err, result) {
    //     if (err) return console.dir(err);
    //     if (result.error) {
    //       alert(result.error.message);
    //     }
    //     if (result.error) return console.error('ERROR', result);
    //     console.log('TYPED SIGNED:' + JSON.stringify(result.result));

    //     const recovered = sigUtil.recoverTypedSignature_v4({
    //       data: JSON.parse(msgParams),
    //       sig: result.result,
    //     });

    //     if (
    //       ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
    //     ) {
    //       alert('Successfully recovered signer as ' + from);
    //     } else {
    //       alert(
    //         'Failed to verify signer when comparing ' + result + ' to ' + from
    //       );
    //     }
    //   }
    // );
  }


  async signTypedData(
    wallet: JsonRpcSigner,
    ref: string,
    targets: string[],
    data: string[],
    deadline: BigNumberish,
    verifyingContract: string,
    config: { name: string; version: string }
  ): Promise<string> {

    const domain = {
      name: config.name,
      version: config.version,
      chainId: await wallet.getChainId(),
      verifyingContract: verifyingContract,
    };

    const multicall = [
      {
        name: "ref",
        type: "bytes32",
      },
      {
        name: "targets",
        type: "address[]",
      },
      {
        name: "data",
        type: "bytes[]",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ];


    console.log(
      {
        name: config.name,
        version: config.version,
        chainId: await wallet.getChainId(),
        verifyingContract: verifyingContract,
      },
      {
        Multicall: [
          {
            name: "ref",
            type: "bytes32",
          },
          {
            name: "targets",
            type: "address[]",
          },
          {
            name: "data",
            type: "bytes[]",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        ref,
        targets,
        data,
        deadline,
      })

    return await wallet._signTypedData(
      {
        name: config.name,
        version: config.version,
        chainId: await wallet.getChainId(),
        verifyingContract: verifyingContract,
      },
      {
        Multicall: [
          {
            name: "ref",
            type: "bytes32",
          },
          {
            name: "targets",
            type: "address[]",
          },
          {
            name: "data",
            type: "bytes[]",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        ref,
        targets,
        data,
        deadline,
      }
    );
  };

  async generateMulticallerTransaction(
    wallet: JsonRpcSigner,
    erc721: ethers.Contract,
    connectedWalletAddress: string,
    guardedMulticaller: ethers.Contract
  ) {
    // const deadline = moment.utc().add(30, 'minute').unix();
    const deadline = 1687924870;
    console.log('@@@@@ wallet', wallet);
    console.log('@@@@@ deadline', deadline);

    console.log('@@@@@ connectedWalletAddress', connectedWalletAddress);
    console.log('@@@@@ guardedMulticaller', guardedMulticaller);

    const hash = new Date().getTime().toString();
    const ref = formatBytes32String('test');
    const targets = [erc721.address];

    const data = [
      erc721.interface.encodeFunctionData('mint', [connectedWalletAddress]),
    ];

    console.log('@@@@@ data', data);

    const sig = await this.signTypedData(
      wallet,
      ref,
      targets,
      data,
      deadline,
      guardedMulticaller.address,
      { name: "m", version: "1" }
    )
    console.log('@@@@@ sig', sig);

    console.log('@@@@@ calling guardedMulticaller.execute', await wallet.getAddress());

    

    await guardedMulticaller.execute(
      await wallet.getAddress(),
      ref,
      targets,
      data,
      deadline,
      sig
    );
  }

  async onInitiateClick() {
    // await this.generateSignTypedData();'

    const signer = await this.provider?.getSigner(this.connectedAddress);

    // const [signer] = await ethers.getSigners();

    // const [signer] = await ethers.

    const guardedMulticallerAbi = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_version",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_addressLength",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_dataLength",
            "type": "uint256"
          }
        ],
        "name": "AddressDataArrayLengthsMismatch",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "EmptyAddressArray",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_deadline",
            "type": "uint256"
          }
        ],
        "name": "ExpiredSignature",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_target",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
          }
        ],
        "name": "FailedCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_ref",
            "type": "bytes32"
          }
        ],
        "name": "InvalidRef",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidShortString",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_target",
            "type": "address"
          }
        ],
        "name": "NonContractAddress",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_ref",
            "type": "bytes32"
          }
        ],
        "name": "RefAlreadyExecuted",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "str",
            "type": "string"
          }
        ],
        "name": "StringTooLong",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "_signature",
            "type": "bytes"
          }
        ],
        "name": "UnauthorizedSignature",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_multicallSigner",
            "type": "address"
          }
        ],
        "name": "UnauthorizedSigner",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [],
        "name": "EIP712DomainChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "_multicallSigner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "_ref",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "_targets",
            "type": "address[]"
          },
          {
            "indexed": false,
            "internalType": "bytes[]",
            "name": "_data",
            "type": "bytes[]"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "_deadline",
            "type": "uint256"
          }
        ],
        "name": "Multicalled",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "previousAdminRole",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "newAdminRole",
            "type": "bytes32"
          }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleGranted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleRevoked",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "eip712Domain",
        "outputs": [
          {
            "internalType": "bytes1",
            "name": "fields",
            "type": "bytes1"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "version",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "chainId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "verifyingContract",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          },
          {
            "internalType": "uint256[]",
            "name": "extensions",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_multicallSigner",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "_ref",
            "type": "bytes32"
          },
          {
            "internalType": "address[]",
            "name": "_targets",
            "type": "address[]"
          },
          {
            "internalType": "bytes[]",
            "name": "_data",
            "type": "bytes[]"
          },
          {
            "internalType": "uint256",
            "name": "_deadline",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "_signature",
            "type": "bytes"
          }
        ],
        "name": "execute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          }
        ],
        "name": "getRoleAdmin",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_user",
            "type": "address"
          }
        ],
        "name": "grantMulticallSignerRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes[]",
            "name": "_data",
            "type": "bytes[]"
          }
        ],
        "name": "hashBytesArray",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    const guardedMulticallerAbiString =
      "[{inputs:[{internalType:'address',name:'_owner',type:'address',},{internalType:'string',name:'_name',type:'string',},{internalType:'string',name:'_version',type:'string',},],stateMutability:'nonpayable',type:'constructor',},{inputs:[{internalType:'uint256',name:'_addressLength',type:'uint256',},{internalType:'uint256',name:'_dataLength',type:'uint256',},],name:'AddressDataArrayLengthsMismatch',type:'error',},{inputs:[],name:'EmptyAddressArray',type:'error',},{inputs:[{internalType:'uint256',name:'_deadline',type:'uint256',},],name:'ExpiredSignature',type:'error',},{inputs:[{internalType:'address',name:'_target',type:'address',},{internalType:'bytes',name:'_data',type:'bytes',},],name:'FailedCall',type:'error',},{inputs:[{internalType:'bytes32',name:'_ref',type:'bytes32',},],name:'InvalidRef',type:'error',},{inputs:[],name:'InvalidShortString',type:'error',},{inputs:[{internalType:'address',name:'_target',type:'address',},],name:'NonContractAddress',type:'error',},{inputs:[{internalType:'bytes32',name:'_ref',type:'bytes32',},],name:'RefAlreadyExecuted',type:'error',},{inputs:[{internalType:'string',name:'str',type:'string',},],name:'StringTooLong',type:'error',},{inputs:[{internalType:'bytes',name:'_signature',type:'bytes',},],name:'UnauthorizedSignature',type:'error',},{inputs:[{internalType:'address',name:'_multicallSigner',type:'address',},],name:'UnauthorizedSigner',type:'error',},{anonymous:false,inputs:[],name:'EIP712DomainChanged',type:'event',},{anonymous:false,inputs:[{indexed:true,internalType:'address',name:'_multicallSigner',type:'address',},{indexed:true,internalType:'bytes32',name:'_ref',type:'bytes32',},{indexed:false,internalType:'address[]',name:'_targets',type:'address[]',},{indexed:false,internalType:'bytes[]',name:'_data',type:'bytes[]',},{indexed:false,internalType:'uint256',name:'_deadline',type:'uint256',},],name:'Multicalled',type:'event',},{anonymous:false,inputs:[{indexed:true,internalType:'bytes32',name:'role',type:'bytes32',},{indexed:true,internalType:'bytes32',name:'previousAdminRole',type:'bytes32',},{indexed:true,internalType:'bytes32',name:'newAdminRole',type:'bytes32',},],name:'RoleAdminChanged',type:'event',},{anonymous:false,inputs:[{indexed:true,internalType:'bytes32',name:'role',type:'bytes32',},{indexed:true,internalType:'address',name:'account',type:'address',},{indexed:true,internalType:'address',name:'sender',type:'address',},],name:'RoleGranted',type:'event',},{anonymous:false,inputs:[{indexed:true,internalType:'bytes32',name:'role',type:'bytes32',},{indexed:true,internalType:'address',name:'account',type:'address',},{indexed:true,internalType:'address',name:'sender',type:'address',},],name:'RoleRevoked',type:'event',},{inputs:[],name:'DEFAULT_ADMIN_ROLE',outputs:[{internalType:'bytes32',name:'',type:'bytes32',},],stateMutability:'view',type:'function',},{inputs:[],name:'eip712Domain',outputs:[{internalType:'bytes1',name:'fields',type:'bytes1',},{internalType:'string',name:'name',type:'string',},{internalType:'string',name:'version',type:'string',},{internalType:'uint256',name:'chainId',type:'uint256',},{internalType:'address',name:'verifyingContract',type:'address',},{internalType:'bytes32',name:'salt',type:'bytes32',},{internalType:'uint256[]',name:'extensions',type:'uint256[]',},],stateMutability:'view',type:'function',},{inputs:[{internalType:'address',name:'_multicallSigner',type:'address',},{internalType:'bytes32',name:'_ref',type:'bytes32',},{internalType:'address[]',name:'_targets',type:'address[]',},{internalType:'bytes[]',name:'_data',type:'bytes[]',},{internalType:'uint256',name:'_deadline',type:'uint256',},{internalType:'bytes',name:'_signature',type:'bytes',},],name:'execute',outputs:[],stateMutability:'nonpayable',type:'function',},{inputs:[{internalType:'bytes32',name:'role',type:'bytes32',},],name:'getRoleAdmin',outputs:[{internalType:'bytes32',name:'',type:'bytes32',},],stateMutability:'view',type:'function',},{inputs:[{internalType:'address',name:'_user',type:'address',},],name:'grantMulticallSignerRole',outputs:[],stateMutability:'nonpayable',type:'function',},{inputs:[{internalType:'bytes32',name:'role',type:'bytes32',},{internalType:'address',name:'account',type:'address',},],name:'grantRole',outputs:[],stateMutability:'nonpayable',type:'function',},{inputs:[{internalType:'bytes32',name:'role',type:'bytes32',},{internalType:'address',name:'account',type:'address',},],name:'hasRole',outputs:[{internalType:'bool',name:'',type:'bool',},],stateMutability:'view',type:'function',},{inputs:[{internalType:'bytes[]',name:'_data',type:'bytes[]',},],name:'hashBytesArray',outputs:[{internalType:'bytes32',name:'',type:'bytes32',},],stateMutability:'pure',type:'function',},{inputs:[{internalType:'bytes32',name:'role',type:'bytes32',},{internalType:'address',name:'account',type:'address',},],name:'renounceRole',outputs:[],stateMutability:'nonpayable',type:'function',},{inputs:[{internalType:'bytes32',name:'role',type:'bytes32',},{internalType:'address',name:'account',type:'address',},],name:'revokeRole',outputs:[],stateMutability:'nonpayable',type:'function',},{inputs:[{internalType:'bytes4',name:'interfaceId',type:'bytes4',},],name:'supportsInterface',outputs:[{internalType:'bool',name:'',type:'bool',},],stateMutability:'view',type:'function',},]";

    const erc721Abi = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner_',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name_',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol_',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'version_',
            type: 'string',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'approved',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Approval',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'bool',
            name: 'approved',
            type: 'bool',
          },
        ],
        name: 'ApprovalForAll',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'previousAdminRole',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'newAdminRole',
            type: 'bytes32',
          },
        ],
        name: 'RoleAdminChanged',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
        ],
        name: 'RoleGranted',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
        ],
        name: 'RoleRevoked',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      {
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
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
        name: 'DOMAIN_SEPARATOR',
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
        name: 'MINTER_ROLE',
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
        name: 'PERMIT_TYPEHASH',
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
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
        ],
        name: 'balanceOf',
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
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'getApproved',
        outputs: [
          {
            internalType: 'address',
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
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
        ],
        name: 'getRoleAdmin',
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
            internalType: 'address',
            name: 'user_',
            type: 'address',
          },
        ],
        name: 'grantMinterRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'hasRole',
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
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
        ],
        name: 'isApprovedForAll',
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
            internalType: 'address',
            name: 'to_',
            type: 'address',
          },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'name',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'ownerOf',
        outputs: [
          {
            internalType: 'address',
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
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        name: 'permit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'renounceRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'revokeRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'to_',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data_',
            type: 'bytes',
          },
        ],
        name: 'safeMint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'approved',
            type: 'bool',
          },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'bytes4',
            name: 'interfaceId',
            type: 'bytes4',
          },
        ],
        name: 'supportsInterface',
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
        inputs: [],
        name: 'symbol',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'index',
            type: 'uint256',
          },
        ],
        name: 'tokenByIndex',
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
        name: 'tokenNonce',
        outputs: [
          {
            internalType: 'uint256',
            name: '_value',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'index',
            type: 'uint256',
          },
        ],
        name: 'tokenOfOwnerByIndex',
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
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'tokenURI',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalSupply',
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
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const erc721AbiString =
      '[{"inputs":[{"internalType":"address","name":"owner_","type":"address"},{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"string","name":"version_","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINTER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user_","type":"address"}],"name":"grantMinterRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to_","type":"address"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to_","type":"address"},{"internalType":"bytes","name":"data_","type":"bytes"}],"name":"safeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenNonce","outputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}]';

    const GuardedMulticaller = new ethers.Contract(
      '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      guardedMulticallerAbi,
      signer
    );

    console.log('GuardedMulticaller', GuardedMulticaller);

    const Erc721 = new ethers.Contract(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      erc721Abi,
      signer
    );

    console.log('Erc721', Erc721);


    await this.generateMulticallerTransaction(
      signer as JsonRpcSigner,
      Erc721,
      this.connectedAddress as string,
      GuardedMulticaller
    );
  }

  render() {
    return html`
      <div class="prose mb-4">
        <h1>Primary Sales Demo</h1>
      </div>

      <div class="prose mb-4">
        <h3>
          Wallet:
          ${this.connectedAddress
            ? `${this.connectedAddress}`
            : 'No Wallet Connected'}
        </h3>
      </div>

      <div class="h-screen flex flex-row">
        <!-- <imtbl-connect
          providerPreference="metamask"
          theme="dark"
          environment="sandbox"
        ></imtbl-connect> -->

        <div class="ml-4">
          <button
            class="btn btn-wide btn-primary"
            @click="${this.onInitiateClick}"
          >
            Initiate
          </button>
        </div>
      </div>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
