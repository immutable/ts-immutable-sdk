import 'cross-fetch/polyfill';
import { MockedRequest, RequestHandler, rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';
import { ChainName } from '../../network/chains';
import { RelayerTransactionRequest } from '../../zkEvm/relayerClient';
import { JsonRpcRequestPayload } from '../../zkEvm/types';
import { chainId, chainIdHex, mockUserZkEvm } from '../../test/mocks';

export const relayerId = '0x745';
export const transactionHash = '0x867';

const mandatoryHandlers = [
  rest.get('https://api.sandbox.immutable.com/v1/sdk/session-activity/check', async (req, res, ctx) => res(ctx.status(404))),
  rest.post('https://rpc.testnet.immutable.com', async (req, res, ctx) => {
    const body = await req.json<JsonRpcRequestPayload>();
    switch (body.method) {
      case 'eth_chainId': {
        return res(
          ctx.json({
            id: body.id,
            jsonrpc: '2.0',
            result: chainIdHex,
          }),
        );
      }
      default: {
        return undefined;
      }
    }
  }),
];

const chainName = `${encodeURIComponent(ChainName.IMTBL_ZKEVM_TESTNET)}`;
export const mswHandlers = {
  counterfactualAddress: {
    success: rest.post(
      `https://api.sandbox.immutable.com/v2/chains/${chainName}/passport/counterfactual-address`,
      (req, res, ctx) => res(
        ctx.status(201),
        ctx.json({
          counterfactual_address: mockUserZkEvm.zkEvm.ethAddress,
        }),
      ),
    ),
    internalServerError: rest.post(
      `https://api.sandbox.immutable.com/v2/chains/${chainName}/passport/counterfactual-address`,
      (req, res, ctx) => res(ctx.status(500)),
    ),
  },
  rpcProvider: {
    success: rest.post('https://rpc.testnet.immutable.com', async (req, res, ctx) => {
      const body = await req.json<JsonRpcRequestPayload>();
      switch (body.method) {
        case 'eth_call': {
          return res(
            ctx.json({
              id: body.id,
              jsonrpc: '2.0',
              result: '0x00000000000000000000000000000000000000000000000000000000000000b9',
            }),
          );
        }
        default: {
          return undefined;
        }
      }
    }),
  },
  relayer: {
    success: rest.post('https://api.sandbox.immutable.com/relayer-mr/v1/transactions', async (req, res, ctx) => {
      const body = await req.json<RelayerTransactionRequest>();
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
          return undefined;
        }
      }
    }),
  },
  guardian: {
    evaluateTransaction: {
      success: rest.post('https://api.sandbox.immutable.com/guardian/v1/transactions/evm/evaluate', (req, res, ctx) => res(ctx.status(200))),
    },
  },
  api: {
    chains: {
      success: rest.get('https://api.sandbox.immutable.com/v1/chains', async (req, res, ctx) => res(ctx.json({
        result: [
          {
            id: 'eip155:13473',
            name: 'Immutable zkEVM Test',
            rpc_url: 'https://rpc.testnet.immutable.com',
          },
        ],
      }))),
    },
  },
};

let mswWorker: SetupServer;
const getMswWorker = (): SetupServer => {
  if (!mswWorker) {
    mswWorker = setupServer();
    mswWorker.listen({
      onUnhandledRequest: (request: MockedRequest, print: { error: () => void }) => {
        // eslint-disable-next-line no-console
        console.error('Unexpected request', request.url.href, request.text());
        print.error();
      },
    });
  }
  return mswWorker;
};

export const resetMswHandlers = () => {
  getMswWorker().resetHandlers(...mandatoryHandlers);
};

export const useMswHandlers = (handlers: RequestHandler[]) => {
  getMswWorker().use(...mandatoryHandlers, ...handlers);
};

export const closeMswWorker = () => {
  getMswWorker().close();
};
