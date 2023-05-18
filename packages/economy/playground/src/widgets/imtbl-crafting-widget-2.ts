import { LitElement, css, html } from 'lit';
import { customElement, state, eventOptions } from 'lit/decorators.js';
import { Economy, EconomyCustomEventTypes } from '@imtbl/economy';
import type { CraftInput } from '@imtbl/economy';
import { cache } from 'lit/directives/cache.js';
import { Environment } from '@imtbl/config';

const HardcodedCardUpgradeRecipe = {
  id: 'f3f3e906-6da9-4d0f-85c6-31b20b159310',
  game_id: 'shardbound',
  name: 'Creature upgrade',
  description: "Luã's test",
  status: 'draft',
  inputs: [
    {
      id: '39e45319-afbe-4b6a-af36-54793d17acc9',
      type: 'single_item',
      name: 'Creature being upgraded',
      conditions: [
        {
          type: '',
          ref: 'Level',
          comparison: 'eq',
          expected: '1',
        },
      ],
    },
    {
      id: 'dcc4d637-fc29-4851-9db9-41d6430f7b3b',
      type: 'multiple_items',
      name: 'Dust cost',
      conditions: [
        {
          type: 'sum',
          ref: 'dust_power',
          comparison: 'gte',
          expected: '100',
        },
      ],
    },
  ],
  outputs: [
    {
      id: 'd84522e6-ca5e-4628-a131-39dcf56617e0',
      type: 'item_definition',
      name: 'Upgraded creature',
      ref: '0f89554b-2c92-4220-b43e-8317a0b117c5',
      location: 'offchain',
      data: {},
    },
  ],
  created_at: '2023-04-12T04:49:46.149552Z',
  updated_at: '2023-04-27T05:10:28.298106Z',
};

const mockOutputItem = {
  id: '0f89554b-2c92-4220-b43e-8317a0b117c5',
  game_id: 'shardbound',
  item_template_id: 'b7a41354-d8ec-11ed-afa1-0242ac120002',
  type: 'Card',
  name: 'Demogorgon+',
  description: 'Deal 3 damage to a random sleeping enemy creature',
  properties: {
    Attack: 8,
    Health: 6,
    Level: 2,
    Mana: 7,
    dust_power: 100,
  },
  image: 'https://images.godsunchained.com/art2/500/94.webp',
  property_schema: {},
  status: 'draft',
  published_at: null,
  created_at: '2023-04-12T04:48:01.764483Z',
  updated_at: '2023-04-12T04:48:01.764483Z',
};

@customElement('imtbl-crafting-widget-2')
export class CraftingWidget2 extends LitElement {
  static styles = css``;

  private economy: Economy;

  constructor() {
    super();
    this.economy = Economy.build({
      gameId: 'shardbound',
      userId: 'jimmy-test',
      walletAddress: '0x',
      imxProvider: undefined,
      baseConfig: {
        environment: Environment.PRODUCTION,
      },
      overrides: {
        servicesBaseURL: 'http://127.0.0.1:3031',
      },
    });
    this.loadInventory();
  }

  @state()
  private state: CraftInput = {
    requiresWeb3: false,
    input: {
      userId: 'jimmy-test',
      gameId: 'shardbound',
      recipeId: HardcodedCardUpgradeRecipe.id,
      ingredients: [],
    },
  };
  private cardToUpgrade: any = undefined;
  private selectedDustItems: any[] = [];
  private craftingDisabled: boolean = true;
  private craftLoading: boolean = false;
  private showOutput: boolean = false;
  private inventoryItems: any[] = [];
  private dustExpected: any;
  private dustPowerTotal = 0;
  connectedCallback() {
    console.log('CraftingCardUpgrade :: connectedCallback');
    super.connectedCallback();
    window.addEventListener(
      EconomyCustomEventTypes.DEFAULT,
      this.handleCustomEvent(this.handleConnectEvent)
    );
  }

  firstUpdated() {
    console.log('CraftingCardUpgrade :: firstUpdated');
    // Check the component was mounted
  }

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  handleConnectEvent(event: CustomEvent) {
    console.log('CraftingCardUpgrade :: Getting event from within Economy');
    console.log(event);
  }

  @eventOptions({ capture: true })
  handleCraftClick(event: MouseEvent) {
    event.preventDefault();
    console.log('craft button clicked');
    this.submitCrafting();
    this.requestUpdate();
  }

  async loadInventory() {
    console.log('loadInventory');

    this.inventoryItems = await this.economy.inventory.getItems({
      owner: this.state.input.userId,
      gameId: this.state.input.gameId,
    });
    this.requestUpdate();
  }

  selectItem(item: any) {
    return (event: MouseEvent) => {
      event.preventDefault();
      console.log(item);

      if (this.cardToUpgrade === undefined) {
        this.cardToUpgrade = item;
      } else {
        this.selectedDustItems.push(item);
      }
      this.inventoryItems = this.inventoryItems.filter((i) => i.id !== item.id);
      this.validateCraftButton();
      this.requestUpdate();
      return;
    };
  }

  renderInventory() {
    return html` <h2 class="is-size-3">Inventory Items</h2>
      <div class="list has-hoverable-list-items">
        ${this.inventoryItems.map((item) => this.renderInventoryItem(item))}
      </div>`;
  }

  renderInventoryItem(item: any) {
    return html` <div class="list-item" @click=${this.selectItem(item)}>
      <div class="list-item-image">
        <figure class="image is-64x64">
          <img class="is-rounded" src="${item.metadata.image}" />
        </figure>
      </div>

      <div class="list-item-content">
        <div class="list-item-title">${item.metadata.name}</div>
        <div class="list-item-description is-flex is-flex-direction-row">
          <div class="mr-2">Level ${item.metadata.Level}</div>
          <div class="mr-2">Attack ${item.metadata.Attack}</div>
          <div class="mr-2">Mana ${item.metadata.Mana}</div>
          <div class="mr-2">Health ${item.metadata.Health}</div>
          <div class="mr-2">
            ${item.metadata.dust_cost | item.metadata.dust_power} Dust
          </div>
        </div>
      </div>
    </div>`;
  }

  renderSelectedDustCards() {
    return html` <h2 class="is-size-3">Dust Items</h2>
      <div class="list has-hoverable-list-items">
        ${this.selectedDustItems.map((item) =>
          this.renderSelectedDustCard(item)
        )}
      </div>`;
  }

  renderSelectedDustCard(item: any) {
    return html` <div class="list-item">
      <div class="list-item-image">
        <figure class="image is-64x64">
          <img class="is-rounded" src="${item.metadata.image}" />
        </figure>
      </div>

      <div class="list-item-content">
        <div class="list-item-title">${item.metadata.name}</div>
        <div class="list-item-description is-flex is-flex-direction-row">
          <div class="mr-2">Attack ${item.metadata.Attack}</div>
          <div class="mr-2">Mana: ${item.metadata.Mana}</div>
          <div class="mr-2">Health: ${item.metadata.Health}</div>
          <div class="mr-2">
            ${item.metadata.dust_cost | item.metadata.dust_power} Dust
          </div>
        </div>
      </div>
      <button @click=${this.handleRemoveDustItem(item)}>🗑️</button>
    </div>`;
  }

  resetCraftItems() {
    this.inventoryItems.push(this.cardToUpgrade);
    this.cardToUpgrade = undefined;
    this.inventoryItems.push(...this.selectedDustItems);
    this.selectedDustItems = [];
    this.requestUpdate();
  }

  renderCardUpgradeInfo() {
    return html`<div>
      <h2 class="mb-4 is-size-3">Card To Upgrade</h2>
      <div class="is-flex is-flex-direction-column">
        <div class="columns is-flex is-flex-direction-column">
          ${cache(this.renderCardToUpgrade())}
          <button @click=${this.resetCraftItems}>🗑️ Reset</button>
        </div>
        <div class="">
          <p>
            DUST REQUIRED: ${this.dustPowerTotal} / ${this.dustExpected | 0}
          </p>
          <p>
            Upgrade Level from
            ${this.cardToUpgrade ? this.cardToUpgrade.metadata.level : '?'} to
            ${this.cardToUpgrade ? mockOutputItem.properties.Level : '?'}
          </p>
          <p>
            Upgrade Attack from
            ${this.cardToUpgrade ? this.cardToUpgrade.metadata.attack : '?'} to
            ${this.cardToUpgrade ? mockOutputItem.properties.Attack : '?'}
          </p>
          <p>
            Upgrade Health from
            ${this.cardToUpgrade ? this.cardToUpgrade.metadata.health : '?'} to
            ${this.cardToUpgrade ? mockOutputItem.properties.Health : '?'}
          </p>
        </div>
        ${cache(this.renderCraftButton())}
      </div>
    </div>`;
  }

  renderCardToUpgrade() {
    return html`
      <div class="card column">
        <div class="card-image">
          <figure class="image is-4by3">
            <img
              src="${this.cardToUpgrade?.metadata.image}"
              alt="Placeholder image"
            />
          </figure>
        </div>
        <div class="card-content">
          <div class="content">
            <p class="title is-4">${this.cardToUpgrade?.metadata.name}</p>
            <p class="subtitle is-6">
              ${this.cardToUpgrade?.metadata.description}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  validateCraftButton() {
    this.dustExpected =
      HardcodedCardUpgradeRecipe.inputs[1].conditions[0].expected;

    const dustPowerArray = this.selectedDustItems.map(
      (item) => item.metadata.dust_power
    );
    this.dustPowerTotal = dustPowerArray.reduce((a, b) => a + b, 0);

    if (this.dustPowerTotal >= this.dustExpected) {
      this.craftingDisabled = false;
    } else {
      this.craftingDisabled = true;
    }
  }

  renderCraftButton() {
    if (this.craftingDisabled) {
      return html` <button id="craft-button" class="button is-info" disabled>
        Craft
      </button>`;
    } else {
      return html` <button
        id="craft-button"
        class="button is-info ${this.craftLoading ? 'is-loading' : ''}}"
        @click=${this.handleCraftClick}
      >
        Craft
      </button>`;
    }
  }

  prepareIngredientsForCraft() {
    this.state.input.ingredients = [
      {
        itemId: this.cardToUpgrade.id,
        conditionId: HardcodedCardUpgradeRecipe.inputs[0].id,
      },
    ];

    this.selectedDustItems.forEach((item) => {
      this.state.input.ingredients.push({
        itemId: item.id,
        conditionId: HardcodedCardUpgradeRecipe.inputs[1].id,
      });
    });
  }

  closeUpgradedCardModal() {
    const modalEl = document.getElementById('upgraded-card-modal');
    modalEl?.classList.remove('is-active');
    this.requestUpdate();
  }

  handleRemoveDustItem(item: any) {
    console.log(item);
    return (event: MouseEvent) => {
      event.preventDefault();
      this.inventoryItems.push(item);
      this.selectedDustItems = this.selectedDustItems.filter(
        (i) => i.id !== item.id
      );
      this.requestUpdate();
    };
  }

  @eventOptions({ capture: true })
  async submitCrafting() {
    this.prepareIngredientsForCraft();
    console.log('CraftingCardUpgrade :: submitCrafting');
    this.economy.crafting.craft(this.state);
    this.economy.subscribe((events) => {
      console.log(events, 'events');
      if (events.action !== 'CRAFT') {
        return;
      }
      if (events.status === 'IN_PROGRESS') {
        this.craftLoading = true;
      }
      if (['COMPLETED', 'FAILED'].includes(events.status)) {
        this.craftLoading = false;
      }
      if (events.status === 'COMPLETED') {
        this.showOutput = true;
      }
      this.requestUpdate();
    });
  }

  renderOutput() {
    return html`<div id="upgraded-card-modal" class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-content">
      <div class="card">
        <div class="card-image">
        <figure class="image is-4by3">
          <img src="${mockOutputItem.image}" alt="Placeholder image" />
        </figure>
      </div>
      <div class="card-content">
        <div class="content">
          <p class="title is-4">${mockOutputItem.name}</p>
          <p class="subtitle is-6">${mockOutputItem.description}</p>
        </div>
      </div>
      <div class="content py-4 is-flex is-flex-direction-column is-align-items-center">
        <strong class="is-size-4 mb-3">Card Upgraded! 🎉</strong>
        <p class="is-size-5">Level from 1 ➜ ${mockOutputItem.properties.Level}</p>
        <p class="is-size-5">Attack from 1 ➜ ${mockOutputItem.properties.Attack}</p>
        <p class="is-size-5">Health from 1 ➜ ${mockOutputItem.properties.Health}</p>
        <p class="is-size-5">Mana ${mockOutputItem.properties.Mana}</p>
        <p class="is-size-5">${mockOutputItem.properties.dust_power} Dust</p>
      </div>
      </div>
      </div>
        <button class="modal-close is-large" aria-label="close" @click=${this.closeUpgradedCardModal}></button>
      </div>
    </div>`;
  }

  render() {
    return html` ${this.showOutput ? cache(this.renderOutput()) : ''}
      <div class="columns">
        <div class="column">${cache(this.renderInventory())}</div>
        <div class="column">${cache(this.renderSelectedDustCards())}</div>
        <div class="column">${cache(this.renderCardUpgradeInfo())}</div>
      </div>
      <pre>${JSON.stringify(this.state, null, 2)}</pre>
      <pre>${JSON.stringify(this.inventoryItems, null, 2)}</pre>
      <pre>cardToUpgrade: ${JSON.stringify(this.cardToUpgrade, null, 2)}</pre>
      <pre>
selectedDustItems: ${JSON.stringify(this.selectedDustItems, null, 2)}</pre
      >`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
