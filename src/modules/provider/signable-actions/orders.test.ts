import { configuration, SharedContext } from '../test/sharedContext';
import { UnsignedOrderRequest, OrdersApi } from "@imtbl/core-sdk";
import { parseEther } from '@ethersproject/units';
import { createOrder } from './orders';
import { Configuration } from '../../../config';

const sharedContext = new SharedContext();
const config = new Configuration(configuration);

jest.mock('@imtbl/core-sdk')

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
    expect(createOrderMock).toHaveBeenCalledWith()
    expect(createOrderResponse).toEqual(orderResponse);
  })
})

