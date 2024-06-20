import { expect } from 'chai';
import { Fee, Order, ProtocolData } from 'openapi/sdk';
import { determineFillableUnits } from './fillable-units';

describe('determineFillableUnits', () => {
  function createOrder(overrides?: Partial<Order>): Order {
    // Default order object
    const defaultOrder: Order = {
      sell: [
        {
          type: 'ERC1155',
          amount: '100',
          contract_address: '0xEEb7Da6De152597830eD16361633e362A2F59410',
          token_id: '123',
        },
      ],
      buy: [
        {
          type: 'ERC20',
          amount: '100',
          contract_address: '0xFFb7Da6De152597830eD16361633e362A2F59411',
        },
      ],
      type: Order.type.LISTING,
      fill_status: {
        numerator: '0',
        denominator: '0',
      },
      account_address: '0x1237Da6De152597830eD16361633e362A2F59412',
      fees: [
        {
          type: Fee.type.PROTOCOL,
          amount: '100',
          recipient_address: '0x4567Da6De152597830eD16361633e362A2F59413',
        },
      ],
      chain: {
        id: 'eip155:13473',
        name: 'imtbl-zkevm-testnet',
      },
      created_at: '2024-06-18T06:16:57.902738Z',
      end_at: '2026-06-18T06:16:14Z',
      id: '019029fd-cf21-0a33-c77f-e121f5162f22',
      order_hash: '0xba8ebe0b4ac6f1cc21a2274199b238959aaa0c59e1f2b31a8b7e8a66bf9f9635',
      protocol_data: {
        order_type: ProtocolData.order_type.PARTIAL_RESTRICTED,
        counter: '0',
        zone_address: '0x1004f9615e79462c711ff05a386bdba91a762822',
        seaport_address: '0x7d117aa8bd6d31c4fa91722f246388f38ab19482',
        seaport_version: '1.5',
      },
      salt: '0x3217c152146bf9f5',
      signature: '0xf1522af4913159cdf1172d1c1bd511a3ca617f6c1d0b0ed588b2ce27618a2ac832c31ed4ee6ab2cea8af0efc2ad522468aa1c8c206291f4b343239acfea0a75e1b',
      start_at: '2024-06-18T06:16:14Z',
      status: {
        name: 'ACTIVE',
      },
      updated_at: '2024-06-18T06:16:59.006679Z',
    };

    // Merge the overrides with the default order
    return { ...defaultOrder, ...overrides };
  }

  it('should return the remaining fillable units for ERC1155 type when amountToFill is not provided', () => {
    const orderInput = createOrder({
      fill_status: {
        numerator: '40',
        denominator: '100',
      },
    });

    const result = determineFillableUnits(orderInput);
    expect(result).to.equal('60'); // (100 - 40) * 100 / 100
  });

  it('should return the original offer amount if order is unfilled i.e numerator or denominator is 0', () => {
    const order: Order = createOrder();

    const result = determineFillableUnits(order);
    expect(result).to.equal('100');
  });

  it('should return amountToFill if provided', () => {
    const order: Order = createOrder({
      fill_status: {
        numerator: '40',
        denominator: '100',
      },
    });

    const amountToFill = '50';
    const result = determineFillableUnits(order, amountToFill);
    expect(result).to.equal(amountToFill);
  });

  it('should return undefined if order type is not ERC1155', () => {
    const order: Order = createOrder({
      sell: [
        {
          type: 'ERC721',
          contract_address: '0xEEb7Da6De152597830eD16361633e362A2F59410',
          token_id: '123',
        },
      ],
      fill_status: {
        numerator: '0',
        denominator: '0',
      },
    });

    const result = determineFillableUnits(order);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.undefined;
  });
});
