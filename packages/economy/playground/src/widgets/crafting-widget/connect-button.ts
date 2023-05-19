import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('connect-button')
export class ConnectButton extends LitElement {
  handleClick(evt: Event) {
    console.log(
      '🚀 ~ file: connect-button.ts:7 ~ ConnectButton ~ handleClick ~ evt:',
      evt
    );
    evt.preventDefault();
  }

  render() {
    return html`
      <button class="btn " @click=${this.handleClick}>Connect</button>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
