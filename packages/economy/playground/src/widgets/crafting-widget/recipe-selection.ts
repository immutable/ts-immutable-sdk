import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('recipe-selection')
export class RecipeSelection extends LitElement {
  @property({ type: Array, attribute: 'recipes' })
  recipes: Array<unknown> = [];

  render() {
    const properties = {
      recipes: this.recipes,
    };
    console.log(
      '🚀 ~ file: recipe-selection.ts:13 ~ RecipeSelection ~ render ~ properties:',
      properties
    );
    return html`
      <select class="select select-primary">
        <option disabled selected>Select a recipe</option>
        ${this.recipes.map(
          (recipe) => html`<option value="${recipe}">${recipe}</option>`
        )}
      </select>
    `;
  }
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
