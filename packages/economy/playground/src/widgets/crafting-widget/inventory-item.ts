import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('inventory-item')
export class InventoryItem extends LitElement {
  @property({ type: Object, attribute: 'item' })
  item: Object = {};

  render() {
    const properties = {
      item: this.item,
    };
    console.log(
      '🚀 ~ file: inventory-item.ts:13 ~ InventoryItem ~ render ~ properties:',
      properties
    );
    return html`
      <div class="indicator">
        <span class="indicator-item badge badge-secondary">new</span>
        <div class="grid w-32 h-32 bg-base-300 place-items-center">item</div>
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
