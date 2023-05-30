import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import vx from 'variant-classnames';

import type { DomainRecipe } from '@imtbl/economy/dist/__codegen__/recipe';
import { ItemDefinition } from '@imtbl/economy/dist/__codegen__/item-definition';

type Item = Omit<Required<ItemDefinition>, 'properties'> & {
  properties: {
    [k: string]: unknown;
  };
};

@customElement('crafting-summary')
export class CraftingSummary extends LitElement {
  @property({ type: Object, attribute: 'recipe' })
  recipe!: DomainRecipe;

  @property({ type: Array, attribute: 'items' })
  items: Array<Item> = [];

  render() {
    if (!this.recipe) {
      return;
    }

    return html`<div class="w-full mx-auto px-4 flex flex-col items-left">
      <div class="my-4">
        <strong>${this.recipe.name}</strong>
        <p>${this.recipe.description}</p>
      </div>
      <div class="w-full flex flex-row flex-wrap justify-between items-center">
        ${this.recipe.outputs?.map((output) => {
          const item = this.items.find(({ id }) => id === output.ref);
          const props = { location: output.location, selected: false };

          return html` <div class="h-full outline flex flex-col items-center">
            <img class="w-32 p-1" alt="${item?.name}" src="${item?.image}" />
            <p class="p-1">${item?.name}</p>
            <span class="${vx(locationVx, props)}">${output.location}</span>
          </div>`;
        })}
      </div>
    </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

const locationVx = {
  $all: 'w-full font-bold text-white font-mono text-center',
  location: {
    zkevm: 'bg-primary',
    offchain: 'bg-black',
  },
};
