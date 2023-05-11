/* eslint-disable no-console */
import { LitElement, css, html } from 'lit';
import {
  customElement,
  eventOptions,
  property,
  state,
} from 'lit/decorators';

import { Economy, EconomyCustomEventTypes } from '@imtbl/economy';
import type { CraftInput } from '@imtbl/economy';

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

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      EconomyCustomEventTypes.DEFAULT,
      this.handleCustomEvent(this.handleConnectEvent),
    );
  }

  @eventOptions({ capture: true })
  handleClick(event: MouseEvent) {
    event.preventDefault();
    this.economy.crafting.craft(this.craftInput);
  }

  // eslint-disable-next-line class-methods-use-this
  handleConnectEvent(event: CustomEvent) {
    // remove eslint-disable-next-line when function is implemented
    console.log(event);
    console.log('Getting event from within Economy');
  }

  // eslint-disable-next-line class-methods-use-this
  firstUpdated() {
    // remove eslint-disable-next-line when function is implemented
    console.log('Component mounted!');
  }

  render() {
    return html`<div @click=${this.handleClick}>
      <slot></slot>
    </div>`;
  }
}
