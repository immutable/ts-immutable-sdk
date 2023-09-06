/* eslint-disable no-console */
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { FactoryConfiguration, Factory, GetPresetsResponse, ZKEVM_DEVNET, GetUnsignedDeployPresetTxRequest } from '@imtbl/factory-sdk';
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

    // Create a wallet instance to simulate the user's wallet.
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

    // obtained form https://immutable.atlassian.net/wiki/spaces/IGG/pages/2216527667/Allowlist+Configuration
    const royaltyAllowlistAddress = "0x9A48B1B27743d807331d06eCF0bFb15c06fDb58D";
    const req: GetUnsignedDeployPresetTxRequest = {
        presetName: "ImmutableERC721MintByID",
        arguments: [wallet.address, "hello", "world", "cool", "beans", royaltyAllowlistAddress, wallet.address, "10"]
    }
    const unsignedTx = await factory.getUnsignedDeployPresetTx(req);
    console.log(unsignedTx);

    const deployTx = await wallet.sendTransaction(unsignedTx.unsignedTx);
    console.log(`Deploy transaction hash: ${deployTx.hash} ; waiting for confirmation...`);
    const receipt = await deployTx.wait();
    console.log(`Deploy transaction confirmed!`);
    for (const log of receipt.logs) {
        // This signature "0x68cc5c99c3d3fc4545fc38c25e0c6974cc1f0c1d73cc822a9f376904e5117dd1" will never change
        if (log.topics.length >= 1 && log.topics[0] === "0x68cc5c99c3d3fc4545fc38c25e0c6974cc1f0c1d73cc822a9f376904e5117dd1") {
            console.log(`Deployed contract address: ${ethers.utils.hexStripZeros(log.topics[2])}`);
        }
    }
}

// Run the deposit function and exit the process when completed
(async () => {
    await main().then(() => {console.log(`Exiting Successfully`); process.exit(0)}).catch(e => {console.log(`Exiting with error: ${e.toString()}`); process.exit(1)});
  })();
  
