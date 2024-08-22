import fastify from 'fastify';
import 'dotenv/config';
import { Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/config';

const server = fastify();

const orderbook = new Orderbook({
  baseConfig: {
    environment: process.env.IMMUTABLE_ENV as Environment,
  },
});

const packages: { [key: string]: any } = {
  orderbook,
};

// TODO: add validation
// TODO: correct typing
// TODO: json schema
// TODO: openapi schema
// TODO: newrelic
// TODO: no deployment of alpha package on flux commit
// TODO: env for production vs sandbox
server.post('/v1/ts-sdk/v1/:pkg/:method', async (request: any) => {
  const { pkg, method } = request.params;
  return await packages[pkg][method](request.body);
});

server.get('v1/heartbeat', async () => ({ status: 'ok' }));

server.listen({ port: 8080, host: '0.0.0.0' }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
