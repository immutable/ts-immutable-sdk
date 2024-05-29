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
      baseConfig: new config.ImmutableConfiguration({ environment: config.Environment.SANDBOX }),
    });

    const imxProvider = new GenericIMXProvider(
      providerConfig,
      ethSigner,
      starkSigner,
    );

    const response = await imxProvider.prepareWithdrawal({
      type: 'ERC721',
      tokenAddress: '0xe90780b31f1b67a2153fdf256e6ca95025055d75',
      tokenId: '10',
    });
    console.log('prepare withdrawal response', response);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
