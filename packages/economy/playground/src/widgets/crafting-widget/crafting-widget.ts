import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('crafting-widget')
export class CraftingWidget extends LitElement {
  @property({ type: String, attribute: 'game-id' })
  gameId!: string;

  @property({ type: String, attribute: 'user-id' })
  userId!: string;

  @property({ type: String, attribute: 'wallet-address' })
  walletAddress!: string;

  render() {
    const properties = {
      gameId: this.gameId,
      userId: this.userId,
      walletAddress: this.walletAddress,
    };
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
                <select class="select select-primary w-full max-w-xs ml-2">
                  <option disabled selected>Select a recipe</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                </select>
                <!-- CONNECT -->
                <button class="btn ml-2">Connect</button>
                <!-- CONNECT -->
              </div>
            </div>
            <div class="flex flex-col lg:flex-row h-full">
              <!-- INVENTORY -->
              <div
                class="bg-gray-100 overflow-hidden overflow-y-scroll max-h-96 lg:max-h-none"
              >
                Inventory
                <!-- ITEMS -->
                <div
                  class="grid gap-x-4 gap-y-8 grid-cols-3 md:grid-cols-4 px-8 justify-items-start"
                >
                  <div class="stack">
                    <div
                      class="grid w-32 h-32 bg-base-300 place-items-center my-4"
                    >
                      stacked
                    </div>
                    <div
                      class="grid w-32 h-32 bg-base-300 place-items-center my-4"
                    >
                      stacked
                    </div>
                    <div
                      class="grid w-32 h-32 bg-base-300 place-items-center my-4"
                    >
                      stacked
                    </div>
                    <div
                      class="grid w-32 h-32 bg-base-300 place-items-center my-4"
                    >
                      stacked
                    </div>
                  </div>
                  ${Array.from({ length: 100 }).map(
                    () => html` <div class="indicator">
                        <!-- ITEM -->
                        <span class="indicator-item badge badge-secondary"
                          >new</span
                        >
                        <div
                          class="grid w-32 h-32 bg-base-300 place-items-center"
                        >
                          item
                        </div>
                      </div>
                      <!-- ITEM -->`
                  )}
                </div>
                <!-- ITEMS -->
              </div>
              <!-- INVENTORY -->
              <div class="flex flex-1 flex-col lg:flex-row">
                <!-- SELECTION -->
                <div class=" flex-grow bg-gray-200">
                  Selection
                  <div class="prose">
                    <ul class="tree">
                      <li>
                        <details>
                          <summary group="1">First Item</summary>
                          <ul class="tree">
                            <li>First item</li>
                            <li>
                              <details>
                                <summary group="1">Third Item</summary>
                                <ul class="tree">
                                  <li>First item</li>
                                  <li>Second item</li>
                                  <li>Another Here</li>
                                </ul>
                              </details>
                            </li>
                            <li>Another Here</li>
                          </ul>
                        </details>
                      </li>
                      <li>
                        <details>
                          <summary group="1">Second Item</summary>
                          <ul class="tree">
                            <li>First item</li>
                            <li>
                              <details>
                                <summary group="1">Third Item</summary>
                                <ul class="tree">
                                  <li>First item</li>
                                  <li>Second item</li>
                                  <li>Another Here</li>
                                </ul>
                              </details>
                            </li>
                            <li>Another Here</li>
                          </ul>
                        </details>
                      </li>
                    </ul>
                  </div>
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
            <div
              class="menu p-4 w-2/4 bg-base-100 prose overflow-hidden overflow-y-scroll"
            >
              <h2 class="">History</h2>
              <div class="p-2 mb-8 outline outline-1 outline-slate-800">
                <code>576890-fgdd7980-=fd7980-=fds7890-=</code>
                <ul class="steps w-full">
                  <li class="step step-info" data-content="✓">Created</li>
                  <li class="step step-info" data-content="✓">Received</li>
                  <li class="step step-info" data-content="✓">Minted</li>
                  <li data-content="●" class="step step-neutral">Completed</li>
                </ul>
              </div>
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
