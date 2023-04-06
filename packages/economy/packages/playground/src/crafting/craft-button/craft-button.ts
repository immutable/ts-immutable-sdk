import { LitElement, css, html } from 'lit';
import {
  customElement,
  eventOptions,
  property,
  state,
} from 'lit/decorators.js';

import { Economy } from '@imtbl/economy-sdk';
import { CraftInput } from '@imtbl/economy-sdk';

@customElement('imtbl-craft-button')
export class CraftButton extends LitElement {
  static styles = css``;

  private economy: Economy;

  constructor() {
    super();
    this.economy = new Economy();
  }

  @property()
  label?: string = '%craft-button%';

  @state()
  private craftInput: CraftInput = {
    requiresWeb3: true,
    web3Assets: {},
  };

  @eventOptions({ capture: true })
  handleClick(event: MouseEvent) {
    event.preventDefault();
    this.economy.craft(this.craftInput);
  }

  firstUpdated() {
    console.log('Component mounted!');
  }

  render() {
    return html`<div @click=${this.handleClick}>
      <slot></slot>
    </div>`;
  }
}
