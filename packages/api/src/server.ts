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

const packages = {
  orderbook,
};

// TODO: add validation
server.post('/:pkg/:method', async (request) => {
  console.log(request.body);
  const { pkg, method } = request.params;
  // const listing = await orderbook.prepareListing(request.body);
  // return listing;
  return await packages[pkg][method](request.body);
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
