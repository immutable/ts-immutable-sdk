import { EconomyCustomEventTypes } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

// FIXME: Use auto generated types from ts codegen
type CraftInput = {
  ingredients: CraftIngredient[];
  recipeId: string;
  userId: string;
};

type CraftIngredient = {
  conditionId: string;
  itemId: string;
};

type State = {
  craftInput: CraftInput;
};

const recipe = {
  id: 'a9e66897-08e1-482f-887a-1611f9d824bf',
  game_id: 'shardbound',
  name: "Ben's Test Recipe",
  description: 'Just a basic recipe',
  status: 'draft',
  inputs: [
    {
      id: 'f8f716ad-5191-478e-85d7-f3f1e7bcad02',
      type: 'single_item',
      name: 'card_to_upgrade',
      conditions: [
        {
          type: '',
          ref: 'properties.name',
          comparison: 'eq',
          expected: 'Spellboxer3',
        },
      ],
    },
    {
      id: 'bdd945d4-2f34-4d04-9562-c318a5739b1b',
      type: 'multiple_items',
      name: 'dust_payment',
      conditions: [
        {
          type: 'sum',
          ref: 'properties.dust_power',
          comparison: 'gte',
          expected: '150',
        },
      ],
    },
  ],
  outputs: [
    {
      id: '46b74c0b-bc2b-410b-9494-0295aa234e0d',
      type: 'item_definition',
      name: 'upgraded_card',
      ref: '63850a2b-79f1-480f-9131-cf46a6fe5b07',
      data: {
        'properties.level': '2',
      },
    },
  ],
  created_at: '2023-04-11T23:35:33.411305Z',
  updated_at: '2023-04-11T23:35:33.411305Z',
};

const inventoryItems = [
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
      userId: '123',
      recipeId: recipe.id,
      ingredients: [
        {
          conditionId: 'f8f716ad-5191-478e-85d7-f3f1e7bcad02',
          itemId:
            'sb::item::63850a2b-79f1-480f-9131-cf46a6fe5b07::2OIkhqz67yJ5mcQiCjdcdErYVNe',
        },
      ],
    },
  };

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
  handleClick(event: MouseEvent) {
    event.preventDefault();
    this.state.craftInput.ingredients.push({
      itemId: '123',
      conditionId: '123',
    });
    this.requestUpdate();
  }

  toggleItem(item: any) {
    console.log('selectItem');
    return (event: MouseEvent) => {
      event.preventDefault();
      console.log(item);
      const ingredients = {
        conditionId: 'f8f716ad-5191-478e-85d7-f3f1e7bcad02',
        itemId: item.id,
      };
      if (
        this.state.craftInput.ingredients.find(
          (ingredient) => ingredient.itemId === item.id
        )
      ) {
        this.state.craftInput.ingredients =
          this.state.craftInput.ingredients.filter(
            (ingredient) => ingredient.itemId !== item.id
          );
        this.requestUpdate();
        return;
      } else {
        this.state.craftInput.ingredients.push(ingredients);
        this.requestUpdate();
        return;
      }
    };
  }

  renderInventory() {
    return html` <h2 class="is-size-3">Inventory Items</h2>
      <div class="list has-hoverable-list-items">
        ${inventoryItems.map((item) => this.renderCard(item))}
      </div>`;
  }

  renderCard(item: any) {
    return html` <div class="list-item" @click=${this.toggleItem(item)}>
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
        <div class="columns mb-8">${cache(this.renderCraftOutput())}</div>
        <button class="button is-info" @click=${this.handleClick}>
          Craft Button
        </button>
      </div>
    </div>`;
  }

  renderCraftOutput() {
    return html`
      <div class="card column">
        <div class="card-image">
          <figure class="image is-4by3">
            <img
              src="https://bulma.io/images/placeholders/1280x960.png"
              alt="Placeholder image"
            />
          </figure>
        </div>
        <div class="card-content">
          <div class="media"></div>
        </div>
      </div>
      <div class="column">
        <p>EXP REQUIRED:</p>
        <p>Upgrade Level from 1 to 2</p>
        <p>Upgrade Attack from 1 to 2</p>
      </div>
      <br />
    `;
  }

  @eventOptions({ capture: true })
  async submitCrafting() {
    console.log('CraftingCardUpgrade :: submitCrafting');
    // TODO: process the crafting request
    // SDK.craft(...this.craftInput) // send the arguments required, taken from state's craftInput
    // await for results then update the craft results in state
  }

  render() {
    return html`<div class="columns">
        <div class="column">${cache(this.renderInventory())}</div>
        <div class="column">${cache(this.renderOutputs())}</div>
      </div>
      <pre>${JSON.stringify(this.state, null, 2)}</pre>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
