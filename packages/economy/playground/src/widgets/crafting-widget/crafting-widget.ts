import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Environment } from '@imtbl/config';
import { Economy } from '@imtbl/economy';
// FIXME: export this type
import { DomainRecipe } from '@imtbl/economy/dist/__codegen__/recipe';
import { InventoryItem } from '@imtbl/economy/dist/__codegen__/inventory';
import { DomainCraft } from '@imtbl/economy/dist/__codegen__/crafting';

type ComponentEvent =
  | {
      type: 'userInfo';
      data: { userId: string; email: string; address: string };
    }
  | {
      type: 'item-selected';
      data: InventoryItem;
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
  inventory: Array<Required<InventoryItem>> = [];

  @state()
  recipes: Array<DomainRecipe> = [];

  @state()
  crafts: Array<DomainCraft> = [];

  @state()
  selectedItems: Map<string, Required<InventoryItem>> = new Map();

  private economy!: Economy;

  onComponentEvent(event: CustomEvent) {
    const detail = event.detail as ComponentEvent;
    console.log('onComponentEvent', { detail });

    if (detail.type === 'userInfo') {
      this.setUserInfoOnConnect(detail.data);
    }

    if (detail.type === 'item-selected') {
      this.selectItem(detail.data);
    }
  }

  setUserInfoOnConnect(data: { userId: string; address: string }) {
    this.walletAddress = data.address;
    this.userId = data.userId;
    this.requestUpdate();
  }

  selectItem(item: InventoryItem) {
    if (this.selectedItems.has(item.id)) {
      this.selectedItems.delete(item.id);
    }

    if (!this.selectedItems.has(item.id)) {
      this.selectedItems.set(item.id, item);
    }

    this.requestUpdate();
  }

  async getRecipes() {
    this.recipes = await this.economy.recipe.getAll({
      gameId: this.gameId,
    });
    this.requestUpdate();
  }

  async getInventory() {
    this.inventory = (await this.economy.inventory.getItems({
      gameID: this.gameId,
      owner: [this.userId],
    })) as Required<InventoryItem>[];
    this.requestUpdate();
  }

  async getCrafts() {
    this.crafts = await this.economy.crafting.getCraftsByGameId(this.gameId);
    this.requestUpdate();
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
  }

  handleInputChanges(key: 'userId' | 'walletAddress' | 'gameId') {
    return (event: InputEvent) => {
      this[key] = (event.target as HTMLInputElement).value;
      this.requestUpdate();
    };
  }

  render() {
    const selectedItems = Array.from(this.selectedItems.values());

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
                  @blur="${this.handleInputChanges('gameId')}"
                />
                <input
                  type="text"
                  placeholder="User Id"
                  class="input w-full max-w-xs ml-2"
                  .value="${this.userId}"
                  @blur="${this.handleInputChanges('userId')}"
                  />
                  <input
                  type="text"
                  placeholder="Wallet Address"
                  class="input w-full max-w-xs ml-2"
                  .value="${this.walletAddress}"
                  @blur="${this.handleInputChanges('walletAddress')}"
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
              <crafting-history .crafts=${this.crafts}></crafting-history>
            </div>
            <!-- DRAWER -->
          </div>
        </div>
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

  connectedCallback(): void {
    super.connectedCallback();
    this.setEconomy();
    this.getRecipes();
    this.getCrafts();
    this.getInventory();
    const refreshInterval = setInterval(() => {
      this.getInventory();
      this.getCrafts();
    }, 3000);
    window.addEventListener('beforeunload', () =>
      clearInterval(refreshInterval)
    );

    window.addEventListener(
      'crafting-widget-event',
      this.getCustomEventHandler(this.onComponentEvent)
    );
  }
}
