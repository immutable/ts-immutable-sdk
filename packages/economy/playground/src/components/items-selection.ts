import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { ItemDefinition } from '@imtbl/economy';

@customElement('imtbl-economy-items-selection')
export class CraftingSelection extends LitElement {
  static styles = css``;

  static get properties() {
    return {
      items: { type: Array<ItemDefinition> },
      selectedItemIds: { type: Array<string> },
    };
  }

  getOnClick(item: ItemDefinition) {
    return (event: MouseEvent) => {
      event.preventDefault();
      this.emitEvent({
        item,
        action: 'unselect',
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

  render() {
    return html`<div class="grid grid-cols-1 gap-4">
      ${this.items.map(
        (item: ItemDefinition) =>
          html`<div class="tooltip tooltip-bottom" data-tip="Click to remove">
            <div
              @click=${this.getOnClick(item)}
              class="bg-base-100 shadow-xl flex h-14 justify-between overflow-hidden relative hover:outline hover:cursor-pointer"
            >
              <div>
                <figure>
                  <img
                    class="h-full"
                    src="${item.metadata.image}"
                    alt=${item.metadata.name}
                  />
                </figure>
              </div>
              <div class="card-actions justify-end absolute right-1 bottom-1">
                <div class="badge">🎟${item.metadata.dust_power}</div>
              </div>
            </div>
          </div>`
      )}
    </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
