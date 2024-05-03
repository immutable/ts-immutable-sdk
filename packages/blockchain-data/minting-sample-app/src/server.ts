/**
 * Setup express server.
 */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recordMint, processMint, mintingPersistencePg } from '@imtbl/blockchain-data';
import { createWallet, getUserWalletByUserId } from './user';
import { metadata } from './metadata';
import { init } from '@imtbl/webhook';


// **** Variables **** //

const app = express();


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// **** Routes **** //
app.post('/api/assets', async (req, res) => {
  if (!req.body.userId) {
    res.status(400).send('userId is required');
    return;
  }
  try {
    const assetId = uuidv4();
    // create user if not exists
    // TODO: grab from passport
    await createWallet(req.body.userId);
    // get wallet address against user id from db.
    const userWallet = await getUserWalletByUserId(req.body.userId);
    // DEBUG
    console.log('userWallet', userWallet);

    const contractAddress = process.env['CONTRACT_ADDRESS'];

    if (!contractAddress) {
      console.error("contract_address is not set in env");
      res.status(500).send('internal server error');
      return;
    }

    await recordMint(mintingPersistencePg, { owner_address: userWallet.wallet_address, asset_id: assetId, contract_address: contractAddress, metadata });
    res.send({});
  } catch (e: any) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

app.post('/api/process_webhook_event', async (req, res) => {
  console.log('req.body', req.body);
  try {
    await init(req.body, {
      zkevmMintRequestUpdated: (e) => processMint(mintingPersistencePg, e)
    });
    res.send({});
  } catch(e) {
    console.error(e);
    res.status(500).send({});
  }
});


// **** Export default **** //

export default app;



