import vx from 'variant-classnames';
import moment from 'moment';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { InventoryItem } from '@imtbl/economy/dist/__codegen__/inventory';

const badgeVx = {
  $all: 'indicator-item badge',
  status: {
    locked: 'badge-error',
    created: 'badge-success',
  },
  isNew: {
    false: {
      status: {
        created: 'hidden',
      },
    },
  },
};

@customElement('inventory-item')
export class Item extends LitElement {
  @property({ type: Object, attribute: 'item' })
  item!: Required<Omit<InventoryItem, 'metadata'> & {
    metadata?: { name: string; image: string; [k: string]: unknown };
  }>;

  handleClick(event: Event) {
    event.preventDefault();
    this.emitEvent('crafting-widget-event', {
      type: 'item-selected',
      data: this.item,
    });
  }

  emitEvent<T>(type: string, detail: T) {
    const event = new CustomEvent('crafting-widget-event', {
      detail: { type, ...detail },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  render() {
    const props = {
      ...this.item,
      isNew: moment(this.item.created_at).isAfter(
        moment().subtract(1, 'minute')
      ),
    };

    return html`
      <div
        class="indicator h-full outline-offset-1 hover:outline hover:cursor-pointer"
        @click="${this.handleClick}"
      >
        <span class="${vx(badgeVx, props)}"> ${this.item.status}</span>
        <div class="grid w-32 h-full bg-base-300 place-items-center ">
          <img
            alt="${this.item.metadata.name}"
            src="${this.item.metadata.image}"
          />
          ${this.item.metadata.name}
        </div>
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
