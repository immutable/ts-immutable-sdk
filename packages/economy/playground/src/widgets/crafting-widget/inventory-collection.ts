import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { InventoryItem } from '@imtbl/economy/dist/__codegen__/inventory';

@customElement('inventory-collection')
export class InventoryCollection extends LitElement {
  @property({ type: Array, attribute: 'inventory' })
  inventory: Array<any> = [];

  @property({ type: Array, attribute: 'selectedItems' })
  selectedItems: Array<InventoryItem> = [];


  @property({ type: Array, attribute: 'selectedItems' })
  selectedRecipe: Array<InventoryItem> = [];

  render() {
    const selectedIds = this.selectedItems.map((i) => i.id);
    return html`
      <div
        class="grid gap-x-4 gap-y-8 grid-cols-3 md:grid-cols-4 px-8 my-8 justify-items-start"
      >
        ${this.inventory.map(
          (item) =>
            html`<inventory-item
              .item="${item}"
              .selected="${selectedIds.includes(item.id)}"
            ></inventory-item>`
        )}
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
