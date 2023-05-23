import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { Passport } from '@imtbl/passport';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import type { IMXProvider } from '@imtbl/provider';
import { ImmutableXClient } from '@imtbl/immutablex-client';

@customElement('connect-button')
export class ConnectButton extends LitElement {
  baseConfig: ImmutableConfiguration = new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  });

  private passport!: Passport;

  @state()
  provider!: IMXProvider;

  @state()
  loading = false;

  constructor() {
    super();

    this.passport = new Passport({
      baseConfig: this.baseConfig,
      overrides: {
        network: 'goerli' as any,
        authenticationDomain: 'https://auth.dev.immutable.com',
        magicPublishableApiKey: 'pk_live_4058236363130CA9',
        magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
        passportDomain: 'https://passport.dev.immutable.com',
        immutableXClient: new ImmutableXClient({ baseConfig: this.baseConfig }),
      },
      clientId: '3Xt3vBGjrsuLnBKK3mtJsIU5j5WikfQC',
      redirectUri: window.location.href,
      logoutRedirectUri: window.location.href,
      scope: 'openid offline_access email transact',
      audience: 'platform_api',
    });
  }

  async handleClick(evt: Event) {
    evt.preventDefault();

    this.setLoading(true);

    try {
      this.provider = await this.passport.connectImx();
    } catch (e) {
      this.setLoading(false);
    }

    this.setLoading(false);
  }

  render() {
    const label = this.loading ? '' : this.provider ? 'connected' : 'connect';
    return html`
      <button
        class="btn ${this.loading ? 'loading' : ''} ${this.provider
          ? 'pointer-events-none btn-success'
          : ''}"
        @click=${this.handleClick}
      >
        ${label}
      </button>
    `;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
    this.requestUpdate();
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.closeConnectPopup();
    await this.setProviderOnConnect();
  }

  async closeConnectPopup() {
    try {
      await this.passport.loginCallback();
    } catch {}
  }

  async setProviderOnConnect() {
    try {
      this.setLoading(true);
      const provider = await this.passport.connectImxSilent();
      if (provider) this.provider = provider;
    } catch (error) {
      this.setLoading(false);
    }

    this.setLoading(false);
  }

  async setUserInfoOnProvider() {
    if (this.provider) {
      const userInfo = await this.passport.getUserInfo();
      const address = await this.provider.getAddress();

      this.emitEvent('userInfo', {
        userInfo: {
          userId: userInfo?.sub,
          email: userInfo?.email,
          address,
        },
      });
    }
  }

  emitEvent<T>(type: string, detail: T) {
    const event = new CustomEvent('crafting-widget-event', {
      detail: { type, ...detail },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  update(changedProperties: Map<string, unknown>) {
    console.log(
      '🚀 ~ file: connect-button.ts:119 ~ ConnectButton ~ update ~ changedProperties:',
      Array.from(changedProperties.keys())
    );
    if (changedProperties.has('provider')) {
      this.setUserInfoOnProvider();
    }

    super.update(changedProperties);
  }
}
