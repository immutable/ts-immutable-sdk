import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';

import { Economy, EconomyEvents } from '@imtbl/economy';
import type { InventoryItem, ItemDefinition, Recipe } from '@imtbl/economy';
import { Environment } from '@imtbl/config';

@customElement('imtbl-crafting-widget')
export class CraftingWidget extends LitElement {
  static styles = css``;

  @property({ type: String })
  owner!: string;

  @property({ type: String, attribute: 'game-id' })
  gameId!: string;

  @property({ type: String, attribute: 'recipe-id' })
  recipeId!: string;

  private economy!: Economy;

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

    this.economy = Economy.build({
      gameId: this.gameId,
      userId: this.owner,
      walletAddress: '0x',
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      // overrides: {
      //   servicesBaseURL: 'http://127.0.0.1:3031'
      // }
    });

    this.getRecipe();

    this.getInventory();
    const intervalId = setInterval(() => {
      this.getInventory();
    }, 1000);

    this.economy.subscribe(this.handleCraftingComplete.bind(this));
    window.addEventListener('unload', () => {
      clearInterval(intervalId);
    });
    window.addEventListener(
      'imtbl-crafting-event',
      this.handleCustomEvent(this.handleComponentEvent)
    );
  }

  submitCraft() {
    this.loading = true;
    this.requestUpdate();
    this.economy.crafting.craft({
      game_id: this.gameId,
      user_id: this.owner,
      recipe_id: this.recipeId,
      ingredients: this.getCraftIngredients() as any,
    });
  }

  getCraftIngredients(): Array<any> {
    const [firstItem, ...dustItems] = Array.from(this.selectedItems.values());

    return [
      { condition_id: this.recipe.inputs[0]?.id, item_id: firstItem.id },
      ...dustItems.map((item) => ({
        condition_id: this.recipe.inputs[1]?.id,
        item_id: item.id,
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
    this.recipe = await this.economy.recipe.getById(this.recipeId);
    await this.getRecipeOutput();
    this.requestUpdate();
  }

  async getInventory() {
    console.log("🚀 ~ file: imtbl-crafting-widget.ts:159 ~ CraftingWidget ~ getInventory ~ this.gameId:", this.gameId)

    this.items =
      (await this.economy.inventory.getItems({
        gameID: this.gameId,
        owner: [this.owner],
      })) || [];

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
    this.recipeId = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }
  
  handleGameInput(event: InputEvent) {
    this.gameId = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }
  
  handleOwnerInput(event: InputEvent) {
    this.owner = (event.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  getDustCondition(input: Recipe['inputs'][0]) {
    return input.conditions.find((cond: any) =>
      cond.ref.includes('dust_power')
    );
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
            <span class="label-text">Owner (user-id / wallet address)</span>
          </label>
          <input
            placeholder="Owner"
            class="input input-bordered w-full max-w-xs"
            type="text"
            .value="${this.owner}"
            @blur="${this.handleOwnerInput}"
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
            .value="${this.gameId}"
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
            .value="${this.recipeId}"
            @blur="${this.handleRecipeInput}"
          />
        </div>
      </div>
      <hr />
      <div>
        <div class="grid grid-cols-2 gap-6 p-6">
          <imtbl-economy-inventory-items
            .items="${this.items}"
            .activeItemId="${inputItem?.id}"
            .selectedItemIds="${selectedItemsIds}"
          ></imtbl-economy-inventory-items>
          <div class="flex w-full">
            <div
              class="flex-grow p-4 bg-base-300 place-items-center h-screen overflow-y-scroll"
              style="flex: 1;"
            >
              <imtbl-economy-items-selection
                .items="${selectedItems}"
              ></imtbl-economy-items-selection>
            </div>
            <div class="divider divider-horizontal">=</div>
            <div
              class="grid flex-grow card bg-base-300 rounded-box"
              style="flex: 2;"
            >
              <imtbl-economy-crafting-output
                .input="${inputItem}"
                .output="${this.outputItemDef}"
                .dustPower="${this.dustPower}"
                .maxDustPower="${this.getMaxDustPower()}"
                .loading="${this.loading}"
                .completed="${this.craftingCompleted}"
              ></imtbl-economy-crafting-output>
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
