import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { InventoryItem } from '@imtbl/economy/dist/__codegen__/inventory';
import type { DomainRecipe } from '@imtbl/economy/dist/__codegen__/recipe';

type Item = Required<
  Omit<InventoryItem, 'metadata'> & {
    metadata?: { [k: string]: unknown };
  }
>;
@customElement('items-selection')
export class ItemsSelection extends LitElement {
  @property()
  items: Array<Item> = [];

  @property()
  recipe: DomainRecipe = {} as DomainRecipe;

  @state()
  used: string[] = [];

  @state()
  groupedItems: Array<unknown> = [];

  handleClick(item: Item) {
    return (event: Event) => {
      event.preventDefault();
      this.emitEvent('crafting-widget-event', {
        type: 'item-selected',
        data: item,
      });
    };
  }

  emitEvent<T>(type: string, detail: T) {
    const event = new CustomEvent('crafting-widget-event', {
      detail: { type, ...detail },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  renderItem(item: Item) {
    return html`
      <div class="indicator w-full m-1 bg-gray-300">
        <div class="indicator-item indicator-bottom">
          <button
            class="btn btn-error btn-xs"
            @click="${this.handleClick(item)}"
          >
            remove
          </button>
        </div>
        <div class="flex flex-row justify-between items-center">
          <picture>
            <img
              class="m-0 w-12"
              src="${item.metadata?.image}"
              alt="${item.metadata?.name}"
            />
          </picture>
          <b>${item?.metadata?.name}</b>
          <p class="m-1">${item.metadata?.description}</p>
        </div>
      </div>
    `;
  }

  render() {
    const items = Object.entries(
      this.items.reduce((acc, item) => {
        acc[item?.item_definition_id] = acc[item?.item_definition_id]?.concat(
          item
        ) || [item];
        return acc;
      }, {} as Record<string, Item[]>)
    );

    return html`
      <div class="w-5/6 mx-auto my-8">
        <ul class="tree prose">
          ${items.map(
            ([type, items], idx) => html`
              <li>
                <details open>
                  <summary group="${idx + 1}">${type}</summary>
                  <ul class="tree">
                    ${items.map(
                      (item) => html` <li>${this.renderItem(item)}</li> `
                    )}
                  </ul>
                </details>
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
