import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { DomainCraft } from '@imtbl/economy/dist/__codegen__/crafting';

const statuses = {
  created: ['created', 'assets_locking'],
  received: ['assets_locked', 'delivering'],
  minting: ['delivered'],
  completed: ['completing', 'completed'],
};

const statusToStep = (status = 'created'): number => {
  return Object.values(statuses).findIndex((steps) => steps.includes(status));
};

@customElement('crafting-history')
export class CraftingHistory extends LitElement {
  @property({ type: Array, attribute: 'crafts' })
  crafts: Array<DomainCraft> = [];

  renderCraft(craft: DomainCraft) {
    const steps = Object.keys(statuses);

    return html`<div class="p-2 mb-8 outline outline-1 outline-slate-800">
      <span class="prose"><code>${craft.id}</code></span>
      <ul class="steps w-full">
        ${steps.map((status, idx) => {
          const lastIdx = statusToStep(craft.status);
          const stepDone = lastIdx >= idx;
          const completed =
            lastIdx >= steps.length - 1 ? 'step-success' : 'step-neutral';
          return html`<li
            class="step capitalize ${stepDone ? completed : ''}"
            data-content="${stepDone ? '✓' : '●'}"
          >
            ${status}
          </li>`;
        })}
      </ul>
    </div>`;
  }

  render() {
    return html`
      <h2>History</h2>
      ${this.crafts.map((craft) => this.renderCraft(craft))}
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
