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
  };

  @eventOptions({ capture: true })
  async handleLoginClick(event: MouseEvent) {
    event.preventDefault();

    try {
      this.provider = await this.passport.connectImx();
      const accessToken = await this.passport?.getAccessToken();

      this.state = { ...this.state, accessToken };

      console.log({
        state: this.state,
      });
    } catch (error) {
      this.onLoginPopupCloseEvent(error);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    this.setup();
  }

  setup() {
    this.create();
    this.connect();
  }

  create() {
    const config = this.env === 'dev' ? devEnvConfig : Config[this.env];

    this.passport = new Passport(config as any, {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      logoutRedirectUri: this.logoutRedirectUri,
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
    console.log(
      '🚀 ~ file: craft-passport.ts:87 ~ CraftPassport ~ onLoginPopupCloseEvent ~ error:',
      error
    );
  }

  firstUpdated() {
    console.log('Component mounted!', {
      passport: this.passport,
    });
  }

  render() {
    return html`<div @click=${this.handleLoginClick}>
      <slot></slot>
    </div>`;
  }
}
