import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import PassportImxProvider from './imxProvider/passportImxProvider';

export class PassportWalletProvider {
  private authManager: AuthManager;
  private magicAdapter: MagicAdapter;
  private _providerName = 'PassportWalletProvider';
  private _providerIcon = '';

  get providerName() {
    return this._providerName;
  }

  get providerIcon() {
    return this._providerIcon;
  }

  constructor(authManager: AuthManager, magicAdapter: MagicAdapter) {
    this.authManager = authManager;
    this.magicAdapter = magicAdapter;
  }

  public async connect(): Promise<PassportImxProvider> {
    const user = await this.authManager.login();
    if (!user.id_token) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR
      );
    }
    const provider = await this.magicAdapter.login(user.id_token);
    const signer = await getStarkSigner(provider.getSigner());
    //TODO UserRigistration
    return new PassportImxProvider(user, signer);
  }
}
