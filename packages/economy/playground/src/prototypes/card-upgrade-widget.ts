import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators';

import { Economy, EconomyEvents } from '@imtbl/economy';
import type {
  CraftInput,
  InventoryItem,
  ItemDefinition,
  Recipe,
} from '@imtbl/economy';

@customElement('imtbl-card-upgrade-widget')
export class CraftingWidget extends LitElement {
  static styles = css``;

  private economy: Economy;

  constructor() {
    super();
    this.economy = new Economy();
    this.getRecipe();
    this.getInventory();
  }

  @state()
  private craftInput: CraftInput = {
    requiresWeb3: false,
    input: {
      gameId: 'pokemon',
      userId: 'pokemon_master',
      recipeId: 'c1da5d0e-f506-4ae4-9d9d-00958be06d58',
      ingredients: [],
    },
  };

  @state()
  recipe!: Recipe;

  @state()
  outputItemDef!: ItemDefinition;

  @state()
  cardToUpgrade = {};

  @state()
  items!: Array<InventoryItem>;

  @state()
  selectedItems: Map<string, InventoryItem> = new Map();

  @state()
  dustPower: number = 0;

  @state()
  loading: boolean = false;

  @state()
  craftingCompleted: boolean = false;

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.economy.subscribe(this.handleCraftingComplete.bind(this));
    window.addEventListener(
      'imtbl-crafting-event',
      this.handleCustomEvent(this.handleComponentEvent)
    );
  }

  submitCraft() {
    this.loading = true;
    this.requestUpdate();
    this.economy.crafting.craft({
      requiresWeb3: this.craftInput.requiresWeb3,
      input: {
        ...this.craftInput.input,
        ingredients: this.getCraftIngredients(),
      },
    });
  }

  getCraftIngredients(): CraftInput['input']['ingredients'] {
    const [firstItem, ...dustItems] = Array.from(this.selectedItems.values());

    return [
      { conditionId: this.recipe.inputs[0]?.id, itemId: firstItem.id },
      ...dustItems.map((item) => ({
        conditionId: this.recipe.inputs[1]?.id,
        itemId: item.id,
      })),
    ];
  }

  handleCraftingComplete(event: EconomyEvents) {
    if (event.action !== 'CRAFT') return;

    if (['FAILED', 'COMPLETED'].includes(event.status)) {
      this.loading = false;
    }

    if (event.status === 'COMPLETED') {
      this.craftingCompleted = true;
    }

    setTimeout(() => {
      this.requestUpdate();
    }, 3000);
  }

  handleComponentEvent(event: CustomEvent) {
    console.log('CraftingWidget:: imtbl-crafting-event');
    const detail = event.detail as
      | {
          action: 'select' | 'unselect';
          item: InventoryItem;
        }
      | { action: 'submit' | 'unselectAll' };

    if (detail.action === 'select') {
      this.addSelection(detail.item);
    }
    if (detail.action === 'unselect') {
      this.removeSelection(detail.item);
    }
    if (detail.action === 'unselectAll') {
      this.resetSelection();
    }
    if (detail.action === 'submit') {
      this.submitCraft();
    }
  }

  async getRecipe() {
    this.recipe = await this.economy.recipe.getRecipeById(
      this.craftInput.input.recipeId
    );
    await this.getRecipeOutput();
    this.requestUpdate();
  }

  async getInventory() {
    const urlParams = new URLSearchParams(window.location.search);
    this.items = await this.economy.inventory.items(
      {
        userId: this.craftInput.input.userId,
        gameId: this.craftInput.input.gameId,
      },
      Boolean(urlParams.get('updated'))
    );
    // this.addSelection(this.items[0]);
    // this.addSelection(this.items[1]);
    // this.addSelection(this.items[2]);
    // this.addSelection(this.items[3]);
    // this.addSelection(this.items[4]);
    // this.addSelection(this.items[5]);
    // this.addSelection(this.items[6]);
    this.requestUpdate();
  }

  addSelection(item: InventoryItem) {
    if (!this.selectedItems.has(item.id)) {
      this.selectedItems.set(item.id, item);
      if (this.selectedItems.size > 1) {
        this.dustPower += item.metadata.dust_power;
      }
      this.requestUpdate();
    }
  }

  removeSelection(item: InventoryItem) {
    if (this.selectedItems.has(item.id)) {
      this.selectedItems.delete(item.id);
      this.dustPower -= item.metadata.dust_power;
      this.requestUpdate();
    }
  }

  resetSelection() {
    this.selectedItems.clear();
    this.requestUpdate();
  }

  handleRecipeInput(event: InputEvent) {
    this.craftInput.input.recipeId = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  handleGameInput(event: InputEvent) {
    this.gameId = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  handleUserInput(event: InputEvent) {
    this.craftInput.input.userId = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  getDustCondition(input: Recipe['inputs'][0]) {
    return input.conditions.find((cond) => cond.ref.includes('dust_power'));
  }

  getMaxDustPower(): Number {
    if (!this.recipe) return 0;

    const dustInput = this.recipe.inputs.find(this.getDustCondition);
    if (!dustInput) {
      return 0;
    }

    return Number(this.getDustCondition(dustInput)?.expected || 0);
  }

  getItemsState() {
    const [inputItem, ...selectedItems] = Array.from(
      this.selectedItems.values()
    );

    return {
      inputItem,
      selectedItems,
      selectedItemsIds: selectedItems.map((i) => i.id),
    };
  }

  async getRecipeOutput() {
    const itemDefId = this.recipe?.outputs[0].ref;
    if (!itemDefId) {
      return;
    }

    this.outputItemDef = await this.economy.item.getById(itemDefId);
  }

  render() {
    const { inputItem, selectedItems, selectedItemsIds } = this.getItemsState();

    return html` <div class="p-4 flex flex-row">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">User Id</span>
          </label>
          <input
            placeholder="User ID"
            class="input input-bordered w-full max-w-xs"
            type="text"
            .value="${this.craftInput.input.userId}"
            @blur="${this.handleUserInput}"
          />
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Game Id</span>
          </label>
          <input
            placeholder="Game ID"
            class="input input-bordered w-full max-w-xs"
            type="text"
            .value="${this.craftInput.input.gameId}"
            @blur="${this.handleGameInput}"
          />
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Recipe Id</span>
          </label>
          <input
            placeholder="Recipe ID"
            class="input input-bordered w-full max-w-xs"
            type="text"
            .value="${this.craftInput.input.recipeId}"
            @blur="${this.handleRecipeInput}"
          />
        </div>
      </div>
      <hr />
      <div>
        <div class="grid grid-cols-2 gap-6 p-6">
          <imtbl-crafting-inventory
            .items="${this.items}"
            .activeItemId="${inputItem?.id}"
            .selectedItemIds="${selectedItemsIds}"
          ></imtbl-crafting-inventory>
          <div class="flex w-full">
            <div
              class="flex-grow p-4 bg-base-300 place-items-center h-screen overflow-y-scroll"
              style="flex: 1;"
            >
              <imtbl-crafting-selection
                .items="${selectedItems}"
              ></imtbl-crafting-selection>
            </div>
            <div class="divider divider-horizontal">=</div>
            <div
              class="grid flex-grow card bg-base-300 rounded-box"
              style="flex: 2;"
            >
              <imtbl-crafting-output
                .input="${inputItem}"
                .output="${this.outputItemDef}"
                .dustPower="${this.dustPower}"
                .maxDustPower="${this.getMaxDustPower()}"
                .loading="${this.loading}"
                .completed="${this.craftingCompleted}"
              ></imtbl-crafting-output>
            </div>
          </div>
        </div>
      </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  protected updated(): void {
    console.log('CraftingWidget:: updated', {
      items: this.items,
      recipe: this.recipe,
    });
  }
}
