import {
  JsonRpcSigner,
  Web3Provider
} from '@ethersproject/providers';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { BigNumberish, ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import moment from 'moment';
import { GuardedMulticallerAbi } from './abi/guardedMulticaller';
import { SimpleERC721Abi } from './abi/simpleERC721';

@customElement('imtbl-primary-sales-demo')
export class PrimarySalesDemo extends LitElement {
  private checkoutSDK: Checkout | undefined = undefined;

  private provider: Web3Provider | undefined = undefined;

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

    this.connectCheckoutSDK();
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

  async signTypedData(
    wallet: JsonRpcSigner,
    ref: string,
    targets: string[],
    data: string[],
    deadline: BigNumberish,
    verifyingContract: string,
    config: { name: string; version: string }
  ): Promise<string> {
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

  async executeMulticallerTransaction(
    wallet: JsonRpcSigner,
    erc721: ethers.Contract,
    connectedWalletAddress: string,
    guardedMulticaller: ethers.Contract
  ) {
    const deadline = moment.utc().add(30, 'minute').unix();
    const hash = new Date().getTime().toString();
    const ref = formatBytes32String('test' + hash);
    const targets = [erc721.address];

    const data = [
      erc721.interface.encodeFunctionData('mint', [connectedWalletAddress]),
    ];

    const sig = await this.signTypedData(
      wallet,
      ref,
      targets,
      data,
      deadline,
      guardedMulticaller.address,
      { name: "m", version: "1" }
    )

    const executeRes = await guardedMulticaller.execute(
      await wallet.getAddress(),
      ref,
      targets,
      data,
      deadline,
      sig
    );

    console.log('@@@@@ executeRes', executeRes);

    console.log('@@@@ erc721 totalysupply', await erc721.totalSupply());
    console.log('@@@@ erc721 user balanceOf', await erc721.balanceOf(await wallet.getAddress()));
  }

  async onInitiateClick() {
    const signer = await this.provider?.getSigner(this.connectedAddress);
    const GuardedMulticaller = new ethers.Contract(
      '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      GuardedMulticallerAbi,
      signer
    );

    const Erc721 = new ethers.Contract(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      SimpleERC721Abi,
      signer
    );

    await this.executeMulticallerTransaction(
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
