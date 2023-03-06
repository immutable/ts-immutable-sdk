import { configuration, SharedContext } from '../test/sharedContext';
import { UnsignedOrderRequest, OrdersApi, createStarkSigner } from "@imtbl/core-sdk";
import { parseEther } from '@ethersproject/units';
import { createOrder } from './orders';
import { Configuration } from '../../../config';

const sharedContext = new SharedContext();
const config = new Configuration(configuration);

jest.mock('@imtbl/core-sdk')
//const mockOrdersApi = jest.mocked(OrdersApi, {shallow:false });

describe('Orders', () => {
  let getSignableOrderMock: jest.Mock;
  let createOrderMock: jest.Mock;
  const orderResponse = {
    order_id: 0,
    request_id: "123456",
    status: "some-status",
    time: 0
  };

  beforeEach(() => {
    jest.restoreAllMocks()
    getSignableOrderMock = jest.fn().mockResolvedValue({
      data:{
        signable_message: "hello",
        payload_hash: "hash"
      }
    });
    createOrderMock = jest.fn().mockResolvedValue({
      data: orderResponse
    });
    (OrdersApi as jest.Mock).mockReturnValue({
      getSignableOrder: getSignableOrderMock,
      createOrder: createOrderMock,
    });
    (createStarkSigner as jest.Mock).mockReturnValue({
      signMessage: ()=>"Signed message"
    });
  })

  test('Correctly signs string', async () => {
    const request: UnsignedOrderRequest = {
      sell: {
        tokenAddress: "0x10",
        tokenId: "abc123",
        type: 'ERC721',
      },
      buy: {
        type: 'ETH',
        amount: parseEther("30000").toString(),
      },
      fees: [],
    };

    const signers = await sharedContext.getUserOneSigners()


    const createOrderResponse = await createOrder({
      signers,
      request,
      config,
    });
    console.log(createOrderResponse)
    console.log(orderResponse)

    expect(createOrderResponse).toEqual(orderResponse);

    // throw createOrderResponse
  })
})

// @binding([SharedContext])
// export class Order {
//   constructor(protected sharedContext: SharedContext) {}



//   @when(
//     '{string} creates sell order {string} of {string} NFT for sell for {string} eth',
//     undefined,
//     30000,
//   )
//   public async createNFTSellOrder(
//     makerVar: string,
//     orderVar: string,
//     assetVar: string,
//     amount: string,
//   ) {
//     try {
//       const seller = this.sharedContext.users[makerVar];
//       const token = this.sharedContext.nfts[assetVar];
//       const order: UnsignedOrderRequest = {
//         sell: {
//           tokenAddress: token.data.token_address,
//           tokenId: token.data.id,
//           type: 'ERC721',
//         },
//         buy: {
//           type: 'ETH',
//           amount: parseEther(amount).toString(),
//         },
//         fees: [],
//       };

//       const createOrderResponse = await createOrder({
//         signers: seller,
//         request: order,
//         config: this.config,
//       });

//       this.sharedContext.orders[orderVar] = {
//         ...order,
//         orderId: createOrderResponse.order_id,
//       };
//     } catch (err) {
//       console.log('err', err);
//       throw err;
//     }
//   }

//   @when('{string} cancels sell order {string}', undefined, 30000)
//   public async cancelNFTSellOrder(
//     sellerVar: string,
//     sellOrderVar: string,
//   ) {
//     const seller = this.sharedContext.users[sellerVar];
//     const order = this.sharedContext.orders[sellOrderVar];
//     await this.client.cancelOrder(seller, {
//       order_id: order.orderId,
//     });
//   }
// }
