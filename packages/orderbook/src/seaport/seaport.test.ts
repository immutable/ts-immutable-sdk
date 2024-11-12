import {
  anything, deepEqual, instance, mock, when,
} from 'ts-mockito';
import type { TransactionMethods } from '@opensea/seaport-js/lib/utils/usecase';
import { Seaport as SeaportLib } from '@opensea/seaport-js';
import type {
  ApprovalAction,
  ConsiderationItem,
  CreateOrderAction,
  ExchangeAction,
  OfferItem,
  OrderComponents,
} from '@opensea/seaport-js/lib/types';
import {
  ContractTransaction, JsonRpcProvider, toBeHex, ZeroAddress, ZeroHash,
} from 'ethers';
import {
  ActionType,
  TransactionAction,
  ERC20Item,
  ERC721Item,
  NativeItem,
  SignableAction,
  TransactionPurpose,
} from '../types';
import { ProtocolData, Order, OrderStatusName } from '../openapi/sdk';
import {
  EIP_712_ORDER_TYPE,
  ItemType,
  OrderType,
  SEAPORT_CONTRACT_NAME,
  SEAPORT_CONTRACT_VERSION_V1_5,
} from './constants';
import { Seaport } from './seaport';
import { SeaportLibFactory } from './seaport-lib-factory';

const fakeExtraData = '0x0000000000000000000000000000000000000000000000000064ec2faca1186bef338313426612ad6ed494b50e5ddc65ad4e6067df53d6625f921b22156ac9435d4fd946bc5f07859ecd7aca94f87da703b9204f9c09f0089be18d5c268a5f36c80c779ed3cbf6ed54b7c7bf2991a4b11065b01c1a2594619f1a0d49f9';

// Make an address-like string for tests
function randomAddress() {
  return `0x${Math.random().toString(16).substr(2)}`;
}

describe('Seaport', () => {
  describe('prepareSeaportOrder', () => {
    describe('when there is no approval action', () => {
      let sut: Seaport;

      const network = 1;

      const zoneAddress = randomAddress();
      const seaportContractAddress = randomAddress();
      const offerer = randomAddress();
      const listingItem: ERC721Item = {
        contractAddress: randomAddress(),
        tokenId: '5',
        type: 'ERC721',
      };

      const considerationItem: ERC20Item = {
        amount: '100',
        contractAddress: randomAddress(),
        type: 'ERC20',
      };

      const orderStart = new Date();
      const orderExpiry = new Date();
      const orderHash = randomAddress();

      const orderComponents: OrderComponents = {
        orderType: OrderType.FULL_RESTRICTED,
        offerer,
        offer: [
          {
            itemType: ItemType.ERC721,
            token: listingItem.contractAddress,
            identifierOrCriteria: listingItem.tokenId,
            startAmount: '1',
            endAmount: '1',
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC20,
            token: considerationItem.contractAddress,
            identifierOrCriteria: '0',
            startAmount: considerationItem.amount,
            endAmount: considerationItem.amount,
            recipient: offerer,
          },
        ],
        startTime: (orderStart.getTime() / 1000).toFixed(0),
        endTime: (orderExpiry.getTime() / 1000).toFixed(0),
        salt: toBeHex(BigInt('123')),
        counter: 0,
        zone: zoneAddress,
        zoneHash: ZeroHash,
        conduitKey: ZeroHash,
        totalOriginalConsiderationItems: 1,
      };

      const orderComponentsMessage: Omit<OrderComponents, 'orderType' | 'offer' | 'consideration'> & {
        orderType: string;
        offer: (Omit<OfferItem, 'itemType'> & { itemType: string })[];
        consideration: (Omit<ConsiderationItem, 'itemType'> & { itemType: string })[];
      } = {
        ...orderComponents,
        orderType: OrderType.FULL_RESTRICTED.toString(),
        offer: [
          {
            itemType: ItemType.ERC721.toString(),
            token: listingItem.contractAddress,
            identifierOrCriteria: listingItem.tokenId,
            startAmount: '1',
            endAmount: '1',
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC20.toString(),
            token: considerationItem.contractAddress,
            identifierOrCriteria: '0',
            startAmount: considerationItem.amount,
            endAmount: considerationItem.amount,
            recipient: offerer,
          },
        ],
      };

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedSeaportLibFactory = mock(SeaportLibFactory);
        const mockedProvider = mock(JsonRpcProvider);

        const createAction = mock<CreateOrderAction>();
        const createActionInstance = instance(createAction);
        createActionInstance.type = 'create';

        when(mockedProvider.getNetwork()).thenReturn(
          Promise.resolve({ chainId: network, name: 'foobar' }) as any,
        );
        when(mockedSeaportLibFactory.create(anything())).thenReturn(
          instance(mockedSeaportJs),
        );
        when(
          mockedSeaportJs.getOrderHash(deepEqual(orderComponents)),
        ).thenReturn(orderHash);
        when(createAction.getMessageToSign()).thenReturn(
          Promise.resolve(JSON.stringify({ message: orderComponentsMessage })),
        );
        when(
          mockedSeaportJs.createOrder(
            deepEqual({
              allowPartialFills: false,
              offer: [
                {
                  itemType: ItemType.ERC721,
                  token: listingItem.contractAddress,
                  identifier: listingItem.tokenId,
                },
              ],
              consideration: [
                {
                  token: considerationItem.contractAddress,
                  amount: considerationItem.amount,
                  recipient: offerer,
                },
              ],
              startTime: (orderStart.getTime() / 1000).toFixed(0),
              endTime: (orderExpiry.getTime() / 1000).toFixed(0),
              zone: zoneAddress,
              restrictedByZone: true,
            }),
            offerer,
          ),
        ).thenReturn(
          Promise.resolve({
            actions: [createActionInstance],
            executeAllActions: () => undefined as any,
          }),
        );

        sut = new Seaport(
          instance(mockedSeaportLibFactory),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns unsignedApprovalTransaction as undefined', async () => {
        const { actions } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        const approvalAction = actions.find(
          (a): a is TransactionAction => a.type === ActionType.TRANSACTION,
        );
        expect(approvalAction).toBeUndefined();
      });

      it('returns the expected typedOrderMessageForSigning', async () => {
        const { actions } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        const domainData = {
          name: SEAPORT_CONTRACT_NAME,
          version: SEAPORT_CONTRACT_VERSION_V1_5,
          chainId: network,
          verifyingContract: seaportContractAddress,
        };

        const signableAction = actions.find(
          (a): a is SignableAction => a.type === ActionType.SIGNABLE,
        )!;
        expect(signableAction.message).toEqual({
          domain: domainData,
          types: EIP_712_ORDER_TYPE,
          value: orderComponents,
        });
      });

      it('returns the expected orderComponents', async () => {
        const { orderComponents: orderComponentsRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        expect(orderComponentsRes).toEqual(orderComponents);
      });

      it('returns the expected order hash', async () => {
        const { orderHash: orderHashRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        expect(orderHashRes).toEqual(orderHash);
      });
    });

    describe('when there is an approval action', () => {
      let sut: Seaport;

      const network = 1;

      const zoneAddress = randomAddress();
      const seaportContractAddress = randomAddress();
      const offerer = randomAddress();
      const listingItem: ERC721Item = {
        contractAddress: randomAddress(),
        tokenId: '5',
        type: 'ERC721',
      };

      const considerationItem: NativeItem = {
        amount: '100',
        type: 'NATIVE',
      };

      const orderStart = new Date();
      const orderExpiry = new Date();
      const orderHash = randomAddress();

      const orderComponents: OrderComponents = {
        orderType: OrderType.FULL_RESTRICTED,
        offerer,
        offer: [
          {
            itemType: ItemType.ERC721,
            token: listingItem.contractAddress,
            identifierOrCriteria: listingItem.tokenId,
            startAmount: '1',
            endAmount: '1',
          },
        ],
        consideration: [
          {
            itemType: ItemType.NATIVE,
            token: ZeroAddress,
            identifierOrCriteria: '0',
            startAmount: considerationItem.amount,
            endAmount: considerationItem.amount,
            recipient: offerer,
          },
        ],
        startTime: (orderStart.getTime() / 1000).toFixed(0),
        endTime: (orderExpiry.getTime() / 1000).toFixed(0),
        salt: toBeHex(BigInt('123')),
        counter: 0,
        zone: zoneAddress,
        zoneHash: ZeroHash,
        conduitKey: ZeroHash,
        totalOriginalConsiderationItems: 1,
      };

      const orderComponentsMessage: Omit<OrderComponents, 'orderType' | 'offer' | 'consideration'> & {
        orderType: string;
        offer: (Omit<OfferItem, 'itemType'> & { itemType: string })[];
        consideration: (Omit<ConsiderationItem, 'itemType'> & { itemType: string })[];
      } = {
        ...orderComponents,
        orderType: OrderType.FULL_RESTRICTED.toString(),
        offer: [
          {
            itemType: ItemType.ERC721.toString(),
            token: listingItem.contractAddress,
            identifierOrCriteria: listingItem.tokenId,
            startAmount: '1',
            endAmount: '1',
          },
        ],
        consideration: [
          {
            itemType: ItemType.NATIVE.toString(),
            token: ZeroAddress,
            identifierOrCriteria: '0',
            startAmount: considerationItem.amount,
            endAmount: considerationItem.amount,
            recipient: offerer,
          },
        ],
      };

      const approvalGas = BigInt(1000000);
      const approvalTransaction: ContractTransaction = {
        from: offerer,
        to: seaportContractAddress,
        data: '',
      };

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedSeaportLibFactory = mock(SeaportLibFactory);
        const mockedProvider = mock(JsonRpcProvider);

        const createAction = mock<CreateOrderAction>();
        const createActionInstance = instance(createAction);
        createActionInstance.type = 'create';
        when(createAction.getMessageToSign()).thenReturn(
          Promise.resolve(JSON.stringify({ message: orderComponentsMessage })),
        );

        const transactionMethods = mock<TransactionMethods<any>>();
        const approvalAction = mock<ApprovalAction>();
        const approvalActionInstance = instance(approvalAction);
        approvalActionInstance.type = 'approval';
        approvalActionInstance.transactionMethods = instance(transactionMethods);
        when(transactionMethods.buildTransaction()).thenReturn(
          Promise.resolve(approvalTransaction),
        );
        when(transactionMethods.estimateGas()).thenReturn(Promise.resolve(approvalGas));

        when(mockedProvider.getNetwork()).thenReturn(
          Promise.resolve({ chainId: network, name: 'foobar' }) as any,
        );
        when(mockedSeaportLibFactory.create(anything())).thenReturn(
          instance(mockedSeaportJs),
        );
        when(
          mockedSeaportJs.getOrderHash(deepEqual(orderComponents)),
        ).thenReturn(orderHash);
        when(
          mockedSeaportJs.createOrder(
            deepEqual({
              allowPartialFills: false,
              offer: [
                {
                  itemType: ItemType.ERC721,
                  token: listingItem.contractAddress,
                  identifier: listingItem.tokenId,
                },
              ],
              consideration: [
                {
                  amount: considerationItem.amount,
                  recipient: offerer,
                },
              ],
              startTime: (orderStart.getTime() / 1000).toFixed(0),
              endTime: (orderExpiry.getTime() / 1000).toFixed(0),
              zone: zoneAddress,
              restrictedByZone: true,
            }),
            offerer,
          ),
        ).thenReturn(
          Promise.resolve({
            actions: [approvalActionInstance, createActionInstance],
            executeAllActions: () => undefined as any,
          }),
        );

        sut = new Seaport(
          instance(mockedSeaportLibFactory),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns the expected unsignedApprovalTransaction', async () => {
        const { actions } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        const approvalAction = actions.find(
          (a): a is TransactionAction => a.type === ActionType.TRANSACTION,
        )!;
        expect(approvalAction.purpose).toEqual(TransactionPurpose.APPROVAL);
        const unsignedApprovalTransaction = await approvalAction.buildTransaction();
        expect(unsignedApprovalTransaction!.from).toEqual(approvalTransaction.from);
        expect(unsignedApprovalTransaction!.to).toEqual(approvalTransaction.to);

        const approvalGasAsBigNumber = BigInt(approvalGas);
        const expectedGasLimit = approvalGasAsBigNumber + (approvalGasAsBigNumber / BigInt(5));
        expect(unsignedApprovalTransaction!.gasLimit).toEqual(expectedGasLimit);
      });

      it('returns the expected typedOrderMessageForSigning', async () => {
        const { actions } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        const domainData = {
          name: SEAPORT_CONTRACT_NAME,
          version: SEAPORT_CONTRACT_VERSION_V1_5,
          chainId: network,
          verifyingContract: seaportContractAddress,
        };

        const signableAction = actions.find(
          (a): a is SignableAction => a.type === ActionType.SIGNABLE,
        )!;

        expect(signableAction.message).toEqual({
          domain: domainData,
          types: EIP_712_ORDER_TYPE,
          value: orderComponents,
        });
      });

      it('returns the expected orderComponents', async () => {
        const { orderComponents: orderComponentsRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        expect(orderComponentsRes).toEqual(orderComponents);
      });

      it('returns the expected order hash', async () => {
        const { orderHash: orderHashRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          false,
          orderStart,
          orderExpiry,
        );
        expect(orderHashRes).toEqual(orderHash);
      });
    });
  });

  describe('fulfilOrder', () => {
    describe('when there is an approval action', () => {
      let sut: Seaport;

      const zoneAddress = randomAddress();
      const seaportContractAddress = randomAddress();
      const offerer = randomAddress();
      const fulfiller = randomAddress();

      const approvalGas = BigInt(1000000);
      const approvalTransaction: ContractTransaction = {
        from: offerer,
        to: seaportContractAddress,
        data: '',
      };

      const fulfilGas = BigInt(2000000);
      const fulfilTransaction: ContractTransaction = {
        from: offerer,
        to: seaportContractAddress,
        data: '',
      };

      const immutableOrder: Order = {
        type: Order.type.LISTING,
        account_address: offerer,
        buy: [{ type: 'NATIVE', amount: '100' }],
        fees: [],
        chain: { id: '1', name: 'imtbl-zkevm-local' },
        created_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        fill_status: { numerator: '0', denominator: '0' },
        id: '1',
        order_hash: randomAddress(),
        protocol_data: {
          order_type: ProtocolData.order_type.FULL_RESTRICTED,
          zone_address: randomAddress(),
          seaport_address: randomAddress(),
          seaport_version: SEAPORT_CONTRACT_VERSION_V1_5,
          counter: '0',
        },
        salt: '1',
        sell: [
          {
            type: 'ERC721',
            contract_address: randomAddress(),
            token_id: '1',
          },
        ],
        signature: randomAddress(),
        status: { name: OrderStatusName.ACTIVE },
        start_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedSeaportLibFactory = mock(SeaportLibFactory);
        const mockedProvider = mock(JsonRpcProvider);
        when(mockedProvider.getNetwork()).thenReturn(
          Promise.resolve({
            chainId: 0,
          } as any),
        );

        const exchangeTransactionMethods = mock<TransactionMethods<any>>();
        const exchangeAction = mock<ExchangeAction<any>>();
        const exchangeActionInstance = instance(exchangeAction);
        exchangeActionInstance.type = 'exchange';
        exchangeActionInstance.transactionMethods = instance(exchangeTransactionMethods);
        when(exchangeTransactionMethods.buildTransaction()).thenReturn(
          Promise.resolve(fulfilTransaction),
        );
        when(exchangeTransactionMethods.estimateGas()).thenReturn(Promise.resolve(fulfilGas));

        const approvalTransactionMethods = mock<TransactionMethods<any>>();
        const approvalAction = mock<ApprovalAction>();
        const approvalActionInstance = instance(approvalAction);
        approvalActionInstance.type = 'approval';
        approvalActionInstance.transactionMethods = instance(approvalTransactionMethods);
        when(approvalTransactionMethods.buildTransaction()).thenReturn(
          Promise.resolve(approvalTransaction),
        );
        when(approvalTransactionMethods.estimateGas()).thenReturn(Promise.resolve(approvalGas));

        when(mockedSeaportLibFactory.create(anything())).thenReturn(
          instance(mockedSeaportJs),
        );
        when(
          mockedSeaportJs.fulfillOrders(
            deepEqual({
              accountAddress: fulfiller,
              fulfillOrderDetails: [
                {
                  order: {
                    parameters: anything(),
                    signature: immutableOrder.signature,
                  },
                  unitsToFill: undefined,
                  extraData: fakeExtraData,
                  tips: [],
                },
              ],
            }),
          ),
        ).thenReturn(
          Promise.resolve({
            actions: [approvalActionInstance, exchangeActionInstance],
            executeAllActions: () => undefined as never,
          } as any),
        );

        when(mockedSeaportJs.getCounter(offerer)).thenReturn(Promise.resolve(BigInt(1)));

        sut = new Seaport(
          instance(mockedSeaportLibFactory),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns correctly decoded expiration time', async () => {
        const { expiration } = await sut.fulfillOrder(immutableOrder, fulfiller, fakeExtraData);
        // Generated extra data and generated correct timestamp
        expect(expiration).toEqual('2023-08-28T05:25:00.000Z');
      });

      it('returns the expected unsignedApprovalTransaction', async () => {
        const { actions } = await sut.fulfillOrder(immutableOrder, fulfiller, fakeExtraData);
        const approvalAction = actions.find(
          (a): a is TransactionAction => a.purpose === TransactionPurpose.APPROVAL,
        );
        expect(approvalAction).toBeTruthy();
        const unsignedApprovalTransaction = await approvalAction!.buildTransaction();
        expect(unsignedApprovalTransaction!.from).toEqual(fulfiller);
        expect(unsignedApprovalTransaction!.to).toEqual(approvalTransaction.to);

        const approvalGasAsBigNumber = BigInt(approvalGas);
        const expectedGasLimit = approvalGasAsBigNumber + (approvalGasAsBigNumber / BigInt(5));
        expect(unsignedApprovalTransaction!.gasLimit).toEqual(expectedGasLimit);
      });

      it('returns the expected unsignedFulfillmentTransaction', async () => {
        const { actions } = await sut.fulfillOrder(immutableOrder, fulfiller, fakeExtraData);
        const fulfillmentAction = actions.find(
          (a): a is TransactionAction => a.purpose === TransactionPurpose.FULFILL_ORDER,
        );
        const unsignedFulfillmentTransaction = await fulfillmentAction!.buildTransaction();
        expect(unsignedFulfillmentTransaction).toBeTruthy();
        expect(unsignedFulfillmentTransaction!.from).toEqual(fulfiller);
        expect(unsignedFulfillmentTransaction!.to).toEqual(approvalTransaction.to);

        const fulfilGasAsBigNumber = BigInt(fulfilGas);
        const expectedGasLimit = fulfilGasAsBigNumber + (fulfilGasAsBigNumber / BigInt(5));
        expect(unsignedFulfillmentTransaction!.gasLimit).toEqual(expectedGasLimit);
      });
    });
  });
});
