import {
  mock, when, deepEqual, instance, anything,
} from 'ts-mockito';
import { Seaport as SeaportLib } from '@opensea/seaport-js';
import {
  ApprovalAction, CreateOrderAction, ExchangeAction, OrderComponents, TransactionMethods,
} from '@opensea/seaport-js/lib/types';
import {
  ERC20Item, ERC721Item, NativeItem, RoyaltyInfo,
} from 'types';
import {
  BigNumber, PopulatedTransaction, providers,
} from 'ethers';
import {
  BuyItem, Order, CreateOrderProtocolData, SellItem, OrderStatus,
} from 'openapi/sdk';
import {
  EIP_712_ORDER_TYPE, ItemType, SEAPORT_CONTRACT_NAME, SEAPORT_CONTRACT_VERSION_V1_4,
} from './constants';
import { Seaport } from './seaport';

// Make an address-like string for tests
function randomAddress() {
  return `0x${Math.random().toString(16).substr(2)}`;
}

describe('Seaport', () => {
  describe('prepareSeaportOrder', () => {
    describe('when there is no approval action', () => {
      let sut: Seaport;

      const network = 1;
      const orderComponents = { salt: '123' } as OrderComponents;
      // Salt is encoded as hex from original order components, so use this
      // to compare against the expected order components
      const orderComponentsWithHexSalt = {
        salt: BigNumber.from(orderComponents.salt).toHexString(),
      };

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

      const royaltyInfo: RoyaltyInfo = {
        amountRequired: '10',
        recipient: randomAddress(),
      };

      const orderStart = new Date();
      const orderExpiry = new Date();
      const orderHash = randomAddress();

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedProvider = mock(providers.JsonRpcProvider);

        const createAction = mock<CreateOrderAction>();
        const createActionInstance = instance(createAction);
        createActionInstance.type = 'create';

        when(mockedProvider.getNetwork()).thenReturn(Promise.resolve({ chainId: network, name: 'foobar' }));
        when(mockedSeaportJs.getOrderHash(deepEqual(orderComponentsWithHexSalt as OrderComponents)))
          .thenReturn(orderHash);
        when(createAction.getMessageToSign())
          .thenReturn(Promise.resolve(JSON.stringify({ message: orderComponents })));
        when(mockedSeaportJs.createOrder(deepEqual({
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
            {
              token: considerationItem.contractAddress,
              amount: royaltyInfo.amountRequired,
              recipient: royaltyInfo.recipient,
            },
          ],
          startTime: (orderStart.getTime() / 1000).toFixed(0),
          endTime: (orderExpiry.getTime() / 1000).toFixed(0),
          zone: zoneAddress,
          restrictedByZone: true,
        }), offerer)).thenReturn(
          Promise.resolve({
            actions: [createActionInstance],
            executeAllActions: () => undefined as any,
          }),
        );

        sut = new Seaport(
          instance(mockedSeaportJs),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns unsignedApprovalTransaction as undefined', async () => {
        const { unsignedApprovalTransaction } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        expect(unsignedApprovalTransaction).toBeUndefined();
      });

      it('returns the expected typedOrderMessageForSigning', async () => {
        const { typedOrderMessageForSigning } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        const domainData = {
          name: SEAPORT_CONTRACT_NAME,
          version: SEAPORT_CONTRACT_VERSION_V1_4,
          chainId: network,
          verifyingContract: seaportContractAddress,
        };

        expect(typedOrderMessageForSigning).toEqual({
          domain: domainData,
          types: EIP_712_ORDER_TYPE,
          value: orderComponentsWithHexSalt,
        });
      });

      it('returns the expected orderComponents', async () => {
        const { orderComponents: orderComponentsRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        expect(orderComponentsRes).toEqual(orderComponentsWithHexSalt);
      });

      it('returns the expected order hash', async () => {
        const { orderHash: orderHashRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        expect(orderHashRes).toEqual(orderHash);
      });
    });

    describe('when there is an approval action', () => {
      let sut: Seaport;

      const network = 1;
      const orderComponents = { salt: '123' } as OrderComponents;
      // Salt is encoded as hex from original order components, so use this
      // to compare against the expected order components
      const orderComponentsWithHexSalt = {
        salt: BigNumber.from(orderComponents.salt).toHexString(),
      };

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
        type: 'IMX',
      };

      const royaltyInfo: RoyaltyInfo = {
        amountRequired: '20',
        recipient: randomAddress(),
      };

      const orderStart = new Date();
      const orderExpiry = new Date();
      const orderHash = randomAddress();
      const approvalGas = BigNumber.from(1000000);
      const approvalTransaction: PopulatedTransaction = {
        from: offerer,
        to: seaportContractAddress,
      };

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedProvider = mock(providers.JsonRpcProvider);

        const createAction = mock<CreateOrderAction>();
        const createActionInstance = instance(createAction);
        createActionInstance.type = 'create';
        when(createAction.getMessageToSign())
          .thenReturn(Promise.resolve(JSON.stringify({ message: orderComponents })));

        const transactionMethods = mock<TransactionMethods<boolean>>();
        const approvalAction = mock<ApprovalAction>();
        const approvalActionInstance = instance(approvalAction);
        approvalActionInstance.type = 'approval';
        approvalActionInstance.transactionMethods = instance(transactionMethods);
        when(transactionMethods.buildTransaction())
          .thenReturn(Promise.resolve(approvalTransaction));
        when(transactionMethods.estimateGas()).thenReturn(Promise.resolve(approvalGas));

        when(mockedProvider.getNetwork()).thenReturn(Promise.resolve({ chainId: network, name: 'foobar' }));
        when(mockedSeaportJs.getOrderHash(deepEqual(orderComponentsWithHexSalt as OrderComponents)))
          .thenReturn(orderHash);
        when(mockedSeaportJs.createOrder(deepEqual({
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
              token: undefined,
              amount: considerationItem.amount,
              recipient: offerer,
            },
            {
              token: undefined,
              amount: royaltyInfo.amountRequired,
              recipient: royaltyInfo.recipient,
            },
          ],
          startTime: (orderStart.getTime() / 1000).toFixed(0),
          endTime: (orderExpiry.getTime() / 1000).toFixed(0),
          zone: zoneAddress,
          restrictedByZone: true,
        }), offerer)).thenReturn(
          Promise.resolve({
            actions: [approvalActionInstance, createActionInstance],
            executeAllActions: () => undefined as any,
          }),
        );

        sut = new Seaport(
          instance(mockedSeaportJs),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns the expected unsignedApprovalTransaction', async () => {
        const { unsignedApprovalTransaction } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        expect(unsignedApprovalTransaction).toBeTruthy();
        expect(unsignedApprovalTransaction!.from).toEqual(approvalTransaction.from);
        expect(unsignedApprovalTransaction!.to).toEqual(approvalTransaction.to);

        const expectedGasLimit = approvalGas.add(approvalGas.div(5));
        expect(unsignedApprovalTransaction!.gasLimit).toEqual(expectedGasLimit);
      });

      it('returns the expected typedOrderMessageForSigning', async () => {
        const { typedOrderMessageForSigning } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        const domainData = {
          name: SEAPORT_CONTRACT_NAME,
          version: SEAPORT_CONTRACT_VERSION_V1_4,
          chainId: network,
          verifyingContract: seaportContractAddress,
        };

        expect(typedOrderMessageForSigning).toEqual({
          domain: domainData,
          types: EIP_712_ORDER_TYPE,
          value: orderComponentsWithHexSalt,
        });
      });

      it('returns the expected orderComponents', async () => {
        const { orderComponents: orderComponentsRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
          orderStart,
          orderExpiry,
        );
        expect(orderComponentsRes).toEqual(orderComponentsWithHexSalt);
      });

      it('returns the expected order hash', async () => {
        const { orderHash: orderHashRes } = await sut.prepareSeaportOrder(
          offerer,
          listingItem,
          considerationItem,
          royaltyInfo,
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

      const approvalGas = BigNumber.from(1000000);
      const approvalTransaction: PopulatedTransaction = {
        from: offerer,
        to: seaportContractAddress,
      };

      const fulfilGas = BigNumber.from(2000000);
      const fulfilTransaction: PopulatedTransaction = {
        from: offerer,
        to: seaportContractAddress,
      };

      const immutableOrder: Order = {
        account_address: offerer,
        buy: [
          { item_type: BuyItem.item_type.NATIVE, start_amount: '100' },
        ],
        buy_fees: [],
        chain_id: '1',
        create_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        id: '1',
        protocol_data: {
          order_type: CreateOrderProtocolData.order_type.FULL_RESTRICTED,
          zone_address: randomAddress(),
          operator_signature: randomAddress(),
        },
        salt: '1',
        sell: [
          { item_type: SellItem.item_type.ERC721, contract_address: randomAddress(), token_id: '1' },
        ],
        signature: randomAddress(),
        status: OrderStatus.ACTIVE,
        start_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
      };

      beforeEach(() => {
        const mockedSeaportJs = mock(SeaportLib);
        const mockedProvider = mock(providers.JsonRpcProvider);

        const exchangeTransactionMethods = mock<TransactionMethods<boolean>>();
        const exchangeAction = mock<ExchangeAction<any>>();
        const exchangeActionInstance = instance(exchangeAction);
        exchangeActionInstance.type = 'exchange';
        exchangeActionInstance.transactionMethods = instance(exchangeTransactionMethods);
        when(exchangeTransactionMethods.buildTransaction())
          .thenReturn(Promise.resolve(fulfilTransaction));
        when(exchangeTransactionMethods.estimateGas()).thenReturn(Promise.resolve(fulfilGas));

        const approvalTransactionMethods = mock<TransactionMethods<boolean>>();
        const approvalAction = mock<ApprovalAction>();
        const approvalActionInstance = instance(approvalAction);
        approvalActionInstance.type = 'approval';
        approvalActionInstance.transactionMethods = instance(approvalTransactionMethods);
        when(approvalTransactionMethods.buildTransaction())
          .thenReturn(Promise.resolve(approvalTransaction));
        when(approvalTransactionMethods.estimateGas()).thenReturn(Promise.resolve(approvalGas));

        when(mockedSeaportJs.fulfillOrders(deepEqual({
          accountAddress: fulfiller,
          fulfillOrderDetails: [
            {
              order: {
                parameters: anything(),
                signature: immutableOrder.signature,
              },
              extraData: immutableOrder.protocol_data.operator_signature,
            },
          ],
        }))).thenReturn(
          Promise.resolve({
            actions: [approvalActionInstance, exchangeActionInstance],
            executeAllActions: () => undefined as any,
          }),
        );

        when(mockedSeaportJs.getCounter(offerer)).thenReturn(Promise.resolve(BigNumber.from(1)));

        sut = new Seaport(
          instance(mockedSeaportJs),
          instance(mockedProvider),
          seaportContractAddress,
          zoneAddress,
        );
      });

      it('returns the expected unsignedApprovalTransaction', async () => {
        const { unsignedApprovalTransaction } = await sut.fulfilOrder(
          immutableOrder,
          fulfiller,
        );
        expect(unsignedApprovalTransaction).toBeTruthy();
        expect(unsignedApprovalTransaction!.from).toEqual(approvalTransaction.from);
        expect(unsignedApprovalTransaction!.to).toEqual(approvalTransaction.to);

        const expectedGasLimit = approvalGas.add(approvalGas.div(5));
        expect(unsignedApprovalTransaction!.gasLimit).toEqual(expectedGasLimit);
      });

      it('returns the expected unsignedFulfillmentTransaction', async () => {
        const { unsignedFulfillmentTransaction } = await sut.fulfilOrder(
          immutableOrder,
          fulfiller,
        );
        expect(unsignedFulfillmentTransaction).toBeTruthy();
        expect(unsignedFulfillmentTransaction!.from).toEqual(approvalTransaction.from);
        expect(unsignedFulfillmentTransaction!.to).toEqual(approvalTransaction.to);

        const expectedGasLimit = fulfilGas.add(fulfilGas.div(5));
        expect(unsignedFulfillmentTransaction!.gasLimit).toEqual(expectedGasLimit);
      });
    });
  });
});
