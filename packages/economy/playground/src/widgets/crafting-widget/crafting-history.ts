import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('crafting-history')
export class CraftingHistory extends LitElement {
  @property({ type: Object, attribute: 'item' })
  item: Object = {};

  renderEntry(_: unknown) {
    return html`<div class="p-2 mb-8 outline outline-1 outline-slate-800">
      <span class="prose"><code>576890-fgdd7980-=fd7980-=fds7890-=</code></span>
      <ul class="steps w-full">
        <li class="step step-info" data-content="✓">Created</li>
        <li class="step step-info" data-content="✓">Received</li>
        <li class="step step-info" data-content="✓">Minted</li>
        <li data-content="●" class="step step-neutral">Completed</li>
      </ul>
    </div>`;
  }

  render() {
    const properties = {
      item: this.item,
    };
    console.log(
      '🚀 ~ file: inventory-item.ts:13 ~ InventoryItem ~ render ~ properties:',
      properties
    );
    return html`
      <h2>History</h2>
      ${Array.from({ length: 10 }).map((_, i) => this.renderEntry(i))}
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
