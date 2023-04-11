import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('imtbl-crafting-wrapper')
export class CraftButton extends LitElement {
  static styles = css``;

  constructor() {
    super();
  }

  firstUpdated() {
    console.log('Component mounted!');
  }

  render() {
    return html`<div>
      <slot></slot>
    </div>`;
  }
}
