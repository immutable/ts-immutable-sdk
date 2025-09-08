import { trackError } from '@imtbl/metrics';

import {
  EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
  EmbeddedLoginPromptResult,
  EmbeddedLoginPromptReceiveMessage,
} from './types';
import { PassportConfiguration } from '../config';
import EmbeddedLoginPromptOverlay from '../overlay/embeddedLoginPromptOverlay';
import { DirectLoginOptions } from '../types';

const LOGIN_PROMPT_WINDOW_HEIGHT = 560;
const LOGIN_PROMPT_WINDOW_WIDTH = 440;
const LOGIN_PROMPT_WINDOW_BORDER_RADIUS = '16px';

export default class EmbeddedLoginPrompt {
  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  private getHref = (clientId: string) => (
    // `${this.config.authenticationDomain}/im-embedded-login-prompt?client_id=${clientId}`
    `http://localhost:3001/im-embedded-login-prompt?client_id=${clientId}`
  );

  private getEmbeddedLoginIFrame = () => {
    const embeddedLoginPrompt = document.createElement('iframe');
    embeddedLoginPrompt.src = this.getHref(this.config.oidcConfiguration.clientId);
    embeddedLoginPrompt.style.width = `${LOGIN_PROMPT_WINDOW_WIDTH}px`;
    embeddedLoginPrompt.style.height = `${LOGIN_PROMPT_WINDOW_HEIGHT}px`;
    embeddedLoginPrompt.style.borderRadius = LOGIN_PROMPT_WINDOW_BORDER_RADIUS;

    return embeddedLoginPrompt;
  }

  displayEmbeddedLoginPrompt(): Promise<DirectLoginOptions> {
    return new Promise((resolve, reject) => {
      const embeddedLoginPrompt = this.getEmbeddedLoginIFrame();
      console.log('embeddedLoginPrompt', embeddedLoginPrompt);

      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          // origin !== this.config.authenticationDomain
          origin !== 'http://localhost:3001'
          || data.eventType !== EMBEDDED_LOGIN_PROMPT_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as EmbeddedLoginPromptReceiveMessage) {
          case EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED: {
            const loginMethod = data.loginMethod as EmbeddedLoginPromptResult;
            let result: DirectLoginOptions;
            if (loginMethod.loginType === 'email') {
              result = {
                directLoginMethod: 'email',
                marketingConsentStatus: loginMethod.marketingConsent,
                email: loginMethod.emailAddress,
              };
            } else {
              result = {
                directLoginMethod: loginMethod.loginType,
                marketingConsentStatus: loginMethod.marketingConsent,
              };
            }
            resolve(result);
            this.closeWindow();
            break;
          }
          case EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_ERROR: {
            this.closeWindow();
            reject(new Error('Error during embedded login prompt'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };

      window.addEventListener('message', messageHandler);
      EmbeddedLoginPromptOverlay.appendOverlay(embeddedLoginPrompt, () => {
        this.closeWindow();
        window.removeEventListener('message', messageHandler);
        reject(new Error('Popup closed by user'));
      });
    });
  }

  closeWindow() {
    EmbeddedLoginPromptOverlay.remove();
  }
}
