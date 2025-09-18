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
const LOGIN_PROMPT_KEYFRAME_STYLES_ID = 'passport-embedded-login-keyframes';
const LOGIN_PROMPT_IFRAME_ID = 'passport-embedded-login-iframe';

export default class EmbeddedLoginPrompt {
  private config: PassportConfiguration;

  constructor(config: PassportConfiguration) {
    this.config = config;
  }

  private getHref = () => (
    `${this.config.authenticationDomain}/im-embedded-login-prompt?client_id=${this.config.oidcConfiguration.clientId}`
  );

  private static appendIFrameStylesIfNeeded = () => {
    if (document.getElementById(LOGIN_PROMPT_KEYFRAME_STYLES_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = LOGIN_PROMPT_KEYFRAME_STYLES_ID;
    style.textContent = `
      @keyframes passportEmbeddedLoginPromptPopBounceIn {
        0% {
          opacity: 0;
          transform: scale(0.9);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.98);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @media (max-height: 400px) {
        #${LOGIN_PROMPT_IFRAME_ID} {
          width: 100% !important;
          max-width: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  };

  private getEmbeddedLoginIFrame = () => {
    const embeddedLoginPrompt = document.createElement('iframe');
    embeddedLoginPrompt.id = LOGIN_PROMPT_IFRAME_ID;
    embeddedLoginPrompt.src = this.getHref();
    embeddedLoginPrompt.style.height = '100vh';
    embeddedLoginPrompt.style.width = '100vw';
    embeddedLoginPrompt.style.maxHeight = `${LOGIN_PROMPT_WINDOW_HEIGHT}px`;
    embeddedLoginPrompt.style.maxWidth = `${LOGIN_PROMPT_WINDOW_WIDTH}px`;
    embeddedLoginPrompt.style.borderRadius = LOGIN_PROMPT_WINDOW_BORDER_RADIUS;

    // Animation styles
    embeddedLoginPrompt.style.opacity = '0';
    embeddedLoginPrompt.style.transform = 'scale(0.9)';
    embeddedLoginPrompt.style.animation = 'passportEmbeddedLoginPromptPopBounceIn 0.6s ease-out 0.2s forwards';
    EmbeddedLoginPrompt.appendIFrameStylesIfNeeded();

    return embeddedLoginPrompt;
  };

  public displayEmbeddedLoginPrompt(): Promise<DirectLoginOptions> {
    return new Promise((resolve, reject) => {
      const embeddedLoginPrompt = this.getEmbeddedLoginIFrame();
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.authenticationDomain
          || data.eventType !== EMBEDDED_LOGIN_PROMPT_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as EmbeddedLoginPromptReceiveMessage) {
          case EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED: {
            const loginMethod = data.payload as EmbeddedLoginPromptResult;
            let result: DirectLoginOptions;
            if (loginMethod.directLoginMethod === 'email') {
              result = {
                directLoginMethod: 'email',
                marketingConsentStatus: loginMethod.marketingConsentStatus,
                email: loginMethod.email,
              };
            } else {
              result = {
                directLoginMethod: loginMethod.directLoginMethod,
                marketingConsentStatus: loginMethod.marketingConsentStatus,
              };
            }
            window.removeEventListener('message', messageHandler);
            EmbeddedLoginPromptOverlay.remove();
            resolve(result);
            break;
          }
          case EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_ERROR: {
            window.removeEventListener('message', messageHandler);
            EmbeddedLoginPromptOverlay.remove();
            reject(new Error('Error during embedded login prompt', { cause: data.payload }));
            break;
          }
          case EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_CLOSED: {
            window.removeEventListener('message', messageHandler);
            EmbeddedLoginPromptOverlay.remove();
            reject(new Error('Popup closed by user'));
            break;
          }
          default:
            window.removeEventListener('message', messageHandler);
            EmbeddedLoginPromptOverlay.remove();
            reject(new Error('Unsupported message type'));
            break;
        }
      };

      window.addEventListener('message', messageHandler);
      EmbeddedLoginPromptOverlay.appendOverlay(embeddedLoginPrompt, () => {
        window.removeEventListener('message', messageHandler);
        EmbeddedLoginPromptOverlay.remove();
        reject(new Error('Popup closed by user'));
      });
    });
  }
}
