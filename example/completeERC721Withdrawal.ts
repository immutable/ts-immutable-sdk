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

const ethNetwork = 'mainnet'; // Or 'mainnet'
const etherscanAPIKey = process.env.ETHERSCAN_API_KEY || '';
const ethPrivateKey = process.env.PRIVATE_KEY || '';
console.log(etherscanAPIKey);

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
      baseConfig: new config.ImmutableConfiguration({ environment: config.Environment.PRODUCTION }),
    });

    const imxProvider = new GenericIMXProvider(
      providerConfig,
      ethSigner,
      starkSigner,
    );

    const response = await imxProvider.completeWithdrawal(await starkSigner.getAddress(), {
      type: 'ERC721',
      tokenAddress: '0xc1ac24fb8242848c676a499b45579e6886d4707d',
      tokenId: '31',
    });
    console.log('complete withdrawal response', response);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
