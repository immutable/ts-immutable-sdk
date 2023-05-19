import { LitElement, html, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

type Item = { id: string; name: string; image: string; type: string };

@customElement('items-selection')
export class ItemsSelection extends LitElement {
  @property({ type: Array, attribute: 'items' })
  items: Array<Item> = [];

  @state()
  groupedItems: Array<unknown> = [];

  renderItem(item: Item) {
    return html`
      <div class="indicator w-full m-1">
        <div class="indicator-item indicator-bottom">
          <button class="btn btn-error btn-xs">remove</button>
        </div>
        <div
          class="border border-primary w-full flex flex-row justify-between items-center p-2"
        >
          <picture>
            <img class="m-0" src="${item.image}" alt="${item.name}" />
          </picture>
          <b>Job Title</b>
          <p class="m-1">Rerum reiciendis beatae tenetur excepturi</p>
        </div>
      </div>
    `;
  }

  render() {
    const items = Object.entries(
      this.items.reduce((acc, item) => {
        acc[item.type] = acc[item.type]?.concat(item) || [item];
        return acc;
      }, {} as Record<string, Item[]>)
    );

    return html`
      <div class="w-5/6 mx-auto">
        <ul class="tree prose">
          ${items.map(
            ([type, items], idx) => html`
              <li>
                <details open>
                  <summary group="${idx + 1}">${type}</summary>
                  <ul class="tree">
                    ${items.map(
                      (item) => html` <li>${this.renderItem(item)}</li> `
                    )}
                  </ul>
                </details>
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
