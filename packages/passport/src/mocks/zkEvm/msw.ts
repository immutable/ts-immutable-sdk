import 'cross-fetch/polyfill';
import { RequestHandler, rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';
import { RelayerTransactionRequest } from '../../zkEvm/relayerAdapter';
import { JsonRpcRequestPayload } from '../../zkEvm/types';

export const relayerId = '0x745';
export const chainId = '13372';
export const transactionHash = '0x867';

export const mswHandlers = {
  counterfactualAddress: {
    success: rest.post('https://passport-mr.sandbox.imtbl.com/v1/counterfactual-address', (req, res, ctx) => res(ctx.status(201))),
    internalServerError: rest.post('https://passport-mr.sandbox.imtbl.com/v1/counterfactual-address', (req, res, ctx) => res(ctx.status(500))),
  },
  jsonRpcProvider: {
    success: rest.post('https://zkevm-rpc.sandbox.x.immutable.com', (req, res, ctx) => {
      const body = req.body as JsonRpcRequestPayload;
      switch (body.method) {
        case 'eth_getCode': {
          return res(
            ctx.json({
              id: body.id,
              jsonrpc: '2.0',
              result: '0x',
            }),
          );
        }
        default: {
          return res(ctx.status(500));
        }
      }
    }),
  },
  relayer: {
    success: rest.post('https://relayer.sandbox.immutable.com/v1/transactions', (req, res, ctx) => { // TODO: ID-784 Update once we have added Relayer URL to config
      const body = req.body as RelayerTransactionRequest;
      switch (body.method) {
        case 'eth_sendTransaction': {
          return res(
            ctx.json({
              id: 1,
              jsonrpc: '2.0',
              result: relayerId,
            }),
          );
        }
        case 'im_getTransactionByHash': {
          return res(
            ctx.json({
              id: 1,
              jsonrpc: '2.0',
              result: {
                status: 'SUBMITTED',
                chainId,
                relayerId,
                hash: transactionHash,
              },
            }),
          );
        }
        case 'im_getFeeOptions': {
          return res(
            ctx.json({
              id: 1,
              jsonrpc: '2.0',
              result: [
                {
                  tokenPrice: '0x1dfd14000',
                  tokenSymbol: 'IMX',
                  tokenDecimals: 18,
                  tokenAddress: '0x123',
                  recipientAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                },
              ],
            }),
          );
        }
        default: {
          return res(ctx.status(500));
        }
      }
    }),
  },
};

let mswWorker: SetupServer;
const getMswWorker = (): SetupServer => {
  if (!mswWorker) {
    mswWorker = setupServer();
    mswWorker.listen({
      onUnhandledRequest: 'error',
    });
  }
  return mswWorker;
};

export const resetMswHandlers = () => {
  getMswWorker().resetHandlers();
};

export const useMswHandlers = (handlers: RequestHandler[]) => {
  getMswWorker().use(...handlers);
};

export const closeMswWorker = () => {
  getMswWorker().close();
};
