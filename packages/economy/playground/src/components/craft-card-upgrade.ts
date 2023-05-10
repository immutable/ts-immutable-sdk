import { EconomyCustomEventTypes } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

// FIXME: Use auto generated types from ts codegen
type CraftInput = {
  ingredients: CraftIngredient[];
  recipe_id: string;
  user_id: string;
};

type CraftIngredient = {
  condition_id: string;
  item_id: string;
};

type State = {
  craftInput: CraftInput;
};

const recipe = {
  id: 'c1da5d0e-f506-4ae4-9d9d-00958be06d58',
  game_id: 'pokemon',
  name: 'charizard-vmax-upgrade',
  description: 'Get a charizard vmax card',
  status: 'draft',
  inputs: [
    {
      id: 'd2da797d-a4d3-4e56-95a9-60dd49af4063',
      type: 'single_item',
      name: 'card to be upgraded',
      conditions: [
        {
          type: '',
          ref: 'properties.level',
          comparison: 'gte',
          expected: '1',
        },
      ],
    },
    {
      id: '18a159b0-e78c-48b6-845f-5a08be8a8356',
      type: 'multiple_item',
      name: 'dust power cost',
      conditions: [
        {
          type: 'property_sum',
          ref: 'properties.dust_power',
          comparison: 'gte',
          expected: '150',
        },
      ],
    },
  ],
  outputs: [
    {
      id: 'ca32421c-eb55-41e3-8d63-56761915d634',
      type: 'item_definition',
      name: 'A Charizard vmax card',
      ref: '00f4d927-6151-4d49-bb3b-c49e8b688eb8',
      location: 'offchain',
      data: null,
    },
  ],
  created_at: '2023-05-09T08:06:50.91838Z',
  updated_at: '2023-05-10T03:14:20.798838Z',
};

let inventoryItems = [
  {
    id: '2PY1LRjoPRmmWzyo145YnDPWbjW',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:04.538177Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1LGjsSw8AtCl4uJ0i2DmdEuU',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:03.66958Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1LDCebslIeQZRije1bWByNaq',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:02.850217Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1LA4lUVkKPvk3O4jnnG1GZjA',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:02.027167Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1L3jfuOCS9Imul9d6ZxEZfFm',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:01.23262Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1KxpgtNnhKihdDURWJYfPnU9',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: 'f7ef10a2-7e5e-42b7-967a-2a1e59a9b1ab',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 50,
      description: 'A Charizard Level 1 Pokemon',
      dust_power: 50,
      hp: 50,
      image: 'https://i.ebayimg.com/images/g/9XkAAOSw5ohkH6EY/s-l1600.jpg',
      level: 1,
      name: 'Charizard L1 - v3',
    },
    created_at: '2023-05-09T07:59:00.350645Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1HLgyoxhJnDp4XwOJ9HQXaK5',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:31.453694Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1HBRnyzZTR4yedrN4UDLYDEd',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:30.569177Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1H1K0jPBlo5YGaO9jxkCZMZv',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:29.751718Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1GuZt5s977TqB7gJigfAgWnD',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:28.921588Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1GkxAdakNIzqQGicNudnRUf4',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:27.985738Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1GmEmHag3f7LolpjKSrgxBhF',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '1f3b3ad1-4a6c-4e5d-ac25-5368118ccb78',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 30,
      description: 'A Pikachu Level 1 Pokemon',
      dust_power: 50,
      hp: 30,
      image: 'https://i.ebayimg.com/images/g/2IMAAOSwSRpjeg-G/s-l1600.jpg',
      level: 1,
      name: 'Pikachu L1 - v3',
    },
    created_at: '2023-05-09T07:58:27.045572Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1CkuhN8ggy2SMdhJ9bOxbNLZ',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:55.317025Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1Ccw8o1SRTe2t1XwhmyZhAZ3',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:54.350588Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1CWP9mzKwiEeDUJxNTWSsjye',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:53.425608Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1CRtfSJppz6cbDXLvy76tOzs',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:52.400417Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1CIl99j1wFGtnUekoXvKbZTj',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:51.084103Z',
    updated_at: null,
    deleted_at: null,
  },
  {
    id: '2PY1Bk92maSKsqxtmrrnGTGJBp4',
    game_id: 'pokemon',
    token_id: null,
    contract_id: null,
    item_definition_id: '856d8e7e-463f-4682-9433-e4447f417d8a',
    owner: 'pokemon_master',
    status: 'minted',
    lock_owner: '',
    location: 'offchain',
    last_traded: null,
    metadata: {
      attack: 60,
      description: 'A Venusaur Level 1 Pokemon',
      dust_power: 50,
      hp: 60,
      image: 'https://m.media-amazon.com/images/I/71mJjFYc3mL._AC_SY741_.jpg',
      level: 1,
      name: 'Venusaur L1 - v3',
    },
    created_at: '2023-05-09T07:57:47.72857Z',
    updated_at: null,
    deleted_at: null,
  },
];

@customElement('imtbl-craft-card-upgrade-widget')
export class CraftingCardUpgrade extends LitElement {
  static styles = css`
    .inventory-items {
      width: 200px;
      height: 20px;
      border: solid 1px black;
    }
  `;

  constructor() {
    super();
  }

  @state()
  private state: State = {
    craftInput: {
      user_id: '123',
      recipe_id: recipe.id,
      ingredients: [],
    },
  };

  private cardToUpgrade: any = undefined;
  private selectedDustItems: any[] = [];
  private craftingDisabled: boolean = true;

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
    console.log('selectItem');
    return (event: MouseEvent) => {
      event.preventDefault();
      console.log(item);

      if (this.cardToUpgrade === undefined) {
        this.cardToUpgrade = item;
      } else {
        this.selectedDustItems.push(item);
      }
      inventoryItems = inventoryItems.filter((i) => i.id !== item.id);
      this.validateCraftButton();
      this.requestUpdate();
      return;
    };
  }

  renderInventory() {
    return html` <h2 class="is-size-3">Inventory Items</h2>
      <div class="list has-hoverable-list-items">
        ${inventoryItems.map((item) => this.renderInventoryItem(item))}
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

  renderOutputs() {
    return html`<div>
      <h2 class="mb-4 is-size-3">Craft outputs</h2>
      <div class="is-flex is-flex-direction-column">
        <div class="columns mb-8">${cache(this.renderCardToUpgrade())}</div>
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
      <div class="column">
        <p>EXP REQUIRED:</p>
        <p>Upgrade Level from 1 to 2</p>
        <p>Upgrade Attack from 1 to 2</p>
      </div>
    `;
  }

  validateCraftButton() {
    const dustExpected = recipe.inputs[1].conditions[0].expected;

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
      return html` <button
        id="craft-button"
        class="button is-info"
        disabled
        @click=${this.handleCraftClick}
      >
        Craft
      </button>`;
    } else {
      return html` <button
        id="craft-button"
        class="button is-info"
        @click=${this.handleCraftClick}
      >
        Craft
      </button>`;
    }
  }

  prepareIngredientsForCraft() {
    this.state.craftInput.ingredients = [
      {
        item_id: this.cardToUpgrade.id,
        condition_id: recipe.inputs[0].id,
      },
    ];

    this.selectedDustItems.forEach((item) => {
      this.state.craftInput.ingredients.push({
        item_id: item.id,
        condition_id: recipe.inputs[1].id,
      });
    });
  }

  @eventOptions({ capture: true })
  async submitCrafting() {
    this.prepareIngredientsForCraft();
    console.log('CraftingCardUpgrade :: submitCrafting');

    // TODO: process the crafting request
    // SDK.craft(...this.state.craftInput.ingredients) // send the arguments required, taken from state's craftInput
    // await for results then update the craft results in state
  }

  render() {
    return html` <div class="columns">
        <div class="column">${cache(this.renderInventory())}</div>
        <div class="column">${cache(this.renderSelectedDustCards())}</div>
        <div class="column">${cache(this.renderOutputs())}</div>
      </div>
      <pre>${JSON.stringify(this.state, null, 2)}</pre>
      <pre>cardToUpgrade: ${JSON.stringify(this.cardToUpgrade, null, 2)}</pre>
      <pre>
selectedDustItems: ${JSON.stringify(this.selectedDustItems, null, 2)}</pre
      >`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
