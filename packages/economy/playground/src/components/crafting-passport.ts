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
  magicPublishableApiKey: 'pk_live_10F423798A540ED7',
  magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
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
  async handleClick(event: MouseEvent) {
    event.preventDefault();
    this.provider = await this.passport.connectImx();
  }

  async connectedCallback() {
    super.connectedCallback();
    const config = this.env === 'dev' ? devEnvConfig : Config[this.env];

    this.passport = new Passport(config as any, {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      logoutRedirectUri: this.logoutRedirectUri,
    });

    window.addEventListener('load', async () => {
      this.passport.loginCallback();
      this.state = {
        ...this.state,
        accessToken: await this.passport?.getAccessToken(),
      };
    });
  }

  firstUpdated() {
    console.log('Component mounted!', {
      passport: this.passport,
    });
  }

  render() {
    return html`<div @click=${this.handleClick}>
      <slot></slot>
    </div>`;
  }
}
