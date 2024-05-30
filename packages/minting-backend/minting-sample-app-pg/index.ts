import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { mintingBackend, config } from '@imtbl/sdk';
import { Pool } from 'pg';
import { v4 as uuidv4, stringify, parse } from 'uuid';

const fastify = Fastify({
  logger: true
});

// setup database client
const pgClient = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.DB_NAME || 'minting_backend',
  password: process.env.PG_PASSWORD || 'password',
  port: 5432,
});

// persistence setup for minting backend
const mintingPersistence = mintingBackend.mintingPersistencePg(pgClient);

const minting = new mintingBackend.MintingBackendModule({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    apiKey: process.env.IM_API_KEY,
  },
  persistence: mintingPersistence,
  logger: console,
});

interface MintRequest {
  mintTo: string;
}

// mint route
fastify.post('/mint', async (request: FastifyRequest<{ Body: MintRequest }>, reply: FastifyReply) => {
  const collectionAddress = process.env.COLLECTION_ADDRESS as string;
  const assetId = uuidv4();
  const assetIdBuffer = parse(assetId);
  const mintTo = request.body.mintTo;
  const metadata = {
    name: 'My NFT',
    description: 'This is my first NFT',
    image: 'https://placehold.co/600x400',
  };

  await minting.recordMint({
    asset_id: assetId,
    contract_address: collectionAddress,
    owner_address: mintTo,
    metadata,
    // amount: 5, // for 1155 only
    // token_id: Buffer.from(assetIdBuffer).readUint32BE(0).toString(10), // required for 1155 only. 721 can omit this.
  });
  reply.send({});
});

const url = "/api/process_webhook_event" // Set this url on the wbehook config screen in hub.immutable.com
fastify.post(url, async (request: FastifyRequest<any>, reply: any) => {
  await minting.processMint(request.body as any);
  reply.send({ status: "ok" });
});


/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })

    // long running process to submit minting requests
    await minting.submitMintingRequests({});

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start();