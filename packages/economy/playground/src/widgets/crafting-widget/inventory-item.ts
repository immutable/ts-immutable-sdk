import vx from 'variant-classnames';
import moment from 'moment';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { InventoryItem } from '@imtbl/economy/dist/__codegen__/inventory';

const itemVx = {
  $all: 'indicator h-full outline-offset-1 hover:outline hover:cursor-pointer flex flex-col',
  selected: {
    true: 'border border-4 border-accent hover:border-none',
  },
};

const badgeVx = {
  $all: 'indicator-item badge',
  status: {
    locked: 'badge-error',
    created: 'badge-success',
  },

  new: {
    false: {
      status: {
        created: 'hidden',
      },
    },
  },
};

const locationVx = {
  $all: 'font-bold text-white font-mono text-center',
  location: {
    offchain: 'bg-black',
    zkevm: 'bg-primary',
  },
};

@customElement('inventory-item')
export class Item extends LitElement {
  @property({ type: Object, attribute: 'item' })
  item!: Required<
    Omit<InventoryItem, 'metadata'> & {
      metadata?: { name: string; image: string; [k: string]: unknown };
    }
  >;

  @property({ type: Boolean, attribute: 'selected' })
  selected = false;

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

  copyToClipboard(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard.writeText(this.item.id);
  }

  render() {
    const props = {
      ...this.item,
      selected: this.selected,
      new: moment(this.item.created_at).isAfter(moment().subtract(1, 'minute')),
    };

    return html`
      <div class="${vx(itemVx, props)}" @click="${this.handleClick}">
        <span class="${vx(badgeVx, props)}"> ${this.item.status}</span>
        <div
          class="grid w-32 h-full bg-base-300 place-items-center overflow-hidden text-center"
        >
          <img
            class="w-16"
            alt="${this.item.metadata.name}"
            src="${this.item.metadata.image}"
          />
          ${this.item.metadata.name}
          <span
            class="bg-accent font-bold text-white font-mono text-center truncate w-32 hover:bg-accent-focus cursor-copy"
            title="${this.item.id}"
            @click="${this.copyToClipboard}"
          >
            ...${this.item.id.slice(-10)}
          </span>
        </div>
        <span class="${vx(locationVx, props)}">${this.item.location}</span>
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
