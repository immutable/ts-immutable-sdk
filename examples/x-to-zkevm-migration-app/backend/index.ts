import cors from '@fastify/cors';
import { config, mintingBackend, webhook } from '@imtbl/sdk';
import 'dotenv/config';
import Fastify, { FastifyRequest } from 'fastify';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { migrationPersistence } from './persistence/postgres';

const fastify = Fastify({
  logger: true
});

// Enable CORS
fastify.register(cors, {
  origin: '*',
}); 

// setup database client
const pgClient = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.DB_NAME || 'migration_backend',
  password: process.env.PG_PASSWORD || 'password',
  port: 5432,
});

const migrations = migrationPersistence(pgClient);

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
          const tokenAddress = event.data.contract_address;
          const tokenId = event.data.token_id || '';

          // Update migration status
          if (tokenAddress && tokenId && event.data.status === 'succeeded') {
            const migration = await migrations.getMigration(tokenId, { zkevmCollectionAddress: tokenAddress });
            if (!migration) {
                console.log(`Migration record not found for minted token ${tokenId}`);
                return;   
            }

            await migrations.updateMigration(migration.id, {
              status: 'minted',
            });
          }

          await minting.processMint(request.body as any);
          console.log('Processed minting update');
        },
        xTransferCreated: async (event) => {
          console.log('Received webhook event:', event);
          // Check if this is a transfer to burn address for our monitored collection
          if (
            event.data.receiver.toLowerCase() === process.env.IMX_BURN_ADDRESS?.toLowerCase() &&
            event.data.token?.data?.token_address?.toLowerCase() === process.env.IMX_MONITORED_COLLECTION_ADDRESS?.toLowerCase()
          ) {
            // Check if we have a migration record for this token
            const tokenAddress = event.data.token?.data?.token_address;
            const tokenId = event.data.token?.data?.token_id;

            if (tokenAddress && tokenId) {
              const migration = await migrations.getMigration(tokenId, { xCollectionAddress: tokenAddress });
              if (!migration) {
                  console.log(`Migration record not found for burned token ${tokenId}`);
                  return;   
              }

              // Update migration status
              await migrations.updateMigration(migration.id, {
                burn_id: event.data.transaction_id.toString(),
                status: 'burned',
              });

              // Create mint request on zkEVM
              let mintRequest = {
                asset_id: uuidv4(),
                contract_address: process.env.ZKEVM_COLLECTION_ADDRESS!,
                owner_address: migration.zkevm_wallet_address,
                token_id: migration.token_id,
                metadata: {} // Add any metadata if needed
              };
              await minting.recordMint(mintRequest);

              console.log(`Updated migration status for burned token ${tokenId}`);

              console.log(`Created mint request for burned token ${event.data.token.data.token_id}`);
            } else {
                console.log('Token address or token ID is undefined');
            }
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
interface MigrationRequest {
  migrationReqs: {
    zkevm_wallet_address: string;
    token_id: string;
  }[];
}

// New endpoint to create or upsert a list of migrations
fastify.post('/migrations', async (request: FastifyRequest<{ Body: MigrationRequest }>, reply) => {
    const { migrationReqs } = request.body;

    try {
      for (const migration of migrationReqs) {
        await migrations.insertMigration({
            x_collection_address: process.env.IMX_MONITORED_COLLECTION_ADDRESS!,
            zkevm_collection_address: process.env.ZKEVM_COLLECTION_ADDRESS!,
            zkevm_wallet_address: migration.zkevm_wallet_address,
            token_id: migration.token_id,
            status: 'pending'
        });
      }
      return reply.status(201).send({ message: 'Migrations created successfully' });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Error creating migrations' });
    }
});

fastify.get('/migrations', async (request, reply) => {
  try {
    const pendingMigrations = await migrations.getAllPendingMigrations(); // Adjust this method based on your persistence layer
    return reply.status(200).send(pendingMigrations);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Error retrieving migrations' });
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