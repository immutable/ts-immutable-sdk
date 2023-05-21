import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('crafting-summary')
export class CraftingSummary extends LitElement {
  render() {
    return html` <div>Summary</div> `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
