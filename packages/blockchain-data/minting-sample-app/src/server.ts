/**
 * Setup express server.
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { blockchainData, config, webhook } from '@imtbl/sdk';
import { metadata } from './metadata.js';
import { ethers } from 'ethers';

// **** Variables **** //

const app = express();


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// **** Routes **** //
app.post('/api/mint', async (req, res) => {
  // FIXME: protect this endpoint with your authentication method.
  // FIXME: replace wallet with your way of retrieving user wallet.
  const wallet = ethers.Wallet.createRandom();
  // FIXME: Use your own asset id if desired.
  const assetId = uuidv4();
  const contractAddress = process.env['CONTRACT_ADDRESS'];

  if (!contractAddress) {
    console.error("contract_address is not set in env");
    res.status(500).send('internal server error');
    return;
  }

  try {
    await blockchainData.recordMint(
      blockchainData.mintingPersistencePg, // use the mintingPersistence for postgres
      {
        owner_address: wallet.address,
        asset_id: assetId,
        contract_address: contractAddress,
        metadata
      }
    );
    res.send({});
  } catch (e: any) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

app.post('/api/process_webhook_event', async (req, res) => {
  console.log('req.body', req.body);
  try {
    await webhook.init(req.body, process.env.IMBTL_ENV as config.Environment, {
      zkevmMintRequestUpdated: async (e) => {
        await blockchainData.processMint(blockchainData.mintingPersistencePg, e);
        // do other things for this event
      },
      others: async (e) => {
        // Do something for other events
      }
    });
    res.send({});
  } catch (e) {
    console.error(e);
    res.status(500).send({});
  }
});


// **** Export default **** //

export default app;



