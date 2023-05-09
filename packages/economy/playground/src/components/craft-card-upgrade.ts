import { EconomyCustomEventTypes, Economy, CraftInput } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

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

let mockInventoryItems = [
  {
    id: 'sb::item::63850a2b-79f1-480f-9131-cf46a6fe5b07::2OIkhqz67yJ5mcQiCjdcdErYVNe',
    game_id: 'sb',
    token_id: null,
    contract_id: null,
    item_definition_id: '63850a2b-79f1-480f-9131-cf46a6fe5b07',
    owner: 'user_BenPartridge',
    status: 'offchain',
    location: 'offchain',
    last_traded: null,
    metadata: {
      Attack: 1,
      Health: 1,
      Mana: 2,
      Tier: 'Common',
      Type: 'Human',
      description: 'After you cast a spell, gain +2 Attack this turn.',
      dust_cost: 200,
      image: 'https://pbs.twimg.com/media/CtzRKd5WEAAZj5S.jpg',
      name: 'Spellboxer3',
    },
    created_at: '2023-04-11T23:26:45.267736Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 'sb::item::dbdb5d8d-f36d-4cdf-abc7-55c61b57520a::2OIkaBxfEfhrniDRGsQlfyukKFX',
    game_id: 'sb',
    token_id: null,
    contract_id: null,
    item_definition_id: 'dbdb5d8d-f36d-4cdf-abc7-55c61b57520a',
    owner: 'user_BenPartridge',
    status: 'offchain',
    location: 'offchain',
    last_traded: null,
    metadata: {
      Attack: 1,
      Health: 2,
      Mana: 2,
      Tier: 'Rare',
      Type: 'Human',
      description:
        'After you cast a spell, give your hero <Em>+1 Attack</> this turn.',
      dust_power: 100,
      image:
        'https://cdnb.artstation.com/p/assets/images/images/004/931/795/large/omnom-workshop-arcanumsteward-pose01.jpg?1487285098',
      name: 'Arcanum Steward',
    },
    created_at: '2023-04-11T23:25:44.86844Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 'sb::item::dbdb5d8d-f36d-4cdf-abc7-55c61b57520a::2OIkaBxfEfhrniDRGsQlfyukKPP',
    game_id: 'sb',
    token_id: null,
    contract_id: null,
    item_definition_id: 'dbdb5d8d-f36d-4cdf-abc7-55c61b57520a',
    owner: 'user_BenPartridge',
    status: 'offchain',
    location: 'offchain',
    last_traded: null,
    metadata: {
      Attack: 1,
      Health: 2,
      Mana: 2,
      Tier: 'Rare',
      Type: 'Human',
      description:
        'After you cast a spell, give your hero <Em>+1 Attack</> this turn.',
      dust_power: 100,
      image:
        'https://cdnb.artstation.com/p/assets/images/images/004/931/795/large/omnom-workshop-arcanumsteward-pose01.jpg?1487285098',
      name: 'Arcanum Steward',
    },
    created_at: '2023-04-11T23:25:44.86844Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 'sb::item::dbdb5d8d-f36d-4cdf-abc7-55c61b57520a::2OIkaBxfEfhrniDRGsQlfyukKSS',
    game_id: 'sb',
    token_id: null,
    contract_id: null,
    item_definition_id: 'dbdb5d8d-f36d-4cdf-abc7-55c61b57520a',
    owner: 'user_BenPartridge',
    status: 'offchain',
    location: 'offchain',
    last_traded: null,
    metadata: {
      Attack: 1,
      Health: 2,
      Mana: 2,
      Tier: 'Rare',
      Type: 'Human',
      description:
        'After you cast a spell, give your hero <Em>+1 Attack</> this turn.',
      dust_power: 100,
      image:
        'https://cdnb.artstation.com/p/assets/images/images/004/931/795/large/omnom-workshop-arcanumsteward-pose01.jpg?1487285098',
      name: 'Arcanum Steward',
    },
    created_at: '2023-04-11T23:25:44.86844Z',
    updated_at: null,
    deleted_at: null,
  },
];

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

@customElement('imtbl-craft-card-upgrade-widget')
export class CraftingCardUpgrade extends LitElement {
  static styles = css``;
  private economy: Economy;

  constructor() {
    super();
    this.economy = new Economy();
    this.inventoryItems = mockInventoryItems;
  }

  @state()
  private state: CraftInput = {
    requiresWeb3: false,
    input: {
      userId: '123',
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
          <div class="mr-2">Attack ${item.metadata.Attack}</div>
          <div class="mr-2">Mana: ${item.metadata.Mana}</div>
          <div class="mr-2">Health: ${item.metadata.Health}</div>
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
          <p>EXP REQUIRED:</p>
          <p>Upgrade Level from 1 to 2</p>
          <p>Upgrade Attack from 1 to 2</p>
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
    const dustExpected =
      HardcodedCardUpgradeRecipe.inputs[1].conditions[0].expected;

    const dustPowerArray = this.selectedDustItems.map(
      (item) => item.metadata.dust_power
    );
    const dustPowerTotal = dustPowerArray.reduce((a, b) => a + b, 0);

    if (dustPowerTotal >= dustExpected) {
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

  closeUpgradedCardModal() {
    const modalEl = document.getElementById('upgraded-card-modal');
    modalEl?.classList.remove('is-active');
    this.requestUpdate();
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
