import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// FIXME
import { DomainRecipe } from '@imtbl/economy/dist/__codegen__/recipe';

@customElement('recipe-selection')
export class RecipeSelection extends LitElement {
  @property({ type: Array, attribute: 'recipes' })
  recipes: Array<DomainRecipe> = [];

  handleChange(event: InputEvent) {
    event.preventDefault();
    // get value from input on change
    const target = event.target as HTMLInputElement;
    this.emitEvent('crafting-widget-event', {
      type: 'recipe-selected',
      data: target.value,
    });
  }

  emitEvent<T>(type: string, detail: T) {
    const event = new CustomEvent('crafting-widget-event', {
      detail: { type, ...detail },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  render() {
    return html`
      <select class="select select-primary" @change=${this.handleChange}>
        <option disabled selected>Select a recipe</option>
        ${this.recipes.map(
          (recipe) => html`<option value="${recipe.id}">${recipe.name}</option>`
        )}
      </select>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
