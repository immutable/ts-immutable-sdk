import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

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
  recipes: Array<unknown> = ['A', 'B', 'C'];

  onConnectClick() {
    this.inventory = [...this.inventory, 1, 2, 3, 5, 6, 7, 8, 9, 10];
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
                  placeholder="User Id"
                  class="input w-full max-w-xs ml-2"
                />
                <input
                  type="text"
                  placeholder="Game Id"
                  class="input w-full max-w-xs ml-2"
                />
                <input
                  type="text"
                  placeholder="Wallet Address"
                  class="input w-full max-w-xs ml-2"
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
                  <div class="flex flex-col w-full items-center">Summary</div>
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
}
