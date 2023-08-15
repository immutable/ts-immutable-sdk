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
import axios from 'axios';

@customElement('imtbl-primary-sales-demo')
export class PrimarySalesDemo extends LitElement {
  private checkoutSDK: Checkout | undefined = undefined;

  private provider: Web3Provider | undefined = undefined;

  @property({ type: String, attribute: "guarded-multicaller-address" })
  guardedMulticallerAddress: string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  @property({ type: String, attribute: "erc721-address" })
  erc721Address: string = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  @property({ type: String, attribute: "game-id" })
  gameId: string = "shardbound";

  @property({ type: String, attribute: "game-id" })
  serverBaseUrl: string = "http://localhost:8070";


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

  handleInputChanges(key: "guardedMulticallerAddress" | "erc721Address" | "gameId" | "serverBaseUrl") {
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
    );

    const multicallSignerAddress = "0x51EE33CD6017E33F57b99a27d3ce81198650c6b1";

    const executeRes = await guardedMulticaller.execute(
      multicallSignerAddress,
      formatBytes32String("0123"),
      targets,
      data,
      deadline,
      sig,
      { gasLimit: 30000000 }
    );
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
    console.log('@@@@@ Erc721', Erc721)
    console.log('@@@@ onCheckBalance connectedAddress', this.connectedAddress);
    const balance = await Erc721.balanceOf(this.connectedAddress);
    this.erc721Balance = balance.toString();
    console.log('@@@@ erc721 balance', this.erc721Balance);
    this.requestUpdate();
  }

  async onInitiateMintClick() {
    let response;
    try {
      response = await axios.post(
        `${this.serverBaseUrl}/v1/games/${this.gameId}/initiate_mint`,
        {
          collection_address: this.erc721Address,
          recipient_address: this.connectedAddress,
        }
      )
      console.log('@@@@@ response from server', response);
      alert("Mint successful, check your balance")

    } catch (e) {
      console.log('@@@@@ error from server', e);
      alert("Mint failed.")
    }

  }

  render() {
    return html`
      <div class="prose mb-4">
        <h1>Primary Sales Demo</h1>
      </div>

      <div class="p-4 flex flex-row">
        <div class="form-control w-full max-w-s">
          <label class="label">
            <span class="label-text">GuardedMulticaller Address</span>
          </label>
          <input
            type="text"
            placeholder="Deployed GuardedMulticaller Address"
            class="input input-bordered w-full max-w-s"
            .value="${this.guardedMulticallerAddress}"
            @blur="${this.handleInputChanges("guardedMulticallerAddress")}"
          />
        </div>
        <div class="form-control w-full max-w-s">
          <label class="label">
            <span class="label-text">Deployed ERC721 Address</span>
          </label>
          <input
            type="text"
            placeholder="Deployed ERC721 Address"
            class="input input-bordered w-full max-w-s"
            .value="${this.erc721Address}"
            @blur="${this.handleInputChanges("erc721Address")}"
          />
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Game ID</span>
          </label>
          <input
            type="text"
            placeholder="Game ID"
            class="input input-bordered w-full max-w-s"
            .value="${this.gameId}"
            @blur="${this.handleInputChanges("gameId")}"
          />
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Server Base URL</span>
          </label>
          <input
            type="text"
            placeholder="Game ID"
            class="input input-bordered w-full max-w-s"
            .value="${this.serverBaseUrl}"
            @blur="${this.handleInputChanges("serverBaseUrl")}"
          />
        </div>
      </div>

      <div class="prose mb-4">
        <h3>
          ConnectedWallet:
          ${this.connectedAddress
        ? `${this.connectedAddress}`
        : 'No Wallet Connected'}
        </h3>
      </div>

      <div class="h-screen flex flex-row">
        <div class="ml-4 flex flex-col">
          <div class="flex flex-row">
            <button
                class="btn btn-wide btn-primary mb-4"
                .disabled="${!this.erc721Address || !this.gameId || !this.connectedAddress}"
                @click="${this.onInitiateMintClick}"
              >
                Initiate mint (server)
              </button>
              <p class="my-auto mx-6">
                or
              </p>
              <button
                class="btn btn-wide btn-primary mb-4"
                .disabled="${!this.erc721Address || !this.guardedMulticallerAddress || !this.connectedAddress}"
                @click="${this.onInitiateClick}"
              >
                Sign and execute (client)
              </button>
          </div>
          <button
            class="btn btn-wide btn-secondary mb-4"
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