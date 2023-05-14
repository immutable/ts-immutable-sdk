/* eslint-disable no-console */
import { LitElement, css, html } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

@customElement('imtbl-craft-checkout-connect')
export class CraftingWrapper extends LitElement {
  static styles = css``;

  @state()
  private state = {
    isConnectOpen: false,
  };

  // eslint-disable-next-line class-methods-use-this
  firstUpdated() {
    console.log('Component mounted!');
  }

  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      'imtbl-connect-widget',
      this.handleCustomEvent(this.handleConnectEvent)
    );
  }

  toggleIsConnectOpen(value: boolean | undefined = undefined) {
    this.state = {
      ...this.state,
      isConnectOpen:
        value === undefined ? !this.state.isConnectOpen : Boolean(value),
    };
    this.requestUpdate();
  }

  handleConnectEvent(event: CustomEvent) {
    console.log(event);
    console.log('Getting data from within the event');
    switch (event.detail.type) {
      case 'success': {
        const eventData = event.detail.data;
        console.log({ type: 'success', eventData });
        break;
      }
      case 'failure': {
        const eventData = event.detail.data;
        console.log({ type: 'failure', eventData });
        this.handleCloseConnectWidget(eventData);
        break;
      }
      default:
        console.log('did not match any expected event type');
    }
  }

  handleCloseConnectWidget(data: { reason: string }) {
    // TODO: event detail could better provide a type for each reason.
    // ie: { type: 'failure', data: { reason: 'client closed widget', type: 'closed' } }
    if (
      `${data?.reason}`.toLowerCase().includes('closed') &&
      this.state.isConnectOpen === true
    ) {
      this.toggleIsConnectOpen(false);
    }
  }

  @eventOptions({ capture: true })
  handleConnectClick(event: MouseEvent) {
    event.preventDefault();
    if (this.state.isConnectOpen) return;
    this.toggleIsConnectOpen();
  }

  renderConnectWidget() {
    if (this.state.isConnectOpen === false) {
      return html`
        <slot name="connect-button" @click=${this.handleConnectClick}></slot>
      `;
    }

    return html` <slot name="connect-widget"></slot> `;
  }

  render() {
    return html`<div>${cache(this.renderConnectWidget())}</div>`;
  }
}
