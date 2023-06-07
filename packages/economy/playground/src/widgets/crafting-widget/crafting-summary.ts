import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import vx from "variant-classnames";

import type { DomainRecipe } from "@imtbl/economy/dist/__codegen__/recipe";
import { ItemDefinition } from "@imtbl/economy/dist/__codegen__/item-definition";
import { CraftIngredient } from "@imtbl/economy/dist/__codegen__/crafting";
import { InventoryItem } from "@imtbl/economy/dist/__codegen__/inventory";

type Item = Omit<Required<ItemDefinition>, "properties"> & {
  properties: {
    [k: string]: unknown;
  };
};

const colors = [
  "primary",
  "secondary",
  "info",
  "success",
  "error",
  "warning",
  "",
];
const getColor = (index = 0) => {
  const color = colors?.[index % colors.length];
  return color ? `progress-${color}` : "";
};

@customElement("crafting-summary")
export class CraftingSummary extends LitElement {
  @property({ type: Object, attribute: "recipe" })
  recipe!: DomainRecipe;

  @property({ type: Array, attribute: "outputItems" })
  outputItems: Array<Item> = [];

  @property({ type: Array, attribute: "iteselectedItemsms" })
  selectedItems: Array<InventoryItem> = [];

  @property({ type: Array, attribute: "inputs" })
  inputs: Array<CraftIngredient> = [];

  renderOutput() {
    return html`
      <div class="w-full flex flex-row flex-wrap justify-between items-center">
        ${this.recipe.outputs?.map((output) => {
          const item = this.outputItems.find(({ id }) => id === output.ref);
          const props = { location: output.location, selected: false };

          return html` <div class="h-full outline flex flex-col items-center">
            <img class="w-32 p-1" alt="${item?.name}" src="${item?.image}" />
            <p class="p-1">${item?.name}</p>
            <span class="${vx(locationVx, props)}">${output.location}</span>
          </div>`;
        })}
      </div>
    `;
  }

  renderInputs() {
    return this.recipe.inputs?.map((input, idx) => {
      const sumCond = input.conditions?.find((cond) =>
        cond.type?.includes("sum")
      );
      const sumExpected = Number(sumCond?.expected || 0);

      let value = 0;
      let max = input.type === "single_item" ? 1 : sumExpected;

      const selectedInputs = this.inputs.filter(
        ({ condition_id }) => condition_id === input.id
      );

      if (input.type === "multiple_item" && selectedInputs.length >= 1) {
        const sumKey = sumCond?.ref?.split(".")?.pop() || "";

        const items = selectedInputs.map(({ item_id }) =>
          this.selectedItems.find(({ id }) => id === item_id)
        );
        const total = items.reduce((acc, item) => {
          const metadata: Record<string, unknown> = {
            ...item?.metadata,
          };

          return acc + Number(metadata[sumKey]);
        }, 0);

        value = total;
      }

      if (input.type === "single_item" && selectedInputs.length >= 1) {
        value = 1;
      }

      return html`<div class="py-1 mt-2">
        <p class="font-bold">${input.name} | Type: ${input.type}</p>
        <progress
          class="progress ${getColor(idx)} w-full h-5"
          value="${value}"
          max="${max}"
        ></progress>
        <span class="font-mono font-bold">${value}/${max}</span>
      </div>`;
    });
  }

  render() {
    if (!this.recipe) {
      return;
    }

    return html`<div class="w-full mx-auto px-4 flex flex-col items-left">
      <div class="my-4">
        <strong>${this.recipe.name}</strong>
        <p>${this.recipe.description}</p>
      </div>
      <div class="my-4">${this.renderOutput()}</div>
      <div class="my-4">${this.renderInputs()}</div>
    </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

const locationVx = {
  $all: "w-full font-bold text-white font-mono text-center",
  location: {
    zkevm: "bg-primary",
    offchain: "bg-black",
  },
};
