import { Fee } from './sdk';
import { Order as OpenApiOrder } from './sdk/models/Order';
import { ProtocolData } from './sdk/models/ProtocolData';
import { mapOrderFromOpenApiOrder, mapTraitBidFromOpenApiOrder } from './mapper';

describe('mapTraitBidFromOpenApiOrder', () => {
  const baseOrder: OpenApiOrder = {
    id: '018792c9-4ad7-8ec4-4038-9e05c598534a',
    type: OpenApiOrder.type.TRAIT_BID,
    account_address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    chain: { id: 'eip155:11155111', name: 'imtbl-zkevm-testnet' },
    created_at: '2022-03-07T07:20:50.52Z',
    updated_at: '2022-03-07T07:20:50.52Z',
    start_at: '2022-03-09T05:00:50.52Z',
    end_at: '2022-03-10T05:00:50.52Z',
    order_hash: '0xabc',
    salt: '1',
    signature: '0x',
    status: { name: 'ACTIVE' },
    fill_status: { numerator: '0', denominator: '1' },
    fees: [
      {
        type: Fee.type.MAKER_ECOSYSTEM,
        amount: '1',
        recipient_address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      },
    ],
    protocol_data: {
      order_type: ProtocolData.order_type.PARTIAL_RESTRICTED,
      counter: '0',
      zone_address: '0x12',
      seaport_address: '0x34',
      seaport_version: '1.5',
    },
    sell: [
      {
        type: 'ERC20',
        contract_address: '0x0165878a594ca255338adfa4d48449f69242eb8f',
        amount: '1000',
      },
    ],
    buy: [
      {
        type: 'ERC721_COLLECTION',
        contract_address: '0x692edad005237c7e737bb2c0f3d8cccc10d3479e',
        amount: '1',
      },
    ],
  };

  it('maps trait criteria from snake_case API fields', () => {
    const order: OpenApiOrder = {
      ...baseOrder,
      trait_criteria: [
        { trait_type: 'Background', values: ['Blue', 'Red'] },
      ],
    };

    const mapped = mapTraitBidFromOpenApiOrder(order);

    expect(mapped.traitCriteria).toEqual([
      { traitType: 'Background', values: ['Blue', 'Red'] },
    ]);
    expect(mapped.type).toBe('TRAIT_BID');
    expect(mapped.sell[0]).toEqual({
      type: 'ERC20',
      contractAddress: '0x0165878a594ca255338adfa4d48449f69242eb8f',
      amount: '1000',
    });
  });

  it('defaults trait criteria when omitted', () => {
    const mapped = mapTraitBidFromOpenApiOrder(baseOrder);
    expect(mapped.traitCriteria).toEqual([]);
  });

  it('routes TRAIT_BID through mapOrderFromOpenApiOrder', () => {
    const order: OpenApiOrder = {
      ...baseOrder,
      trait_criteria: [{ trait_type: 'Rarity', values: ['Legendary'] }],
    };
    const mapped = mapOrderFromOpenApiOrder(order);
    expect(mapped.type).toBe('TRAIT_BID');
    if (mapped.type === 'TRAIT_BID') {
      expect(mapped.traitCriteria).toEqual([{ traitType: 'Rarity', values: ['Legendary'] }]);
    }
  });
});
