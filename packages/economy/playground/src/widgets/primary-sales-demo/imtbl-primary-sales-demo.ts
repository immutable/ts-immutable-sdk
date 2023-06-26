import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ERC20__factory } from '@imtbl/contracts/';
import { TransactionRequest } from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';

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

  private provider: any = undefined;

  private signTypedData: any = undefined;

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

    this.checkoutWidgetConnect();
  }

  async connectCheckoutSDK() {
    if (this.checkoutSDK) {
      const resp = await this.checkoutSDK.createProvider({
        walletProvider: WalletProviderName.METAMASK,
      });

      this.provider = resp.provider;

      console.log('@@@@@@@ checkoutSDKConnect - resp', resp);
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
        provider: this.provider,
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

  async onInitiateClick() {
    await this.generateSignTypedData();
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
        <imtbl-connect
          providerPreference="metamask"
          theme="dark"
          environment="sandbox"
        ></imtbl-connect>

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
