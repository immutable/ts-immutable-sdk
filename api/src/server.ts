import fastify from 'fastify';
import 'dotenv/config';
import { orderbook, config } from '@imtbl/sdk';

const server = fastify();

const ob = new orderbook.Orderbook({
  baseConfig: {
    environment: process.env.IMMUTABLE_ENV as config.Environment || config.Environment.SANDBOX,
  },
});

const packages: { [key: string]: any } = {
  orderbook: ob,
};

// TODO: add validation
// TODO: correct typing
// TODO: json schema
// TODO: openapi schema
// TODO: newrelic
// TODO: no deployment of alpha package on flux commit
// TODO: env for production vs sandbox
// TODO: write wrapper for methods. because date/time type are just strings from JSON body
server.post('/v1/ts-sdk/v1/:pkg/:method', async (request: any) => {
  const { pkg, method } = request.params;
  return await packages[pkg][method](...request.body);
});

server.get('/v1/heartbeat', async () => ({ status: 'ok' }));

server.listen({ port: 8080, host: '0.0.0.0' }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
