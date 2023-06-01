import {
  mock, when, instance, deepEqual, anything,
} from 'ts-mockito';
import { OrderResult, OrdersService } from 'openapi/sdk';
import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { ItemType } from '../seaport';
import { ImmutableApiClient } from './api-client';

describe('ImmutableApiClient', () => {
  describe('getOrder', () => {
    it('calls the OpenAPI client with the correct parameters', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const chainId = '123';
      const orderId = '456';

      when(mockedOpenAPIClient.getOrder(deepEqual({ chainId, orderId })))
        .thenReturn(Promise.resolve({ result: { id: orderId, chain_id: chainId } } as OrderResult));

      const orderResult = await new ImmutableApiClient(instance(mockedOpenAPIClient), chainId)
        .getOrder(orderId);
      expect(orderResult.result.id).toEqual(orderId);
      expect(orderResult.result.chain_id).toEqual(chainId);
    });
  });

  describe('createOrder', () => {
    describe('when there are multiple offer items', () => {
      it('throws', async () => {
        const mockedOpenAPIClient = mock(OrdersService);

        const mockedOrderComponents = mock<OrderComponents>();
        const orderComponents = instance(mockedOrderComponents);
        orderComponents.offer = [
          {
            itemType: ItemType.ERC721,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
          },
          {
            itemType: ItemType.ERC721,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
          },
        ];

        const createOrderPromise = new ImmutableApiClient(instance(mockedOpenAPIClient), '123').createOrder({
          offerer: '0x123',
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
        });

        await expect(createOrderPromise).rejects.toThrowError();
      });
    });

    describe('when an offer item is not an ERC721', () => {
      it('throws', async () => {
        const mockedOpenAPIClient = mock(OrdersService);

        const mockedOrderComponents = mock<OrderComponents>();
        const orderComponents = instance(mockedOrderComponents);
        orderComponents.offer = [{
          itemType: ItemType.ERC20,
          endAmount: '1',
          startAmount: '1',
          identifierOrCriteria: '456',
          token: '0x123',
        }];

        const createOrderPromise = new ImmutableApiClient(instance(mockedOpenAPIClient), '123').createOrder({
          offerer: '0x123',
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
        });

        await expect(createOrderPromise).rejects.toThrowError();
      });
    });

    describe('when consideration items are of different types', () => {
      it('throws', async () => {
        const mockedOpenAPIClient = mock(OrdersService);

        const mockedOrderComponents = mock<OrderComponents>();
        const orderComponents = instance(mockedOrderComponents);
        orderComponents.offer = [{
          itemType: ItemType.ERC721,
          endAmount: '1',
          startAmount: '1',
          identifierOrCriteria: '456',
          token: '0x123',
        }];
        orderComponents.consideration = [
          {
            itemType: ItemType.NATIVE,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
            recipient: '0x123',
          },
          {
            itemType: ItemType.ERC20,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
            recipient: '0x123',
          },
        ];

        const createOrderPromise = new ImmutableApiClient(instance(mockedOpenAPIClient), '123').createOrder({
          offerer: '0x123',
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
        });

        await expect(createOrderPromise).rejects.toThrowError();
      });
    });

    describe('when the order components are valid', () => {
      it('calls the OpenAPI client with the correct parameters', async () => {
        const mockedOpenAPIClient = mock(OrdersService);

        const mockedOrderComponents = mock<OrderComponents>();
        const orderComponents = instance(mockedOrderComponents);
        orderComponents.offer = [{
          itemType: ItemType.ERC721,
          endAmount: '1',
          startAmount: '1',
          identifierOrCriteria: '456',
          token: '0x123',
        }];
        orderComponents.consideration = [
          {
            itemType: ItemType.NATIVE,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
            recipient: '0x123',
          },
          {
            itemType: ItemType.NATIVE,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
            recipient: '0x123',
          },
        ];
        orderComponents.endTime = new Date().getTime() / 1000;
        orderComponents.startTime = new Date().getTime() / 1000;

        const chainId = '123';
        const orderId = '456';

        when(mockedOpenAPIClient.createOrder(anything()))
          .thenReturn(Promise.resolve({
            result: { id: orderId, chain_id: chainId },
          } as OrderResult));

        const orderResult = await new ImmutableApiClient(instance(mockedOpenAPIClient), '123').createOrder({
          offerer: '0x123',
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
        });

        expect(orderResult.result.id).toEqual(orderId);
        expect(orderResult.result.chain_id).toEqual(chainId);
      });
    });
  });
});
