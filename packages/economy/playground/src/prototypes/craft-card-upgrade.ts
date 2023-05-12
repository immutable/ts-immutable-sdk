import { EconomyCustomEventTypes } from '@imtbl/economy';
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators';
import { cache } from 'lit/directives/cache';

// FIXME: Use auto generated types from ts codegen
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

  @state()
  private state: State = {
      craftInput: {
        userId: '',
        recipeId: '',
        ingredients: [],
      },
    };

  connectedCallback() {
    // TODO: Remove once fixed
    // eslint-disable-next-line no-console
    console.log('CraftingCardUpgrade :: connectedCallback');
    super.connectedCallback();
    window.addEventListener(
      EconomyCustomEventTypes.DEFAULT,
      this.handleCustomEvent(this.handleConnectEvent),
    );
  }

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
  firstUpdated() {
    // TODO: Remove once fixed
    // eslint-disable-next-line no-console
    console.log('CraftingCardUpgrade :: firstUpdated');
    // Check the component was mounted
  }

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
  handleConnectEvent(event: CustomEvent) {
    // eslint-disable-next-line no-console
    console.log('CraftingCardUpgrade :: Getting event from within Economy');
    // eslint-disable-next-line no-console
    console.log(event);
  }

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
  renderCollection() {
    return html`<div>List of craft items</div>`;
  }

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
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

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
  renderCraftOutput() {
    return html`<div>craft expected output as in recipe</div>`;
  }

  // TODO: Remove once fixed
  // eslint-disable-next-line class-methods-use-this
  @eventOptions({ capture: true })
  async submitCrafting() {
    // TODO: Remove once fixed
    // eslint-disable-next-line no-console
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
