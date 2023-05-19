import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('inventory-collection')
export class InventoryCollection extends LitElement {
  @property({ type: Array, attribute: 'inventory' })
  inventory: Array<number> = [];

  render() {
    const properties = {
      inventory: this.inventory,
    };
    console.log(
      '🚀 ~ file: inventory-collection.ts:13 ~ InventoryCollection ~ render ~ properties:',
      properties
    );
    return html`
      Inventory
      <div
        class="grid gap-x-4 gap-y-8 grid-cols-3 md:grid-cols-4 px-8 justify-items-start"
      >
        <div class="stack">
          <div class="grid w-32 h-32 bg-base-300 place-items-center my-4">
            stacked
          </div>
          <div class="grid w-32 h-32 bg-base-300 place-items-center my-4">
            stacked
          </div>
          <div class="grid w-32 h-32 bg-base-300 place-items-center my-4">
            stacked
          </div>
          <div class="grid w-32 h-32 bg-base-300 place-items-center my-4">
            stacked
          </div>
        </div>
        ${this.inventory.map(
          (item) => html`<inventory-item .item="${item}"></inventory-item>`
        )}
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
