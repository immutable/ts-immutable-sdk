import { config, mintingBackend, webhook } from '@imtbl/sdk';
import 'dotenv/config';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';


const fastify = Fastify({
  logger: true
});

// setup database client
const pgClient = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.DB_NAME || 'migration_backend',
  password: process.env.PG_PASSWORD || 'password',
  port: 5432,
});

// persistence setup for minting backend
const mintingPersistence = mintingBackend.mintingPersistencePg(pgClient);

const minting = new mintingBackend.MintingBackendModule({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    apiKey: process.env.IMX_API_KEY,
  },
  persistence: mintingPersistence,
  logger: console,
});

// Single webhook endpoint for both transfer (burn) and mint events
fastify.post('/webhook', async (request, reply) => {
  try {
    await webhook.handle(
      request.body as any,
      config.Environment.SANDBOX,
      {
        zkevmMintRequestUpdated: async (event) => {
          console.log('Received webhook event:', event);

          await minting.processMint(request.body as any);
          console.log('Processed minting update:', event);
        },
        xTransferCreated: async (event) => {
          console.log('Received webhook event:', event);
          // Check if this is a transfer to burn address for our monitored collection
          if (
            event.data.receiver.toLowerCase() === process.env.IMX_BURN_ADDRESS?.toLowerCase() &&
            event.data.token?.data?.token_address?.toLowerCase() === process.env.IMX_MONITORED_COLLECTION_ADDRESS?.toLowerCase()
          ) {
            // Create mint request on zkEVM
            let mintRequest = {
              asset_id: uuidv4(),
              contract_address: process.env.ZKEVM_COLLECTION_ADDRESS!,
              owner_address: event.data.user,
              token_id: event.data.token.data.token_id,
              metadata: {} // Add any metadata if needed
            };
            await minting.recordMint(mintRequest);

            console.log(`Created mint request for burned token ${event.data.token.data.token_id}`);
          }
        }
      }
    );

    return reply.send({ status: 'ok' });
  } catch (error: unknown) {
    console.log(error)
    return reply.status(500).send({ 
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });

    // long running process to submit minting requests
    await minting.submitMintingRequests({});
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();