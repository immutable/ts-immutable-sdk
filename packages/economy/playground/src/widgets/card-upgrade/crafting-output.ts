import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { ItemDefinition, InventoryItem } from '@imtbl/economy';

@customElement('imtbl-economy-crafting-output')
export class CraftingOutput extends LitElement {
  static styles = css``;

  private propSymbols: Record<string, string> = {
    attack: '🔥',
    hp: '💚',
    level: '⬆️',
    dust_power: '🎟',
  };

  static get properties() {
    return {
      completed: { type: Boolean },
      loading: { type: Boolean },
      input: { type: Object },
      output: { type: Object },
      dustPower: { type: Number },
      maxDustPower: { type: Number },
      timeRemaining: { type: Number },
    };
  }

  constructor() {
    super();
    this.dustPower = 0;
    this.maxDustPower = 0;
    this.loading = false;
    this.completed = false;

    this.timeRemaining = 5;
    this.intervalId = null;
  }

  handleOnSubmit(event: MouseEvent) {
    event.preventDefault();
    this.emitEvent({
      action: 'submit',
    });
  }

  emitEvent<T>(detail: T) {
    const event = new CustomEvent('imtbl-crafting-event', {
      detail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  startTimer() {
    this.intervalId = setInterval(() => {
      this.timeRemaining--;
      this.requestUpdate();
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        window.location.reload();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.intervalId);
  }

  render() {
    if (!this.input) {
      return html` <b class="flex justify-center py-6">Select a target</b> `;
    }

    const needsPower = this.dustPower < this.maxDustPower;
    const loadingBtnCx = this.loading ? 'loading' : '';
    const disabledBtnCx =
      !this.input.id || needsPower ? 'btn-disabled' : 'btn-accent';

    return html` <div class="divider">
        <b>Take ↘️</b> ${(this.input as InventoryItem).metadata.name}
        <b>Into ↗️</b> ${(this.output as ItemDefinition).name}
      </div>
      <div class="p-4">
        <div class="card bg-base-100 shadow-xl max-w-sm  mx-auto">
          <div class="flex">
            <figure class="flex-1">
              <img
                src="${this.input.metadata.image}"
                alt=${this.input.metadata.name}
              />
            </figure>
            <figure class="flex-1">
              <img src="${this.output.image}" alt=${this.output.name} />
            </figure>
          </div>
        </div>
        <div class="divider"><b>🎟 Dust Power</b></div>
        <progress
          class="progress w-full"
          value="${this.dustPower}"
          max="${this.maxDustPower}"
        ></progress>
        <b>
          ${this.dustPower}/${this.maxDustPower}
          <span class="text-accent"
            >${this.dustPower > this.maxDustPower
              ? `(⚠️🫣⚠️ ${Math.abs(
                  this.dustPower - this.maxDustPower
                )}+ overage!)`
              : ''}</span
          >
        </b>
        <div class="divider"><b>Properties Review</b></div>
        <div class="not-prose mt-6 mb-10 overflow-x-auto">
          <table class="table-compact table w-full">
            <thead>
              <tr>
                <th class="flex items-center gap-2 normal-case">Property</th>
                <th class="normal-case">Before</th>
                <th class="normal-case">After</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries((this.input as InventoryItem)?.metadata)
                .filter(
                  ([key]) => !['image', 'name', 'description'].includes(key)
                )
                .map(([key, before]) => {
                  const after = (this.output as ItemDefinition).properties[key];

                  return html`<tr>
                    <th class="font-normal">
                      <span class="font-mono lowercase">
                        ${this.propSymbols[key]} ${key}
                      </span>
                    </th>
                    <td>
                      <span class="badge badge-sm w-20">${before}</span>
                    </td>
                    <td>
                      <span class="badge badge-sm badge-info w-20"
                        >${after}</span
                      >
                    </td>
                  </tr>`;
                })}
            </tbody>
          </table>
        </div>
        <div class="flex w-full justify-center">
          <button
            @click=${this.handleOnSubmit}
            class="btn btn-active btn-wide ${loadingBtnCx} ${disabledBtnCx}"
          >
            ${this.completed
              ? 'Done! ✅'
              : needsPower
              ? 'Select Cards'
              : this.loading
              ? 'Crafting 🎡🤹🎪'
              : 'Craft Now'}
          </button>
        </div>
        <div class="flex w-full justify-center">
          ${this.completed
            ? html`
                <span class="countdown font-mono m-4">
                  reloading in
                  <span
                    class="px-4"
                    style="--value:${this.timeRemaining};"
                  ></span
                  >seconds
                </span>
              `
            : ''}
        </div>
      </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
  }

  protected updated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (changedProperties.has('completed') && this.completed === true) {
      this.startTimer();
    }
  }
}
