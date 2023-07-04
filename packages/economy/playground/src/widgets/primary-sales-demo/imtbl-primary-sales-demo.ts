import {
  JsonRpcSigner,
  Web3Provider
} from '@ethersproject/providers';
import {
  Checkout,
  WalletProviderName
} from '@imtbl/checkout-sdk';
import {
  BigNumberish,
  ethers
} from 'ethers';
import {
  formatBytes32String
} from 'ethers/lib/utils';
import {
  LitElement,
  html
} from 'lit';
import {
  customElement,
  property
} from 'lit/decorators.js';
import moment from 'moment';
import {
  GuardedMulticallerAbi
} from './abi/guardedMulticaller';
import {
  SimpleERC721Abi
} from './abi/simpleERC721';

@customElement('imtbl-primary-sales-demo')
export class PrimarySalesDemo extends LitElement {
  private checkoutSDK: Checkout | undefined = undefined;

  private provider: Web3Provider | undefined = undefined;

  @property({ type: String, attribute: "guarded-multicaller-address" })
  guardedMulticallerAddress: string = "";

  @property({ type: String, attribute: "erc721-address" })
  erc721Address: string = "";

  @property({ type: String, attribute: "erc721-balance" })
  erc721Balance: string = "";

  @property({
    type: String,
    attribute: 'wallet-address'
  })
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

  handleInputChanges(key: "guardedMulticallerAddress" | "erc721Address") {
    return (event: InputEvent) => {
      this[key] = (event.target as HTMLInputElement).value;
      this.requestUpdate();
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

      await this.checkoutSDK.connect({
        provider: resp.provider
      })
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
    config: {
      name: string; version: string
    }
  ): Promise<string> {
    return await wallet._signTypedData({
      name: config.name,
      version: config.version,
      chainId: await wallet.getChainId(),
      verifyingContract: verifyingContract,
    }, {
      Multicall: [{
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
    }, {
      ref,
      targets,
      data,
      deadline,
    });
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
      guardedMulticaller.address, {
      name: "m",
      version: "1"
    }
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
      this.guardedMulticallerAddress,
      GuardedMulticallerAbi,
      signer
    );

    const Erc721 = new ethers.Contract(
      this.erc721Address,
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

  async onCheckBalanceClick() {
    const signer = await this.provider?.getSigner(this.connectedAddress);

    const Erc721 = new ethers.Contract(
      this.erc721Address,
      SimpleERC721Abi,
      signer
    );

    const balance = await Erc721.balanceOf(this.connectedAddress);
    this.erc721Balance = balance.toString();
    console.log('@@@@ erc721 balance', this.erc721Balance);
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="prose mb-4">
        <h1>Primary Sales Demo</h1>
      </div>

      <div class="flex-1 px-2 ml-2">
        <input
          type="text"
          placeholder="Deployed GuardedMulticaller Address"
          class="input w-full max-w-xs ml-2"
          .value="${this.guardedMulticallerAddress}"
          @blur="${this.handleInputChanges("guardedMulticallerAddress")}"
        />
        <input
          type="text"
          placeholder="Deployed ERC721 Address"
          class="input w-full max-w-xs ml-2"
          .value="${this.erc721Address}"
          @blur="${this.handleInputChanges("erc721Address")}"
        />
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
            class="btn btn-wide btn-primary mb-4"
            .disabled="${!this.erc721Address || !this.guardedMulticallerAddress || !this.connectedAddress}"
            @click="${this.onInitiateClick}"
          >
            Initiate
          </button>
          <button
            class="btn btn-wide btn-primary mb-4"
            .disabled="${!this.erc721Address || !this.connectedAddress}"
            @click="${this.onCheckBalanceClick}"
          >
            Check Balance
          </button>
          <p>
            Contract(${this.erc721Address}).balanceOf(${this.connectedAddress}) -> ${this.erc721Balance}
          </p>
        </div>
      </div>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}