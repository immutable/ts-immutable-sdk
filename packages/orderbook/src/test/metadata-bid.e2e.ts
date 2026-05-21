import { randomUUID, randomBytes } from 'crypto';
import { execSync } from 'child_process';
import { Contract } from 'ethers';
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '../openapi/sdk';
import { Orderbook } from '../orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet, getFulfillerWallet } from './helpers/signers';
import { waitForMetadataBidToBeOfStatus } from './helpers/order';
import { getConfigFromEnv, getRandomTokenId } from './helpers';
import { actionAll } from './helpers/actions';
import { GAS_OVERRIDES } from './helpers/gas';

const LOCAL_CHAIN_ID = 'eip155:31337';
const LOCAL_CHAIN_NAME = 'imtbl-zkevm-local';

const ERC20_ABI = [
  'function mint(address to, uint256 amount) external',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address) external view returns (uint256)',
];

const ERC721_ABI = [
  'function safeMint(address to, uint256 tokenId) external',
  'function setApprovalForAll(address operator, bool approved) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
];

interface NftAttribute {
  trait_type: string;
  value: string;
}

interface NftMetadataOverrides {
  name?: string;
  image?: string;
  description?: string;
  animationUrl?: string;
  externalUrl?: string;
  youtubeUrl?: string;
  attributes?: NftAttribute[];
}

const escapeSqlString = (s: string) => s.replace(/'/g, "''");

const stringLiteralOrNull = (v: string | undefined) => (v === undefined ? 'NULL' : `'${escapeSqlString(v)}'`);

/**
 * Seeds the indexer-mr database so that the given NFT is associated with a
 * metadata_id and the configured metadata fields. This lets the fulfillment
 * endpoint validate the token against a metadata bid (either by id or by
 * field-level criteria).
 *
 * Returns the generated metadata_id, which callers using id-based bids should
 * pass into `createMetadataBid`. Callers using criteria-based bids can ignore
 * the return value.
 */
function ensureIndexerNft(
  contractAddress: string,
  tokenId: string,
  overrides: NftMetadataOverrides = {},
): string {
  const port = process.env.INDEXER_MR_POSTGRES_PORT ?? '5434';
  const connStr = `postgres://postgres:postgres@localhost:${port}/indexer-mr`;
  const metadataId = randomUUID();
  const metadataHash = randomBytes(16).toString('hex');
  const nftId = randomUUID();

  const name = overrides.name ?? 'e2e metadata-bid nft';
  const image = overrides.image ?? 'https://example.com/nft.png';
  const attributesJson = JSON.stringify(overrides.attributes ?? []);

  const sql = `
    BEGIN;

    INSERT INTO chains (id, name, rpc_url, operator_allowlist_address, minter_address)
    VALUES ('${LOCAL_CHAIN_ID}', '${LOCAL_CHAIN_NAME}', 'http://127.0.0.1:8545',
            '0x0000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000001')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO collections
      (chain_id, contract_address, contract_type, indexed_at, updated_at, verification_status)
    VALUES
      ('${LOCAL_CHAIN_ID}', LOWER('${contractAddress}'), 'erc721'::collections_contract_type,
       NOW(), NOW(), 'unverified'::asset_verification_status)
    ON CONFLICT (chain_id, contract_address) DO NOTHING;

    INSERT INTO nft_metadata
      (id, chain_id, contract_address, hash, name, image,
       description, animation_url, external_url, youtube_url,
       attributes, created_at, updated_at)
    VALUES
      ('${metadataId}'::uuid, '${LOCAL_CHAIN_ID}', LOWER('${contractAddress}'),
       '${metadataHash}', '${escapeSqlString(name)}', '${escapeSqlString(image)}',
       ${stringLiteralOrNull(overrides.description)},
       ${stringLiteralOrNull(overrides.animationUrl)},
       ${stringLiteralOrNull(overrides.externalUrl)},
       ${stringLiteralOrNull(overrides.youtubeUrl)},
       '${escapeSqlString(attributesJson)}'::jsonb, NOW(), NOW());

    INSERT INTO nfts
      (id, chain_id, contract_address, token_id, contract_type, indexed_at, updated_at, metadata_id)
    VALUES
      ('${nftId}'::uuid, '${LOCAL_CHAIN_ID}', LOWER('${contractAddress}'),
       ${tokenId}::numeric, 'erc721'::collections_contract_type,
       NOW(), NOW(), '${metadataId}'::uuid)
    ON CONFLICT (chain_id, contract_address, token_id) DO UPDATE SET
      metadata_id = EXCLUDED.metadata_id,
      updated_at = EXCLUDED.updated_at;

    COMMIT;
  `;

  execSync(`psql "${connStr}"`, { input: sql, stdio: ['pipe', 'pipe', 'pipe'] });
  return metadataId;
}

describe('metadata bid e2e', () => {
  const provider = getLocalhostProvider();
  const maker = getOffererWallet(provider);
  const taker = getFulfillerWallet(provider);

  const localConfigOverrides = getConfigFromEnv();
  const sdk = new Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    overrides: {
      ...localConfigOverrides,
    },
  });

  let erc721Address: string;
  let erc20Address: string;

  beforeAll(async () => {
    erc721Address = process.env.ZKEVM_ORDERBOOK_ERC721!;
    if (!erc721Address) {
      throw new Error('ZKEVM_ORDERBOOK_ERC721 must be set');
    }

    erc20Address = process.env.ZKEVM_ORDERBOOK_ERC20!;
    if (!erc20Address) {
      throw new Error('ZKEVM_ORDERBOOK_ERC20 must be set');
    }

    const erc20 = new Contract(erc20Address, ERC20_ABI, maker);

    const mintTx = await erc20.mint(maker.address, BigInt('1000000000000000000'), GAS_OVERRIDES);
    await mintTx.wait();
  }, 60_000);

  it('should prepare, create, and get a metadata bid', async () => {
    const metadataId = randomUUID();

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '1000000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataId,
    });

    expect(createdBid.id).toBeDefined();
    expect(createdBid.type).toEqual('METADATA_BID');
    expect(createdBid.metadataId).toEqual(metadataId);

    const activeBid = await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    expect(activeBid.id).toEqual(createdBid.id);
    expect(activeBid.metadataId).toEqual(metadataId);
    expect(activeBid.status.name).toEqual(OrderStatusName.ACTIVE);
  }, 60_000);

  it('should list metadata bids filtered by account address', async () => {
    const metadataId = randomUUID();

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '500000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataId,
    });

    await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    const listResult = await sdk.listMetadataBids({
      accountAddress: maker.address,
      status: OrderStatusName.ACTIVE,
    });

    expect(listResult.result.length).toBeGreaterThan(0);

    const found = listResult.result.find((bid) => bid.id === createdBid.id);
    expect(found).toBeDefined();
    expect(found!.type).toEqual('METADATA_BID');
    expect(found!.metadataId).toEqual(metadataId);
  }, 60_000);

  it('should list metadata bids filtered by buy item contract address', async () => {
    const metadataId = randomUUID();

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '300000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataId,
    });

    await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    const listResult = await sdk.listMetadataBids({
      buyItemContractAddress: erc721Address,
      status: OrderStatusName.ACTIVE,
    });

    expect(listResult.result.length).toBeGreaterThan(0);

    const found = listResult.result.find((bid) => bid.id === createdBid.id);
    expect(found).toBeDefined();
    expect(found!.metadataId).toEqual(metadataId);
  }, 60_000);

  it('should fulfill a metadata bid', async () => {
    const tokenId = getRandomTokenId();

    const erc721 = new Contract(erc721Address, ERC721_ABI, maker);
    const mintTx = await erc721.safeMint(taker.address, tokenId, GAS_OVERRIDES);
    await mintTx.wait();

    const metadataId = ensureIndexerNft(erc721Address, tokenId);

    const takerErc721 = new Contract(erc721Address, ERC721_ABI, taker);
    const seaportAddress = process.env.SEAPORT_CONTRACT_ADDRESS!;
    const approvalTx = await takerErc721.setApprovalForAll(seaportAddress, true, GAS_OVERRIDES);
    await approvalTx.wait();

    const blockTime = await provider.getBlock('latest');

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '100000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
      orderStart: new Date(blockTime!.timestamp - 1000),
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataId,
    });

    await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    const fulfillment = await sdk.fulfillOrder(
      createdBid.id,
      taker.address,
      [],
      undefined,
      tokenId,
    );

    await actionAll(fulfillment.actions, taker);

    const filledBid = await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.FILLED,
    );

    expect(filledBid.id).toEqual(createdBid.id);
    expect(filledBid.status.name).toEqual(OrderStatusName.FILLED);
  }, 120_000);

  it('should prepare, create, and get a metadata bid with criteria', async () => {
    const metadataCriteria = [
      { fieldName: 'attribute:Background' as const, values: ['Blue', 'Red'] },
      { fieldName: 'name' as const, values: ['Cool Dragon'] },
    ];

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '750000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataCriteria,
    });

    expect(createdBid.id).toBeDefined();
    expect(createdBid.type).toEqual('METADATA_BID');
    expect(createdBid.metadataId).toBeUndefined();
    expect(createdBid.metadataCriteria).toEqual(metadataCriteria);

    const activeBid = await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    expect(activeBid.id).toEqual(createdBid.id);
    expect(activeBid.metadataId).toBeUndefined();
    expect(activeBid.metadataCriteria).toEqual(metadataCriteria);
    expect(activeBid.status.name).toEqual(OrderStatusName.ACTIVE);
  }, 60_000);

  it('should fulfill a metadata bid matched by attribute criteria', async () => {
    const tokenId = getRandomTokenId();

    const erc721 = new Contract(erc721Address, ERC721_ABI, maker);
    const mintTx = await erc721.safeMint(taker.address, tokenId, GAS_OVERRIDES);
    await mintTx.wait();

    ensureIndexerNft(erc721Address, tokenId, {
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Rarity', value: 'Common' },
      ],
    });

    const takerErc721 = new Contract(erc721Address, ERC721_ABI, taker);
    const seaportAddress = process.env.SEAPORT_CONTRACT_ADDRESS!;
    const approvalTx = await takerErc721.setApprovalForAll(seaportAddress, true, GAS_OVERRIDES);
    await approvalTx.wait();

    const blockTime = await provider.getBlock('latest');

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '100000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
      orderStart: new Date(blockTime!.timestamp - 1000),
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      // OR within values ("Blue" matches), case-insensitive on both sides.
      metadataCriteria: [
        { fieldName: 'attribute:Background', values: ['blue', 'red'] },
      ],
    });

    await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    const fulfillment = await sdk.fulfillOrder(
      createdBid.id,
      taker.address,
      [],
      undefined,
      tokenId,
    );

    await actionAll(fulfillment.actions, taker);

    const filledBid = await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.FILLED,
    );

    expect(filledBid.id).toEqual(createdBid.id);
    expect(filledBid.status.name).toEqual(OrderStatusName.FILLED);
    expect(filledBid.metadataId).toBeUndefined();
    expect(filledBid.metadataCriteria).toEqual([
      { fieldName: 'attribute:Background', values: ['blue', 'red'] },
    ]);
  }, 120_000);

  it('should fulfill a metadata bid matched by mixed top-level + attribute criteria', async () => {
    const tokenId = getRandomTokenId();

    const erc721 = new Contract(erc721Address, ERC721_ABI, maker);
    const mintTx = await erc721.safeMint(taker.address, tokenId, GAS_OVERRIDES);
    await mintTx.wait();

    ensureIndexerNft(erc721Address, tokenId, {
      name: 'Cool Dragon',
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
      ],
    });

    const takerErc721 = new Contract(erc721Address, ERC721_ABI, taker);
    const seaportAddress = process.env.SEAPORT_CONTRACT_ADDRESS!;
    const approvalTx = await takerErc721.setApprovalForAll(seaportAddress, true, GAS_OVERRIDES);
    await approvalTx.wait();

    const blockTime = await provider.getBlock('latest');

    const prepareResult = await sdk.prepareMetadataBid({
      makerAddress: maker.address,
      sell: {
        contractAddress: erc20Address,
        amount: '100000',
        type: 'ERC20',
      },
      buy: {
        contractAddress: erc721Address,
        type: 'ERC721_COLLECTION',
        amount: '1',
      },
      orderStart: new Date(blockTime!.timestamp - 1000),
    });

    const signatures = await actionAll(prepareResult.actions, maker);

    // AND across filters: NFT must have name="Cool Dragon" AND attribute:Background in {Blue}.
    const metadataCriteria = [
      { fieldName: 'name' as const, values: ['Cool Dragon'] },
      { fieldName: 'attribute:Background' as const, values: ['Blue'] },
    ];

    const { result: createdBid } = await sdk.createMetadataBid({
      orderComponents: prepareResult.orderComponents,
      orderHash: prepareResult.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
      metadataCriteria,
    });

    await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.ACTIVE,
    );

    const fulfillment = await sdk.fulfillOrder(
      createdBid.id,
      taker.address,
      [],
      undefined,
      tokenId,
    );

    await actionAll(fulfillment.actions, taker);

    const filledBid = await waitForMetadataBidToBeOfStatus(
      sdk,
      createdBid.id,
      OrderStatusName.FILLED,
    );

    expect(filledBid.id).toEqual(createdBid.id);
    expect(filledBid.status.name).toEqual(OrderStatusName.FILLED);
    expect(filledBid.metadataCriteria).toEqual(metadataCriteria);
  }, 120_000);
});
