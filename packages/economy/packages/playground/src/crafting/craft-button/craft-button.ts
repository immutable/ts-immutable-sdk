import { css, html, LitElement } from 'lit';
import { customElement, eventOptions, property, state, } from 'lit/decorators.js';

import { CraftInput, Economy } from '@imtbl/economy-sdk';

@customElement('imtbl-craft-button')
export class CraftButton extends LitElement {
  static styles = css``;
  @property()
  label?: string = '%craft-button%';
  private economy: Economy;
  @state()
  private craftInput: CraftInput = {
    requiresWeb3: true,
    web3Assets: {},
  };

  constructor() {
    super();
    this.economy = new Economy();
  }

  @eventOptions({ capture: true })
  handleClick(event: MouseEvent) {
    event.preventDefault();
    this.economy.craft(this.craftInput);
  }

  firstUpdated() {
    console.log('Component mounted!');
  }

  render() {
    return html`<div @click=${ this.handleClick }>
      <slot></slot>
    </div>`;
  }
}
