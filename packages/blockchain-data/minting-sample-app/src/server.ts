/**
 * Setup express server.
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recordMint, processMint, mintingPersistencePg } from '@imtbl/blockchain-data';
import { metadata } from './metadata.js';
import { init } from '@imtbl/webhook';
import { ethers } from 'ethers';
import { Environment } from '@imtbl/config';


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
  // FIXME: The asset
  const assetId = uuidv4();

  try {
    const contractAddress = process.env['CONTRACT_ADDRESS'];

    if (!contractAddress) {
      console.error("contract_address is not set in env");
      res.status(500).send('internal server error');
      return;
    }

    await recordMint(mintingPersistencePg, {
      owner_address: wallet.address,
      asset_id: assetId,
      contract_address: contractAddress,
      metadata
    });
    res.send({});
  } catch (e: any) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

app.post('/api/process_webhook_event', async (req, res) => {
  console.log('req.body', req.body);
  try {
    await init(req.body, process.env.IMBTL_ENV as Environment, {
      zkevmMintRequestUpdated: (e) => processMint(mintingPersistencePg, e)
    });
    res.send({});
  } catch (e) {
    console.error(e);
    res.status(500).send({});
  }
});


// **** Export default **** //

export default app;



