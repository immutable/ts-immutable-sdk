import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { ItemDefinition } from '@imtbl/economy';

@customElement('imtbl-economy-inventory-items')
export class InventoryItems extends LitElement {
  static styles = css``;

  static get properties() {
    return {
      items: { type: Array<ItemDefinition> },
      activeItemId: { type: String },
      selectedItemIds: { type: Array<String> },
    };
  }

  constructor() {
    super();
    this.items = [];
    this.activeItemId = '';
    this.selectedItemIds = [];
  }

  getOnClick(item: ItemDefinition) {
    return (event: MouseEvent) => {
      event.preventDefault();

      if (this.activeItemId === item.id) {
        this.emitEvent({ action: 'unselectAll' });

        return;
      }

      this.emitEvent({
        item,
        action: 'select',
      });
    };
  }

  emitEvent<T>(detail: T) {
    const event = new CustomEvent('imtbl-crafting-event', {
      detail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  getIsSelected(id: string) {
    return this.selectedItemIds.includes(id);
  }

  render() {
    return html`<div
      class="grid grid-cols-3 gap-4 h-screen overflow-y-scroll p-4 bg-base-300"
    >
      ${this?.items?.map((item: ItemDefinition) => {
        const selectedCx = this.getIsSelected(item.id)
          ? 'opacity-50 outline outline-primary pointer-events-none'
          : '';
        const activeCx =
          this.activeItemId === item.id
            ? 'outline outline-8 cursor-not-allowed'
            : 'hover:text-primary-content hover:bg-base-content hover:cursor-pointer';
        return html`
          <div
            @click=${this.getOnClick(item)}
            class="card bg-base-100 shadow-xl ${selectedCx} ${activeCx}"
          >
            <figure>
              <img src="${item.metadata.image}" alt=${item.metadata.name} />
            </figure>
            <div class="card-body">
              <h2 class="card-title">${item.metadata.name}</h2>
              <div class="card-actions flex-col">
                <div
                  class="flex w-full justify-end flex-wrap absolute top-4 right-4"
                >
                  <div class="badge">📍 ${item.location}</div>
                </div>
                <div class="flex w-full justify-between">
                  <div class="badge badge-success">💚 ${item.metadata.hp}</div>
                  <div class="badge badge-error">
                    🔥 ${item.metadata.attack}
                  </div>
                  <div class="badge badge-primary">
                    ⬆️ ${item.metadata.level}
                  </div>
                </div>
                <div class="flex w-full justify-between">
                  <div class="badge badge-neutral badge-outline">
                    Dust Power 🎟${item.metadata.dust_power}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      })}
    </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
