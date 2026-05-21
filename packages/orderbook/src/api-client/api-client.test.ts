import {
  anything, capture, deepEqual, instance, mock, when,
} from 'ts-mockito';
import type { OrderComponents } from '../seaport/types';
import { ListingResult, MetadataBidResult, OrdersService } from '../openapi/sdk';
import { ItemType, OrderType } from '../seaport';
import { MetadataFieldFilter } from '../types';
import { ImmutableApiClient } from './api-client';

const seaportAddress = '0x123';

describe('ImmutableApiClient', () => {
  describe('getListing', () => {
    it('calls the OpenAPI client with the correct parameters', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const chainName = '123';
      const listingId = '456';

      when(
        mockedOpenAPIClient.getListing(deepEqual({ chainName, listingId })),
      ).thenReturn(
        Promise.resolve({
          result: { id: listingId, chain: { name: chainName } },
        } as ListingResult),
      );

      const orderResult = await new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        chainName,
        seaportAddress,
      ).getListing(listingId);
      expect(orderResult.result.id).toEqual(listingId);
      expect(orderResult.result.chain.name).toEqual(chainName);
    });
  });

  describe('createListing', () => {
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

        const createListingPromise = new ImmutableApiClient(
          instance(mockedOpenAPIClient),
          '123',
          seaportAddress,
        ).createListing({
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
          makerFees: [],
        });

        await expect(createListingPromise).rejects.toThrowError();
      });
    });

    describe('when an offer item is not an ERC721', () => {
      it('throws', async () => {
        const mockedOpenAPIClient = mock(OrdersService);

        const mockedOrderComponents = mock<OrderComponents>();
        const orderComponents = instance(mockedOrderComponents);
        orderComponents.offer = [
          {
            itemType: ItemType.ERC20,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '456',
            token: '0x123',
          },
        ];

        const createListingPromise = new ImmutableApiClient(
          instance(mockedOpenAPIClient),
          '123',
          seaportAddress,
        ).createListing({
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
          makerFees: [],
        });

        await expect(createListingPromise).rejects.toThrowError();
      });
    });

    describe('when consideration items are of different types', () => {
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
        ];
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

        const createListingPromise = new ImmutableApiClient(
          instance(mockedOpenAPIClient),
          '123',
          seaportAddress,
        ).createListing({
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
          makerFees: [],
        });

        await expect(createListingPromise).rejects.toThrowError();
      });
    });

    describe('when the order components are valid', () => {
      it('calls the OpenAPI client with the correct parameters', async () => {
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
        ];
        orderComponents.consideration = [
          {
            itemType: ItemType.NATIVE,
            endAmount: '1',
            startAmount: '1',
            identifierOrCriteria: '0',
            token: '0x',
            recipient: '0x123',
          },
        ];
        orderComponents.orderType = OrderType.FULL_RESTRICTED;
        orderComponents.endTime = new Date().getTime() / 1000;
        orderComponents.startTime = new Date().getTime() / 1000;

        const chainName = '123';
        const orderId = '456';

        when(mockedOpenAPIClient.createListing(anything())).thenReturn(
          Promise.resolve({
            result: { id: orderId, chain: { name: chainName } },
          } as ListingResult),
        );

        const orderResult = await new ImmutableApiClient(
          instance(mockedOpenAPIClient),
          '123',
          seaportAddress,
        ).createListing({
          orderComponents,
          orderHash: '0x123',
          orderSignature: '0x123',
          makerFees: [],
        });

        expect(orderResult.result.id).toEqual(orderId);
        expect(orderResult.result.chain.name).toEqual(chainName);
      });
    });
  });

  describe('createMetadataBid', () => {
    const validOrderComponents = (): OrderComponents => {
      const mockedOrderComponents = mock<OrderComponents>();
      const orderComponents = instance(mockedOrderComponents);
      orderComponents.offerer = '0xMaker';
      orderComponents.zone = '0xZone';
      orderComponents.salt = '12345';
      orderComponents.counter = BigInt(1);
      orderComponents.orderType = OrderType.FULL_RESTRICTED;
      orderComponents.endTime = new Date().getTime() / 1000;
      orderComponents.startTime = new Date().getTime() / 1000;
      orderComponents.offer = [
        {
          itemType: ItemType.ERC20,
          endAmount: '1',
          startAmount: '1',
          identifierOrCriteria: '0',
          token: '0xERC20',
        },
      ];
      orderComponents.consideration = [
        {
          itemType: ItemType.ERC721_WITH_CRITERIA,
          endAmount: '1',
          startAmount: '1',
          identifierOrCriteria: '0',
          token: '0xCollection',
          recipient: '0xMaker',
        },
      ];
      return orderComponents;
    };

    it('rejects when neither metadataId nor metadataCriteria is provided', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      await expect(
        client.createMetadataBid({
          orderComponents: validOrderComponents(),
          orderHash: '0xHash',
          orderSignature: '0xSig',
          makerFees: [],
        } as never),
      ).rejects.toThrow('Exactly one of metadataId or metadataCriteria must be provided');
    });

    it('rejects when both metadataId and metadataCriteria are provided', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      await expect(
        client.createMetadataBid({
          orderComponents: validOrderComponents(),
          orderHash: '0xHash',
          orderSignature: '0xSig',
          makerFees: [],
          metadataId: 'abc',
          metadataCriteria: [{ fieldName: 'name', values: ['Foo'] }],
        } as never),
      ).rejects.toThrow('Exactly one of metadataId or metadataCriteria must be provided, not both');
    });

    it('rejects an unknown top-level metadata field', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      const badCriteria = [{ fieldName: 'rarity', values: ['Legendary'] }] as unknown as MetadataFieldFilter[];

      await expect(
        client.createMetadataBid({
          orderComponents: validOrderComponents(),
          orderHash: '0xHash',
          orderSignature: '0xSig',
          makerFees: [],
          metadataCriteria: badCriteria,
        }),
      ).rejects.toThrow(/metadataCriteria fieldName "rarity" must be one of/);
    });

    it('rejects duplicate criteria field names', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      await expect(
        client.createMetadataBid({
          orderComponents: validOrderComponents(),
          orderHash: '0xHash',
          orderSignature: '0xSig',
          makerFees: [],
          metadataCriteria: [
            { fieldName: 'name', values: ['Foo'] },
            { fieldName: 'name', values: ['Bar'] },
          ],
        }),
      ).rejects.toThrow(/duplicate fieldName "name"/);
    });

    it('rejects an attribute filter with empty trait_type', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      const badCriteria = [{ fieldName: 'attribute:', values: ['Blue'] }] as unknown as MetadataFieldFilter[];

      await expect(
        client.createMetadataBid({
          orderComponents: validOrderComponents(),
          orderHash: '0xHash',
          orderSignature: '0xSig',
          makerFees: [],
          metadataCriteria: badCriteria,
        }),
      ).rejects.toThrow(/metadataCriteria fieldName "attribute:" must be one of/);
    });

    it('sends metadata_id and omits metadata_criteria when metadataId is provided', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      when(mockedOpenAPIClient.createMetadataBid(anything())).thenReturn(
        Promise.resolve({ result: { id: 'mb1', chain: { name: '123' } } } as MetadataBidResult),
      );

      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      await client.createMetadataBid({
        orderComponents: validOrderComponents(),
        orderHash: '0xHash',
        orderSignature: '0xSig',
        makerFees: [],
        metadataId: '018792c9-4ad7-8ec4-4038-9e05c598534b',
      });

      const [arg] = capture(mockedOpenAPIClient.createMetadataBid).last();
      expect(arg.requestBody.metadata_id).toBe('018792c9-4ad7-8ec4-4038-9e05c598534b');
      expect(arg.requestBody.metadata_criteria).toBeUndefined();
    });

    it('sends metadata_criteria and omits metadata_id when metadataCriteria is provided', async () => {
      const mockedOpenAPIClient = mock(OrdersService);
      when(mockedOpenAPIClient.createMetadataBid(anything())).thenReturn(
        Promise.resolve({ result: { id: 'mb1', chain: { name: '123' } } } as MetadataBidResult),
      );

      const client = new ImmutableApiClient(
        instance(mockedOpenAPIClient),
        '123',
        seaportAddress,
      );

      await client.createMetadataBid({
        orderComponents: validOrderComponents(),
        orderHash: '0xHash',
        orderSignature: '0xSig',
        makerFees: [],
        metadataCriteria: [
          { fieldName: 'name', values: ['Cool Dragon'] },
          { fieldName: 'attribute:Background', values: ['Blue', 'Red'] },
        ],
      });

      const [arg] = capture(mockedOpenAPIClient.createMetadataBid).last();
      expect(arg.requestBody.metadata_id).toBeUndefined();
      expect(arg.requestBody.metadata_criteria).toEqual([
        { field_name: 'name', values: ['Cool Dragon'] },
        { field_name: 'attribute:Background', values: ['Blue', 'Red'] },
      ]);
    });
  });
});
