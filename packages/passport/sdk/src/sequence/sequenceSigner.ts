import { AbstractSigner, Signer, TypedDataDomain, TypedDataField, hexlify, toUtf8Bytes, getBytes, Wallet, keccak256, hashMessage, toBeHex, concat } from 'ethers';
import { Identity } from '@0xsequence/wallet-wdk';
import { IdentityInstrument, IdTokenChallenge } from '@0xsequence/identity-instrument';
import { PassportError, PassportErrorType } from '../errors/passportError';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { User } from '../types';
import { Hex, Bytes } from 'ox'
import jwtDecode from 'jwt-decode';
import { IdTokenPayload } from '../types';

interface AuthKey {
  address: string;
  privateKey: CryptoKey;
  identitySigner: string;
  expiresAt: Date;
}

interface UserWallet {
  userIdentifier: string;
  walletAddress: string;
  authKey: AuthKey;
  identityInstrument: IdentityInstrument;
}

// Private key wallet for non-Identity Instrument mode
interface PrivateKeyWallet {
  userIdentifier: string;
  walletAddress: string;
  wallet: Wallet;
}

export default class SequenceSigner extends AbstractSigner {
  private readonly authManager: AuthManager;
  private readonly config: PassportConfiguration;
  
  // Identity Instrument mode
  private userWallet: UserWallet | null = null;
  private createWalletPromise: Promise<UserWallet> | null = null;
  
  // Private key mode
  private privateKeyWallet: PrivateKeyWallet | null = null;
  private createPrivateKeyWalletPromise: Promise<PrivateKeyWallet> | null = null;

  private useIdentityInstrument: boolean = false;

  constructor(authManager: AuthManager, config: PassportConfiguration) {
    super();
    this.authManager = authManager;
    this.config = config;
  }

  private async getUserWallet(): Promise<UserWallet> {
    let { userWallet } = this;
    if (!userWallet) {
      userWallet = await this.createWallet();
    }

    const user = await this.getUserOrThrow();
    if (user.profile.sub !== userWallet.userIdentifier) {
      userWallet = await this.createWallet(user);
    }

    return userWallet;
  }
  private async createWallet(user?: User): Promise<UserWallet> {
    if (this.createWalletPromise) return this.createWalletPromise;
  
    this.createWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.userWallet = null;
        // Need a new ID token to call identity instrument, TODO: improve thi
        await this.authManager.forceUserRefresh();
        const authenticatedUser = user || await this.getUserOrThrow();
        
        if (!authenticatedUser.idToken) {
          throw new PassportError(
            'User idToken not available',
            PassportErrorType.NOT_LOGGED_IN_ERROR,
          );
        }
  
        const identityInstrumentEndpoint = 'https://next-identity.sequence-dev.app/';//this.config.sequenceIdentityInstrumentEndpoint 
          //|| 'https://identity.sequence.app/';
  
        // OIDC credentials from Passport config
        const idToken = authenticatedUser.idToken;
        const decoded = jwtDecode<IdTokenPayload>(idToken)
        const issuer = decoded.iss;
        const audience = decoded.aud;
  
        // Generate NEW ephemeral authKey for this session
        // Note: authKey is ephemeral and not reused. The identity signer address is deterministic.
        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['sign', 'verify']
        );
  
        const publicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
        const authKey: AuthKey = {
          address: Hex.fromBytes(new Uint8Array(publicKey)),
          privateKey: keyPair.privateKey,
          identitySigner: '',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour
        };
  
        const identityInstrument = new IdentityInstrument(identityInstrumentEndpoint, "@14:test");
        const challenge = new IdTokenChallenge(issuer, audience, idToken);
  
        console.log('[SequenceSigner] Registering authKey with Identity Instrument...');
        
        // Register this ephemeral authKey with the user's identity
        await identityInstrument.commitVerifier(
          Identity.toIdentityAuthKey(authKey),
          challenge
        );
  
        console.log('[SequenceSigner] Completing auth to get identity signer...');
        
        // Get the deterministic identity signer address for this user
        const result = await identityInstrument.completeAuth(
          Identity.toIdentityAuthKey(authKey),
          challenge
        );
  
        const signerAddress = result.signer.address;
        authKey.identitySigner = signerAddress;
        
        console.log('[SequenceSigner] Identity signer established:', signerAddress);
  
        this.userWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          walletAddress: signerAddress,
          authKey,
          identityInstrument,
        };
  
        return resolve(this.userWallet!);
      } catch (error) {
        const errorMessage = `Identity Instrument: Failed to create signer: ${(error as Error).message}`;
        console.error('[SequenceSigner] Error:', errorMessage, error);
        return reject(new PassportError(errorMessage, PassportErrorType.WALLET_CONNECTION_ERROR));
      } finally {
        this.createWalletPromise = null;
      }
    });
  
    return this.createWalletPromise;
  }

  private async getPrivateKeyWallet(): Promise<PrivateKeyWallet> {
    let { privateKeyWallet } = this;
    if (!privateKeyWallet) {
      privateKeyWallet = await this.createPrivateKeyWallet();
    }

    const user = await this.getUserOrThrow();
    if (user.profile.sub !== privateKeyWallet.userIdentifier) {
      privateKeyWallet = await this.createPrivateKeyWallet(user);
    }

    return privateKeyWallet;
  }

  private async createPrivateKeyWallet(user?: User): Promise<PrivateKeyWallet> {
    if (this.createPrivateKeyWalletPromise) return this.createPrivateKeyWalletPromise;

    this.createPrivateKeyWalletPromise = new Promise(async (resolve, reject) => {
      try {
        this.privateKeyWallet = null;
        const authenticatedUser = user || await this.getUserOrThrow();
        
        // Derive deterministic private key from user identity
        const seed = `${authenticatedUser.profile.sub}-sequence-arb-one`;
        const privateKeyHash = keccak256(toUtf8Bytes(seed));
        
        const wallet = new Wallet(privateKeyHash);
        const walletAddress = await wallet.getAddress();

        this.privateKeyWallet = {
          userIdentifier: authenticatedUser.profile.sub,
          walletAddress,
          wallet,
        };

        return resolve(this.privateKeyWallet!);
      } catch (error) {
        const errorMessage = `Failed to create private key wallet: ${(error as Error).message}`;
        return reject(new PassportError(errorMessage, PassportErrorType.WALLET_CONNECTION_ERROR));
      } finally {
        this.createPrivateKeyWalletPromise = null;
      }
    });

    return this.createPrivateKeyWalletPromise;
  }

  private async getUserOrThrow(): Promise<User> {
    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError(
        'User not authenticated',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return user;
  }

  async getAddress(): Promise<string> {
    if (this.useIdentityInstrument) {
      const wallet = await this.getUserWallet();
      return wallet.walletAddress;
    } else {
      const wallet = await this.getPrivateKeyWallet();
      return wallet.walletAddress;
    }
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (this.useIdentityInstrument) {
      // Identity Instrument mode
      const wallet = await this.getUserWallet();
      
      const signer = new Identity.IdentitySigner(
        wallet.identityInstrument,
        wallet.authKey
      );
      
      // Convert message to 32-byte hash digest
      // signMessage expects the message to be hashed with Ethereum prefix
      let messageBytes: Uint8Array;
      if (typeof message === 'string') {
        messageBytes = toUtf8Bytes(message);
      } else {
        messageBytes = message;
      }
      
      // Hash with Ethereum message prefix: keccak256("\x19Ethereum Signed Message:\n" + len(message) + message)
      const digest = hashMessage(messageBytes);
      
      // Sign using Identity Instrument (expects 32-byte hash)
      const signature = await signer.signDigest(getBytes(digest));
      
      // Convert signature object to hex string in standard ECDSA format
      // Identity Instrument returns: { r: bigint, s: bigint, yParity: number, type: "hash" }
      // We need: 0x + r (32 bytes) + s (32 bytes) + v (1 byte)
      const r = toBeHex(signature.r, 32);
      const s = toBeHex(signature.s, 32);
      const v = toBeHex(signature.yParity + 27, 1); // Standard Ethereum: v = 27 or 28
      
      return concat([r, s, v]);
    } else {
      // Private key mode
      const pkWallet = await this.getPrivateKeyWallet();
      return pkWallet.wallet.signMessage(message);
    }
  }

  async signTransaction(): Promise<string> {
    throw new PassportError(
      'signTransaction not supported - use signMessage for EIP-712 signing',
      PassportErrorType.WALLET_CONNECTION_ERROR,
    );
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
  ): Promise<string> {
    if (this.useIdentityInstrument) {
      throw new PassportError(
        'signTypedData not yet implemented for Identity Instrument',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    } else {
      // Private key mode
      const pkWallet = await this.getPrivateKeyWallet();
      return pkWallet.wallet.signTypedData(domain, types, value);
    }
  }

  connect(): Signer {
    throw new PassportError(
      'connect() not supported',
      PassportErrorType.WALLET_CONNECTION_ERROR,
    );
  }
}
