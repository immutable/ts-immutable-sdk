import { LitElement, css, html } from 'lit';
import {
  customElement,
  eventOptions,
  property,
  state,
} from 'lit/decorators.js';
import { Config, Passport } from '@imtbl/passport';
import { IMXProvider } from '@imtbl/provider';

const devEnvConfig = {
  network: 'goerli',
  authenticationDomain: 'https://auth.dev.immutable.com',
  magicPublishableApiKey: 'pk_live_4058236363130CA9',
  magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
  baseIMXApiPath: 'https://api.dev.x.immutable.com',
  passportDomain: 'https://passport.dev.immutable.com',
};

@customElement('imtbl-craft-passport')
export class CraftPassport extends LitElement {
  static styles = css``;

  private passport!: Passport;
  private provider!: IMXProvider;
  private button!: HTMLButtonElement;

  @property()
  env: keyof typeof Config | 'dev' = 'SANDBOX';

  @property()
  clientId: string = '';

  @property()
  redirectUri: string = '';

  @property()
  logoutRedirectUri: string = '';

  @state()
  private state = {
    accessToken: '',
    userInfo: {},
    user: {},
  };

  @eventOptions({ capture: true })
  async handleLoginClick(event: MouseEvent) {
    event.preventDefault();

    try {
      this.provider = await this.passport.connectImx();
      this.setStateProperties();
    } catch (error) {
      this.onLoginPopupCloseEvent(error);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    this.setup();
  }

  get _slottedChildren() {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot?.assignedElements({ flatten: true });
  }

  setup() {
    this.create();
    this.connect();
    this.setStateProperties();
  }

  create() {
    const config = this.env === 'dev' ? devEnvConfig : Config[this.env];

    this.passport = new Passport(config as any, {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      logoutRedirectUri: this.logoutRedirectUri,
      scope: 'openid offline_access transact',
      audience: 'platform_api',
    });
  }

  connect() {
    this.onLoginCallbackEvent();
  }

  onLoginCallbackEvent() {
    window.addEventListener('load', async () => {
      try {
        await this.passport.loginCallback();
      } catch {}
    });
  }

  async onLoginPopupCloseEvent(error: any) {
    console.log('CraftPassport ~ onLoginPopupCloseEvent ~ error:', error);
  }

  async setStateProperties() {
    const [accessToken, userInfo] = await Promise.all([
      this.passport.getAccessToken(),
      this.passport.getUserInfo(),
    ]);
    const user = (this.provider as any)?.user || {};
    this.state = { ...this.state, accessToken, userInfo, user };
    this.requestUpdate();
    console.log({ state: this.state });
  }

  firstUpdated() {
    console.log('Component mounted!', {
      passport: this.passport,
    });
    this.button = this._slottedChildren?.[0] as HTMLButtonElement;
  }

  renderConnected() {
    this.button.textContent = 'reconnect';
    return html`
      <b>Connected to Passport</b><br />
      <pre>${JSON.stringify(this.state, undefined, 2)}</pre>
    `;
  }

  renderDetails() {
    if (this.state.accessToken) {
      return this.renderConnected();
    }

    return html`<b>Not connected</b>`;
  }

  render() {
    return html`<div @click=${this.handleLoginClick}>
      ${this.renderDetails()}
      <slot></slot>
    </div>`;
  }
}
