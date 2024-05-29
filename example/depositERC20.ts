import { config, x } from '@imtbl/sdk';
import { Wallet } from '@ethersproject/wallet';
import { EtherscanProvider } from '@ethersproject/providers';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ProviderConfiguration,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GenericIMXProvider,
  createStarkSigner,
} = x;

const ethNetwork = 'sepolia'; // Or 'mainnet'
const etherscanAPIKey = process.env.ETHERSCAN_API_KEY || '';
const ethPrivateKey = process.env.PRIVATE_KEY || '';

(async () => {
  try {
    // Create Ethereum signer
    const provider = new EtherscanProvider(ethNetwork, etherscanAPIKey);
    const ethSigner = new Wallet(ethPrivateKey).connect(provider);

    // Create STARK signer
    const starkPrivateKey = await x.imxClientGenerateLegacyStarkPrivateKey(ethSigner);
    const starkSigner = createStarkSigner(starkPrivateKey);
    console.log('stark pub key', await starkSigner.getAddress());

    // Initialize provider
    const providerConfig = new ProviderConfiguration({
      baseConfig: new config.ImmutableConfiguration({ environment: config.Environment.SANDBOX }),
    });

    const imxProvider = new GenericIMXProvider(
      providerConfig,
      ethSigner,
      starkSigner,
    );

    const response = await imxProvider.deposit({
      amount: '10',
      type: 'ERC20',
      // tokenAddress: '0x174cE99C5a5407b2E7101e5a743F28936f2F0c69', // MZD
      // tokenAddress: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff', // IMX
      tokenAddress: '0xf674d458575c1b659da24a60add8a4f68cd7fb19', // MyToken
    });
    console.log('deposit response', response);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
