import { orderbook } from "@imtbl/sdk";
import { Environment } from "@imtbl/sdk/config";
import { Wallet } from "ethers";
import { withBankerRetry } from "../step-definitions/shared";
import {
  TestERC1155Token,
  TestERC20Token,
  TestERC721Token,
} from "../typechain-types";
import {
  connectToTestERC1155Token,
  connectToTestERC20Token,
  connectToTestERC721Token,
  getConfigFromEnv,
  getRandomTokenId,
} from "../utils/orderbook";
import { actionAll } from "../utils/orderbook/actions";
import { waitForBidToBeOfStatus } from "../utils/orderbook/bid";
import { GAS_OVERRIDES } from "../utils/orderbook/gas";
import { waitForListingToBeOfStatus } from "../utils/orderbook/listing";
import { RetryProvider } from "../utils/orderbook/retry-provider";
import { waitForCollectionBidToBeOfStatus } from "../utils/orderbook/collection-bid";

describe("Orderbook", () => {
  const imxForApproval = 0.03 * 1e18;
  const imxForFulfillment = 0.08 * 1e18;
  const transferTxnFee = 0.0035 * 1e18;

  let orderBookSdk: orderbook.Orderbook;
  let provider: RetryProvider;

  let erc20Contract: TestERC20Token;
  let erc721Contract: TestERC721Token;
  let erc1155Contract: TestERC1155Token;

  let banker: Wallet;
  let maker: Wallet;
  let taker: Wallet;

  beforeAll(async () => {
    const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;
    const bankerPrivateKey = process.env.ZKEVM_ORDERBOOK_BANKER;
    const erc20ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC20;
    const erc721ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC721;
    const erc1155ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC1155;

    if (
      !rpcUrl ||
      !bankerPrivateKey ||
      !erc20ContractAddress ||
      !erc721ContractAddress ||
      !erc1155ContractAddress
    ) {
      throw new Error("missing config for orderbook tests");
    }

    provider = new RetryProvider(rpcUrl);

    banker = new Wallet(bankerPrivateKey, provider);

    erc20Contract = await connectToTestERC20Token(banker, erc20ContractAddress);
    erc721Contract = await connectToTestERC721Token(
      banker,
      erc721ContractAddress
    );
    erc1155Contract = await connectToTestERC1155Token(
      banker,
      erc1155ContractAddress
    );

    orderBookSdk = new orderbook.Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      overrides: {
        ...getConfigFromEnv(),
      },
    });
  });

  beforeEach(() => {
    maker = new Wallet(Wallet.createRandom().privateKey, provider);
    taker = new Wallet(Wallet.createRandom().privateKey, provider);
  });

  afterEach(async () => {
    await withBankerRetry(async () => {
      const makerBalance = await maker.provider?.getBalance(maker.address) ?? 0n
      const takerBalance = await taker.provider?.getBalance(taker.address) ?? 0n

      if (makerBalance > BigInt(transferTxnFee)) {
        // maker returns funds
        await (
          await maker.sendTransaction({
            to: banker.address,
            value: `${(makerBalance - BigInt(transferTxnFee)).toString()}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      }

      if (takerBalance > BigInt(transferTxnFee)) {
        // taker returns funds
        await (
          await taker.sendTransaction({
            to: banker.address,
            value: `${(takerBalance - BigInt(transferTxnFee)).toString()}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      }
    });
  });

  it("create and fulfill ERC721 bid", async () => {
    const erc721TokenId = getRandomTokenId();

    // maker funds
    await withBankerRetry(async () => {
      await (
        await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
      ).wait(1);
    });
    await withBankerRetry(async () => {
      await (
        await banker.sendTransaction({
          to: maker.address,
          value: `${imxForApproval}`,
          ...GAS_OVERRIDES,
        })
      ).wait(1);
    });

    // taker funds
    await withBankerRetry(async () => {
      await (
        await erc721Contract.mint(taker.address, erc721TokenId, GAS_OVERRIDES)
      ).wait(1);
    });
    await withBankerRetry(async () => {
      await (
        await banker.sendTransaction({
          to: taker.address,
          value: `${imxForApproval + imxForFulfillment}`,
          ...GAS_OVERRIDES,
        })
      ).wait(1);
    });

    const {
      actions: bidCreateActions,
      orderComponents,
      orderHash,
    } = await orderBookSdk.prepareBid({
      makerAddress: maker.address,
      sell: {
        type: "ERC20",
        contractAddress: await erc20Contract.getAddress(),
        amount: "100",
      },
      buy: {
        type: "ERC721",
        contractAddress: await erc721Contract.getAddress(),
        tokenId: erc721TokenId,
      },
      orderStart: new Date(2000, 1, 15),
    });

    const signatures = await actionAll(bidCreateActions, maker);

    const { result } = await orderBookSdk.createBid({
      orderComponents,
      orderHash,
      orderSignature: signatures[0],
      makerFees: [],
    });

    await waitForBidToBeOfStatus(orderBookSdk, result.id, {
      name: orderbook.OrderStatusName.ACTIVE,
    });

    const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
      result.id,
      taker.address,
      []
    );
    await actionAll(fulfillActions, taker);

    await waitForBidToBeOfStatus(orderBookSdk, result.id, {
      name: orderbook.OrderStatusName.FILLED,
    });
  });

  describe("create and fulfill ERC1155 bid", () => {
    let bidId: string;

    // create the bid
    beforeEach(async () => {
      const erc1155TokenId = getRandomTokenId();

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc1155Contract.safeMint(
            taker.address,
            erc1155TokenId,
            50,
            "0x",
            GAS_OVERRIDES
          )
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${imxForApproval + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const {
        actions: bidCreateActions,
        orderComponents,
        orderHash,
      } = await orderBookSdk.prepareBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC1155",
          contractAddress: await erc1155Contract.getAddress(),
          tokenId: erc1155TokenId,
          amount: "50",
        },
      });

      const signatures = await actionAll(bidCreateActions, maker);
      const { result } = await orderBookSdk.createBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });

      await waitForBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      bidId = result.id;
    });

    it("fulfill fully without explicit fulfill amount", async () => {
      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        bidId,
        taker.address,
        []
      );
      await actionAll(fulfillActions, taker);

      await waitForBidToBeOfStatus(orderBookSdk, bidId, {
        name: orderbook.OrderStatusName.FILLED,
      });
    });

    it("fulfill partially", async () => {
      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        bidId,
        taker.address,
        [],
        "10"
      );
      await actionAll(fulfillActions, taker);

      await waitForBidToBeOfStatus(
        orderBookSdk,
        bidId,
        {
          name: orderbook.OrderStatusName.ACTIVE,
        },
        {
          numerator: 10,
          denominator: 50,
        }
      );
    });

    it("fulfill partially, then fully without explicit fulfill amount", async () => {
      const { actions: fulfillActionsA } = await orderBookSdk.fulfillOrder(
        bidId,
        taker.address,
        [],
        "10"
      );
      await actionAll(fulfillActionsA, taker);

      await waitForBidToBeOfStatus(
        orderBookSdk,
        bidId,
        {
          name: orderbook.OrderStatusName.ACTIVE,
        },
        {
          numerator: 10,
          denominator: 50,
        }
      );

      const { actions: fulfillActionsB } = await orderBookSdk.fulfillOrder(
        bidId,
        taker.address,
        []
      );
      await actionAll(fulfillActionsB, taker);

      await waitForBidToBeOfStatus(orderBookSdk, bidId, {
        name: orderbook.OrderStatusName.FILLED,
      });
    });
  });

  describe("create and fulfill ERC721 collection bid", () => {
    it("fulfill fully", async () => {
      const erc721TokenId = getRandomTokenId();

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc721Contract.mint(taker.address, erc721TokenId, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${imxForApproval + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const { actions, orderComponents, orderHash } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC721_COLLECTION",
          contractAddress: await erc721Contract.getAddress(),
          amount: "1",
        },
        orderStart: new Date(2000, 1, 15),
      });
      
      const signatures = await actionAll(actions, maker);

      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      
      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        result.id,
        taker.address,
        [],
        "1",
        erc721TokenId
      );
      await actionAll(fulfillActions, taker);

      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.FILLED,
      });
    })

    it("fulfill partially", async () => {
      const erc721TokenId = getRandomTokenId();

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc721Contract.mint(taker.address, erc721TokenId, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${imxForApproval + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // create a collection bid to receive an amount greather than 1
      const { actions, orderComponents, orderHash } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC721_COLLECTION",
          contractAddress: await erc721Contract.getAddress(),
          amount: "2",
        },
        orderStart: new Date(2000, 1, 15),
      })

      const signatures = await actionAll(actions, maker);

      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      
      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      // fulfill partially with 1 ERC721 token (1/2)
      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        result.id,
        taker.address,
        [],
        "1",
        erc721TokenId
      )

      await actionAll(fulfillActions, taker)

      await waitForCollectionBidToBeOfStatus(
        orderBookSdk,
        result.id, 
        {
          name: orderbook.OrderStatusName.ACTIVE
        },
        {
          numerator: 1,
          denominator: 2
        }
      );
    })
  })

  describe("create and fulfill ERC1155 collection bid", () => {
    it("fulfill fully", async () => {
      const erc1155TokenId = getRandomTokenId();

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc1155Contract.safeMint(
            taker.address,
            erc1155TokenId,
            50,
            "0x",
            GAS_OVERRIDES
          )
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${imxForApproval + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const { actions, orderComponents, orderHash } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC1155_COLLECTION",
          contractAddress: await erc1155Contract.getAddress(),
          amount: "50",
        },
        orderStart: new Date(2000, 1, 15),
      });
      
      const signatures = await actionAll(actions, maker);

      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      
      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        result.id,
        taker.address,
        [],
        "50",
        erc1155TokenId
      );
      await actionAll(fulfillActions, taker);

      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.FILLED,
      });
    })

    it("fulfill partially", async () => {
      const erc1155TokenId = getRandomTokenId();

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc1155Contract.safeMint(
            taker.address,
            erc1155TokenId,
            50,
            "0x",
            GAS_OVERRIDES
          )
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${imxForApproval + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // create a collection bid to receive an amount greather than 1
      const { actions, orderComponents, orderHash } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC1155_COLLECTION",
          contractAddress: await erc1155Contract.getAddress(),
          amount: "50",
        },
        orderStart: new Date(2000, 1, 15),
      });

      const signatures = await actionAll(actions, maker);

      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      
      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      // fulfill partially with 10 ERC1155 (10/50)
      const { actions: fulfillActions } = await orderBookSdk.fulfillOrder(
        result.id,
        taker.address,
        [],
        "10",
        erc1155TokenId
      )

      await actionAll(fulfillActions, taker)

      await waitForCollectionBidToBeOfStatus(
        orderBookSdk,
        result.id, 
        {
          name: orderbook.OrderStatusName.ACTIVE
        },
        {
          numerator: 10,
          denominator: 50
        }
      );
    })
  })

  describe('create and bulk fulfill ERC721 listing', () => {
    it('fulfill fully', async () => {
      const erc721TokenIds = Array.from({ length: 2 }, () => getRandomTokenId());

      // maker funds
      for (const tokenId of erc721TokenIds) {
        await withBankerRetry(async () => {
          await (
            await erc721Contract.mint(maker.address, tokenId, GAS_OVERRIDES)
          ).wait(1);
        });
      }

      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${(imxForApproval * 2) + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      // taker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(taker.address, 10000, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${(imxForApproval * 2) + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const orderIds: string[] = [];

      for (const tokenId of erc721TokenIds) {
        const {
          actions: listingCreateActions,
          orderComponents,
          orderHash,
        } = await orderBookSdk.prepareListing({
          makerAddress: maker.address,
          sell: {
            type: 'ERC721',
            contractAddress: await erc721Contract.getAddress(),
            tokenId,
          },
          buy: {
            type: 'ERC20',
            contractAddress: await erc20Contract.getAddress(),
            amount: '100',
          },
          orderStart: new Date(2000, 1, 15),
        });

        const signatures = await actionAll(listingCreateActions, maker);

        const { result } = await orderBookSdk.createListing({
          orderComponents,
          orderHash,
          orderSignature: signatures[0],
          makerFees: [],
        });

        orderIds.push(result.id);

        await waitForListingToBeOfStatus(orderBookSdk, result.id, {
          name: orderbook.OrderStatusName.ACTIVE,
        });
      }

      const fulfilmentParams = orderIds.map(orderId => ({
        orderId,
        takerFees: [],
        amountToFill: '1',
      }));

      const fulfillResponse = await orderBookSdk.fulfillBulkOrders(
        fulfilmentParams,
        taker.address
      );

      if (!fulfillResponse.sufficientBalance) {
        throw new Error('Expected balance to be sufficient for order fulfillment');
      }

      const { actions } = fulfillResponse;

      await actionAll(actions, taker);

      await Promise.all(
        orderIds.map(orderId => waitForListingToBeOfStatus(orderBookSdk, orderId, {
          name: orderbook.OrderStatusName.FILLED,
        }))
      );
    })
  })

  describe("create and bulk fulfill ERC721 bid", () => {
    it("fulfill fully", async () => {
      const erc721TokenIds = Array.from({ length: 2 }, () => getRandomTokenId());

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 10000, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      for (const tokenId of erc721TokenIds) {
        await withBankerRetry(async () => {
          await (
            await erc721Contract.mint(taker.address, tokenId, GAS_OVERRIDES)
          ).wait(1);
        });
      }

      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${(imxForApproval * 2) + imxForFulfillment}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const orderIds: string[] = [];

      for (const tokenId of erc721TokenIds) {
        const {
          actions: bidCreateActions,
          orderComponents,
          orderHash,
        } = await orderBookSdk.prepareBid({
          makerAddress: maker.address,
          sell: {
            type: 'ERC20',
            contractAddress: await erc20Contract.getAddress(),
            amount: '100',
          },
          buy: {
            type: 'ERC721',
            contractAddress: await erc721Contract.getAddress(),
            tokenId,
          },
          orderStart: new Date(2000, 1, 15),
        });

        const signatures = await actionAll(bidCreateActions, maker);

        const { result } = await orderBookSdk.createBid({
          orderComponents,
          orderHash,
          orderSignature: signatures[0],
          makerFees: [],
        });

        orderIds.push(result.id);

        await waitForBidToBeOfStatus(orderBookSdk, result.id, {
          name: orderbook.OrderStatusName.ACTIVE,
        });
      }

      const fulfilmentParams = orderIds.map(orderId => ({
        orderId,
        takerFees: [],
        amountToFill: '1',
      }));

      const fulfillResponse = await orderBookSdk.fulfillBulkOrders(
        fulfilmentParams,
        taker.address
      );

      if (!fulfillResponse.sufficientBalance) {
        throw new Error('Expected balance to be sufficient for order fulfillment');
      }

      const { actions } = fulfillResponse;

      await actionAll(actions, taker);

      await Promise.all(
        orderIds.map(orderId => waitForBidToBeOfStatus(orderBookSdk, orderId, {
          name: orderbook.OrderStatusName.FILLED,
        }))
      );
    })
  })

  describe("create and bulk fulfill ERC721 collection bid", () => {
    it("fulfill fully", async () => {
      const erc721TokenIds = Array.from({ length: 10 }, () => getRandomTokenId());

      // maker funds
      await withBankerRetry(async () => {
        await (
          await erc20Contract.mint(maker.address, 10000, GAS_OVERRIDES)
        ).wait(1);
      });
      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: maker.address,
            value: `${imxForApproval}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      for (const tokenId of erc721TokenIds) {
        await withBankerRetry(async () => {
          await (
            await erc721Contract.mint(taker.address, tokenId, GAS_OVERRIDES)
          ).wait(1);
        });
      }

      await withBankerRetry(async () => {
        await (
          await banker.sendTransaction({
            to: taker.address,
            value: `${(imxForApproval * 2) + (imxForFulfillment * 2)}`,
            ...GAS_OVERRIDES,
          })
        ).wait(1);
      });

      const {
        actions: bidCreateActions,
        orderComponents,
        orderHash,
      } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: 'ERC20',
          contractAddress: await erc20Contract.getAddress(),
          amount: '100',
        },
        buy: {
          type: 'ERC721_COLLECTION',
          contractAddress: await erc721Contract.getAddress(),
          amount: '10',
        },
        orderStart: new Date(2000, 1, 15),
      });

      const signatures = await actionAll(bidCreateActions, maker);

      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });

      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      const fulfilmentParams = erc721TokenIds.map(tokenId => ({
        orderId: result.id,
        takerFees: [],
        amountToFill: '1',
        tokenId,
      }));

      const fulfillResponse = await orderBookSdk.fulfillBulkOrders(
        fulfilmentParams,
        taker.address
      );

      if (!fulfillResponse.sufficientBalance) {
        throw new Error('Expected balance to be sufficient for order fulfillment');
      }

      const { actions } = fulfillResponse;

      await actionAll(actions, taker);

      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.FILLED,
      });
    })
  })

  it("create and cancel listing, bid, and collection bid", async () => {
    const erc721TokenIdForListing = getRandomTokenId();
    const erc721TokenIdForBid = getRandomTokenId();
    const erc1155TokenIdForCollectionBid = getRandomTokenId();

    // maker funds
    await withBankerRetry(async () => {
      await (
        await erc20Contract.mint(maker.address, 100, GAS_OVERRIDES)
      ).wait(1);
    });
    await withBankerRetry(async () => {
      await (
        await erc721Contract.mintBatch(
          [
            {
              to: maker.address,
              tokenIds: [erc721TokenIdForListing, erc721TokenIdForBid, erc1155TokenIdForCollectionBid],
            },
          ],
          GAS_OVERRIDES
        )
      ).wait(1);
    });
    await withBankerRetry(async () => {
      await (
        await banker.sendTransaction({
          to: maker.address,
          value: `${imxForApproval * 2}`,
          ...GAS_OVERRIDES,
        })
      ).wait(1);
    });

    // listing
    const listingId = await (async () => {
      const {
        actions: listingCreateActions,
        orderComponents,
        orderHash,
      } = await orderBookSdk.prepareListing({
        makerAddress: maker.address,
        sell: {
          type: "ERC721",
          contractAddress: await erc721Contract.getAddress(),
          tokenId: erc721TokenIdForListing,
        },
        buy: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
      });

      const signatures = await actionAll(listingCreateActions, maker);
      const { result } = await orderBookSdk.createListing({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });

      await waitForListingToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      return result.id;
    })();

    // bid
    const bidId = await (async () => {
      const {
        actions: bidCreateActions,
        orderComponents,
        orderHash,
      } = await orderBookSdk.prepareBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC721",
          contractAddress: await erc721Contract.getAddress(),
          tokenId: erc721TokenIdForBid,
        },
      });

      const signatures = await actionAll(bidCreateActions, maker);
      const { result } = await orderBookSdk.createBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });

      await waitForBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      return result.id;
    })();

    // collection bid
    const collectionBidId = await (async () => {
      const {
        actions: collectionBidCreateActions,
        orderComponents,
        orderHash,
      } = await orderBookSdk.prepareCollectionBid({
        makerAddress: maker.address,
        sell: {
          type: "ERC20",
          contractAddress: await erc20Contract.getAddress(),
          amount: "100",
        },
        buy: {
          type: "ERC1155_COLLECTION",
          contractAddress: await erc1155Contract.getAddress(),
          amount: "50",
        },
      });

      const signatures = await actionAll(collectionBidCreateActions, maker);
      const { result } = await orderBookSdk.createCollectionBid({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });

      await waitForCollectionBidToBeOfStatus(orderBookSdk, result.id, {
        name: orderbook.OrderStatusName.ACTIVE,
      });

      return result.id;
    })();

    // cancel listing & bid
    const { signableAction } = await orderBookSdk.prepareOrderCancellations([
      listingId,
      bidId,
      collectionBidId,
    ]);
    const signatures = await actionAll([signableAction], maker);
    const { result } = await orderBookSdk.cancelOrders(
      [listingId, bidId, collectionBidId],
      maker.address,
      signatures[0]
    );

    expect(result.successful_cancellations).toEqual(
      expect.arrayContaining([listingId, bidId, collectionBidId])
    );

    await Promise.all([
      waitForListingToBeOfStatus(orderBookSdk, listingId, {
        name: orderbook.OrderStatusName.CANCELLED,
        cancellation_type: "OFF_CHAIN" as any, // Cancellation type enum is not exported
        pending: false,
      }),
      waitForBidToBeOfStatus(orderBookSdk, bidId, {
        name: orderbook.OrderStatusName.CANCELLED,
        cancellation_type: "OFF_CHAIN" as any, // Cancellation type enum is not exported
        pending: false,
      }),
      waitForCollectionBidToBeOfStatus(orderBookSdk, collectionBidId, {
        name: orderbook.OrderStatusName.CANCELLED,
        cancellation_type: "OFF_CHAIN" as any, // Cancellation type enum is not exported
        pending: false,
      }),
    ]);
  });
});
