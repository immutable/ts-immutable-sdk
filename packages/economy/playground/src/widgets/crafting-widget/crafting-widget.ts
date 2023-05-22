import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Environment } from '@imtbl/config';
import { Economy } from '@imtbl/economy';
// FIXME: export this type
import { DomainRecipe } from '@imtbl/economy/dist/__codegen__/recipe';

type ComponentEvent = {
  type: 'userInfo';
  userInfo: { userId: string; email: string; address: string };
};

@customElement('crafting-widget')
export class CraftingWidget extends LitElement {
  @property({ type: String, attribute: 'game-id' })
  gameId!: string;

  @property({ type: String, attribute: 'user-id' })
  userId!: string;

  @property({ type: String, attribute: 'wallet-address' })
  walletAddress!: string;

  @state()
  inventory: Array<number> = [1, 2, 3];

  @state()
  recipes: Array<DomainRecipe> = [];
 
  private economy!: Economy;

  onComponentEvent(event: CustomEvent) {
    const detail = event.detail as ComponentEvent;
    console.log('onComponentEvent', { detail });

    if (detail.type === 'userInfo') {
      this.setUserInfoOnConnect(event.detail.userInfo);
    }
  }

  setUserInfoOnConnect(userInfo: ComponentEvent['userInfo']) {
    this.walletAddress = userInfo.address;
    this.userId = userInfo.userId;
    this.requestUpdate();
    console.log('setUserInfoOnConnect', { userInfo });
  }

  async loadRecipes() {
    this.recipes = await this.economy.recipe.getAll({
      gameId: this.gameId,
    });
    this.requestUpdate();
  }

  render() {
    const properties = {
      gameId: this.gameId,
      userId: this.userId,
      walletAddress: this.walletAddress,
    };

    const selectedItems = [
      {
        id: 1,
        name: 'item 1',
        image: 'https://via.placeholder.com/50',
        type: 'weapon',
      },
      {
        id: 2,
        name: 'item 2',
        image: 'https://via.placeholder.com/50',
        type: 'weapon',
      },
      {
        id: 3,
        name: 'item 3',
        image: 'https://via.placeholder.com/50',
        type: 'weapon',
      },
      {
        id: 4,
        name: 'item 4',
        image: 'https://via.placeholder.com/50',
        type: 'material',
      },
      {
        id: 5,
        name: 'item 5',
        image: 'https://via.placeholder.com/50',
        type: 'material',
      },
      {
        id: 6,
        name: 'item 6',
        image: 'https://via.placeholder.com/50',
        type: 'material',
      },
    ];

    return html`
      <div class="h-screen flex flex-col">
        <div class="drawer">
          <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content flex flex-col">
            <!-- Navbar -->
            <div class="w-full navbar bg-base-300">
              <div class="flex-none">
                <label for="my-drawer-3" class="btn btn-square btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
              <div class="prose flex-1 px-2"><h1>Crafting</h1></div>
              <div class="flex-1 px-2 ml-2">
                <input
                  type="text"
                  placeholder="Game Id"
                  class="input w-full max-w-xs ml-2"
                  .value="${this.gameId}"
                />
                <input
                  type="text"
                  placeholder="User Id"
                  class="input w-full max-w-xs ml-2"
                  .value="${this.userId}"
                />
                <input
                  type="text"
                  placeholder="Wallet Address"
                  class="input w-full max-w-xs ml-2"
                  .value="${this.walletAddress}"
                />
                <div class="w-full max-w-xs ml-2">
                  <recipe-selection
                    .recipes="${this.recipes}"
                  ></recipe-selection>
                </div>
                <!-- CONNECT -->
                <div class="ml-2">
                  <connect-button></connect-button>
                </div>
                <!-- CONNECT -->
              </div>
            </div>
            <div class="flex flex-col lg:flex-row h-full">
              <!-- INVENTORY -->
              <div
                class="bg-gray-100 overflow-hidden overflow-y-scroll max-h-96 lg:max-h-none"
              >
                <inventory-collection
                  .inventory="${this.inventory}"
                ></inventory-collection>
              </div>
              <!-- INVENTORY -->
              <div class="flex flex-1 flex-col lg:flex-row">
                <!-- SELECTION -->
                <div class=" flex-grow bg-gray-200">
                  Selection
                  <items-selection .items="${selectedItems}"></items-selection>
                </div>
                <!-- SELECTION -->
                <div class="divider lg:divider-horizontal">🟰</div>
                <!-- SUMMARY -->
                <div class="flex-grow bg-gray-300">
                  <div class="flex justify-center bg-gray-400 w-full p-2">
                    <button class="btn btn-wide">Craft</button>
                  </div>
                  <div class="flex flex-col w-full items-center">
                    <crafting-summary></crafting-summary>
                  </div>
                </div>
                <!-- SUMMARY -->
              </div>
            </div>
          </div>
          <div class="drawer-side">
            <!-- DRAWER -->
            <label for="my-drawer-3" class="drawer-overlay"></label>
            <div class="menu w-2/4 bg-base-100 p-4">
              <crafting-history></crafting-history>
            </div>
            <!-- DRAWER -->
          </div>
        </div>
      </div>

      <div>
        <h1>Crafting Widget</h1>
        <p>Game ID: ${this.gameId}</p>
        <p>User ID: ${this.userId}</p>
        <p>Wallet Address: ${this.walletAddress}</p>
        <pre>${JSON.stringify(properties, null, 2)}</pre>
      </div>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  getCustomEventHandler<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  setEconomy() {
    this.economy = Economy.build({
      gameId: this.gameId,
      userId: this.userId,
      walletAddress: this.walletAddress,
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      // overrides: {
      //   servicesBaseURL: 'http://127.0.0.1:3031',
      // },
    });
    this.loadRecipes();
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(
      'crafting-widget-event',
      this.getCustomEventHandler(this.onComponentEvent)
    );
    this.setEconomy();
  }
}
