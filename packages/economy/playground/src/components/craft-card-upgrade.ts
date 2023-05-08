import { EconomyCustomEventTypes } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

// FIXME: Use auto generated types
type CraftInput = {
  ingredients: CraftIngredient[];
  recipeId: string;
  userId: string;
};

type CraftIngredient = {
  conditionId: string;
  itemId: string;
};

type State = {
  craftInput: CraftInput;
};

@customElement('imtbl-craft-card-upgrade-widget')
export class CraftingCardUpgrade extends LitElement {
  static styles = css``;

  constructor() {
    super();
  }

  @state()
  private state: State = {
    craftInput: {
      userId: '',
      recipeId: '',
      ingredients: [],
    },
  };

  connectedCallback() {
    console.log('CraftingCardUpgrade :: connectedCallback');
    super.connectedCallback();
    window.addEventListener(
      EconomyCustomEventTypes.DEFAULT,
      this.handleCustomEvent(this.handleConnectEvent)
    );
  }

  firstUpdated() {
    console.log('CraftingCardUpgrade :: firstUpdated');
    // Check the component was mounted
  }

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  handleConnectEvent(event: CustomEvent) {
    console.log('CraftingCardUpgrade :: Getting event from within Economy');
    console.log(event);
  }

  renderCollection() {
    return html`<div>List of craft items</div>`;
  }

  renderSelection() {
    return html`<div>Selected items for crafting</div>`;
  }

  renderOutputs() {
    return html`<div>
      Render the craft outputs and craft button
      ${cache(this.renderCraftOutput())}
      <button @click=${this.submitCrafting}>Craft Button</button>
    </div>`;
  }

  renderCraftOutput() {
    return html`<div>craft expected output as in recipe</div>`;
  }

  @eventOptions({ capture: true })
  async submitCrafting() {
    console.log('CraftingCardUpgrade :: submitCrafting');
    // TODO: process the crafting request
    // SDK.craft(...this.craftInput) // send the arguments required, taken from state's craftInput
    // await for results then update the craft results in state
  }

  render() {
    return html`<div>
      ${cache(this.renderCollection())} ${cache(this.renderSelection())}
      ${cache(this.renderOutputs())}
    </div>`;
  }
}
