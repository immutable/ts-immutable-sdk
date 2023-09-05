/* eslint-disable no-console */
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { FactoryConfiguration, Factory, GetPresetsResponse, ZKEVM_DEVNET } from '@imtbl/factory-sdk';
import { ethers } from 'ethers';

async function main() {
    if (!process.env.PROVIDER) {
        console.log(process.env.PROVIDER);
        throw new Error('PROVIDER not set');
    }

    if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY not set');
    }

    const provider = new ethers.providers.JsonRpcProvider(
        process.env.PROVIDER,
    );

    // Create a wallet instance to simulate the user's wallet
    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider,
    );

      // Create a bridge configuration instance
    const factoryConfig = new FactoryConfiguration({
        baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
        }),
        factoryInstance: ZKEVM_DEVNET,
        provider: provider,
    });

    const factory = new Factory(factoryConfig);

    const presets: GetPresetsResponse = await factory.getPresets({});

    console.log(presets);
}

// Run the deposit function and exit the process when completed
(async () => {
    await main().then(() => {console.log(`Exiting Successfully`); process.exit(0)}).catch(e => {console.log(`Exiting with error: ${e.toString()}`); process.exit(1)});
  })();
  
