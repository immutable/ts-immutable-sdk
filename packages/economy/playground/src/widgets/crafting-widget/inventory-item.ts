import vx from "variant-classnames";
import moment from "moment";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { InventoryItem } from "@imtbl/economy/dist/__codegen__/inventory";

const itemVx = {
  $all: "indicator h-full outline-offset-1 hover:outline hover:cursor-pointer flex flex-col relative w-32",
  selected: {
    true: "border border-4 border-accent hover:border-none",
  },
  status: {
    locked: "pointer-events-none grayscale",
    on_chain_locked: "pointer-events-none grayscale",
    minting: "pointer-events-none",
  },
};

const badgeVx = {
  $all: "text-center absolute top-0 left-0 w-full border-2 font-bold font-mono bg-opacity-80 z-10",
  status: {
    minting: "bg-secondary text-white",
    created: "bg-success text-white",
    $none: "bg-black text-white",
  },

  new: {
    false: {
      status: {
        created: "opacity-0",
      },
    },
  },
};

const locationVx = {
  $all: "font-bold text-white font-mono text-center",
  location: {
    offchain: "bg-black",
    zkevm: "bg-primary",
  },
};

@customElement("inventory-item")
export class Item extends LitElement {
  @property({ type: Object, attribute: "item" })
  item!: Required<
    Omit<InventoryItem, "metadata"> & {
      metadata?: { name: string; image: string; [k: string]: unknown };
    }
  >;

  @property({ type: Boolean, attribute: "selected" })
  selected = false;

  handleClick(event: Event) {
    event.preventDefault();
    this.emitEvent("crafting-widget-event", {
      type: "item-selected",
      data: this.item,
    });
  }

  emitEvent<T>(type: string, detail: T) {
    const event = new CustomEvent("crafting-widget-event", {
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
      new: moment(this.item.created_at).isAfter(moment().subtract(1, "minute")),
    };

    // create variable metadata from this.item.metadata and remove image, description and name
    const { image, description, name, ...metadata } = this.item.metadata || {};
    const properties = Object.entries(metadata);

    return html`
      <div class="${vx(itemVx, props)}" @click="${this.handleClick}">
        <span class="${vx(badgeVx, props)}"> ${this.item.status}</span>
        <div
          class="grid h-full bg-base-300 place-items-center overflow-hidden text-center group"
        >
          <img
            class="${props.status.includes("locked") ? "grayscale" : ""}"
            alt="${name}"
            src="${image}"
          />
          <span class="truncate w-full" title="${name}">${name}</span>
          <ul
            class="py-4 px-2 font-mono text-xs text-left border border-white w-full max-h-32 overflow-hidden overflow-y-scroll absolute left-0 bottom-0 bg-white hidden ${properties.length >
            0
              ? "group-hover:block"
              : ""}"
          >
            ${properties.map(
              ([key, value]) => html` <li><b>${key}:</b> ${value}</li> `
            )}
          </ul>
        </div>
        <span
          class="bg-accent font-bold text-white font-mono text-center truncate w-32 hover:bg-accent-focus cursor-copy"
          title="${this.item.id}"
          @click="${this.copyToClipboard}"
        >
          ...${this.item.id.slice(-10)}
        </span>
        <span class="${vx(locationVx, props)}">${this.item.location}</span>
      </div>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
