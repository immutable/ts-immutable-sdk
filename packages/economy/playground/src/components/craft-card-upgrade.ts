import { EconomyCustomEventTypes, Economy, CraftInput } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

// FIXME: Replace types from auto generated ones
// type CraftInput = {
//   ingredients: CraftIngredient[];
//   recipeId: string;
//   userId: string;
// };
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

@customElement('imtbl-craft-card-upgrade-widget')
export class CraftingCardUpgrade extends LitElement {
  static styles = css``;
  private economy: Economy;

  constructor() {
    super();
    this.economy = new Economy();
  }

  @state()
  private state: State = {
    craftInput: {
      userId: '',
      recipeId: '',
      ingredients: [],
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

  renderCollection() {
    return html`<div>List of craft items</div>`;
  }

  renderSelection() {
    return html`<div>Selected items for crafting</div>`;
  }

  renderOutputs() {
    return html`<div>
      Render the craft outputs and craft button
      ${cache(this.renderCraftOutput())}
      <button @click=${this.submitCrafting}>Craft Button</button>
    </div>`;
  }

  renderCraftOutput() {
    return html`<div>craft expected output as in recipe</div>`;
  }

  @eventOptions({ capture: true })
  async submitCrafting() {
    console.log('CraftingCardUpgrade :: submitCrafting');

    console.log('@@@@ economy', this.economy);
    // return;

    this.economy.events$$.subscribe((x) => {
      console.log('@@@@@@ this.economy.events$$', x);
    });

    // TODO: process the crafting request
    const mockInput: CraftInput = {
      input: {
        userId: 'jimmy-test',
        recipeId: 'f3f3e906-6da9-4d0f-85c6-31b20b159310',
        ingredients: [
          {
            conditionId: '39e45319-afbe-4b6a-af36-54793d17acc9', // card to be upgraded
            itemId: '2PXKcETqisB6BshzkO5u0HvQquv',
          },
          {
            conditionId: 'dcc4d637-fc29-4851-9db9-41d6430f7b3b', // dust input
            itemId: '2PXKc2zt3FVapNEzVq7nCFpW3Kn',
          },
        ],
      },
    };
    this.economy.crafting.craft(mockInput); // send the arguments required, taken from state's craftInput
    // await for results then update the craft results in state

    this.economy.inventory.getItems('jimmy-test');
    // TODO: process the crafting request
    // SDK.craft(...this.craftInput) // send the arguments required, taken from state's craftInput
    // await for results then update the craft results in state
  }

  render() {
    return html`<div>
      ${cache(this.renderCollection())} ${cache(this.renderSelection())}
      ${cache(this.renderOutputs())}
    </div>`;
  }
}
