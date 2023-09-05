import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Heading, Banner, Button, Card, Link } from "@biom3/react";

import { Grid, Row, Col } from "react-flexbox-grid";

import ItemCards from "../components/ItemCards";
import StatusCard from "../components/StatusCard";
import ConfigForm from "../components/ConfigForm";
import { useData } from "../context/DataProvider";
import { TransactionReceipt } from "@ethersproject/providers";

const useURLParams = () => {
  const [urlParams, setUrlParams] = useState({});
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    setUrlParams(params);
  }, []);

  return urlParams;
};

const useItems = (contract_address: string, pointer = 1) => {
  const maxItems = 721;
  const once = useRef<number | undefined>(undefined);
  const [items, setItems] = useState<any[]>([]);

  const getItems = useCallback(async () => {
    once.current = pointer;

    const pageSize = 100;
    const start = pointer * pageSize - pageSize + 1;
    const length =
      start + pageSize - 1 <= maxItems ? pageSize : maxItems - start + 1;

    if (start > maxItems) return;

    try {
      const items$ = Array.from({ length }, (_, i) => i + start).map(
        async (id) => {
          const response = await fetch(
            `https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/metadata/${id}`,
            { method: "GET" }
          );
          const json = await response.json();

          // const price = Math.floor(Math.random() * 25) + 1;
          const price = Math.round((Math.random() * 3 + 0.1) * 100) / 100;

          return {
            token_id: id,
            name: json.name,
            image: json.image,
            contract_address,
            price: price,
            description: `USDC \$${price}`,
          };
        }
      );

      const _items = await Promise.all(items$);

      setItems((prevItems) => [...prevItems, ..._items]);
    } catch (error) {}
  }, [contract_address, pointer]);

  useEffect(() => {
    once.current !== pointer && getItems();
  }, [pointer]);

  return items;
};

const useGetNfts = (
  walletAddr: string,
  collectionAddr: string,
  refreshingTime = 2
) => {
  const { getNFTs } = useData();
  const [nfts, setNFTs] = useState<any[]>([]);

  const getNFTsAsync = useCallback(async () => {
    try {
      const res = await getNFTs(walletAddr, collectionAddr);

      setNFTs(res?.result || []);
    } catch (error) {}
  }, [walletAddr, collectionAddr]);

  useEffect(() => {
    const timer = setInterval(async () => {
      await getNFTsAsync();
    }, refreshingTime * 1000);
    return () => clearInterval(timer);
  }, [walletAddr, collectionAddr]);

  return nfts;
};

const useOpenPopup = (url: string, name: string, specs: string) => {
  const popup = useRef<Window | null>(null);

  const openPopup = useCallback(() => {
    popup.current = window.open(url, name, specs);
  }, [url, name, specs]);

  return { openPopup, popup };
};

const useMint = (amount: number, selectedItems: any[], configFields: any) => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const items = selectedItems.map((item) => {
    return {
      id: item.token_id.toString(),
      qty: 1,
      price: item.price.toString(),
      name: item.name,
      image: item.image,
      description: item.description,
    };
  });

  console.log("items", items);

  const params = {
    amount: amount.toString(),
    envId: "123",
    fromCurrency: "USDC",
    fromContractAddress: configFields.erc20_contract_address,
    items: JSON.stringify(items),
  };

  const urlParams = new URLSearchParams(params).toString();

  const { openPopup } = useOpenPopup(
    `${window.location.origin}/mint-sale?${urlParams}`,
    "Mint",
    "width=430,height=650"
  );

  const handleMint = useCallback(async () => {
    setLoading(true);
    openPopup();
  }, [amount, configFields, selectedItems]);

  return { loading, receipt, handleMint };
};

function PrimarySale() {
  const fee = 0.1;
  const params = useURLParams();
  const [amount, setAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [configFields, setConfigFields] = useState<Record<string, any>>({});
  const [isApproved, setIsApproved] = useState(false);

  const [itemsPointer, setItemsPointer] = useState(1);

  const items = useItems(configFields.contract_address, itemsPointer) as any[];

  const nfts = useGetNfts(
    configFields.wallet_address || configFields.recipient_address,
    configFields.collection_address
  );

  // Reset the states of statuses if the selectedItems changes
  useEffect(() => {
    setIsApproved(false);
  }, [selectedItems]);

  useEffect(() => {
    setConfigFields(params);
  }, [params]);

  const { loading, receipt, handleMint } = useMint(
    amount,
    selectedItems,
    configFields
  );

  const handleIsSelectedItem = useCallback(
    (item: any) => {
      return selectedItems.some((selectedItem) => {
        return selectedItem.token_id === item.token_id;
      });
    },
    [selectedItems]
  );

  const handleSelectItem = useCallback(
    (item: any) => {
      let items;
      if (handleIsSelectedItem(item)) {
        items = selectedItems.filter((selectedItem) => {
          return selectedItem.token_id !== item.token_id;
        });
      } else {
        items = [...selectedItems, item];
      }

      const amount = items.reduce((acc, item) => {
        return acc + item.price;
      }, 0);

      setSelectedItems(items);
      setAmount(amount);
    },
    [handleIsSelectedItem]
  );

  const handleMintFormChange = useCallback(
    (label: string, value: string | number | boolean) => {
      setConfigFields((prev) => {
        return {
          ...prev,
          [label]: value,
        };
      });
    },
    []
  );

  return (
    <Box sx={{ padding: "base.spacing.x8" }}>
      <Grid fluid>
        <Banner variant="guidance" sx={{ marginBottom: "base.spacing.x4" }}>
          <Banner.Title> Order Price: ${amount} USDC</Banner.Title>
          <Banner.Caption>
            Fees (${fee * 100}%): ${amount * fee} USDC
          </Banner.Caption>
        </Banner>
        <Row>
          <Col xs={12} md={12} lg={4}>
            <Box sx={{ marginTop: "base.spacing.x4" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}>Mint Config</Heading>
              </Box>
              <ConfigForm
                fields={[
                  {
                    type: "text",
                    key: "contract_address",
                    label: "Multicaller Address",
                    hint: "Contract Address for Guarded Multicaller Contract",
                    placeholder: "0x...",
                    value: configFields.contract_address,
                  },
                  {
                    type: "text",
                    key: "recipient_address",
                    label: "Buyer Address",
                    hint: "Wallet address that will receive the NFTs",
                    placeholder: "0x...",
                    value: configFields.recipient_address,
                  },
                  {
                    type: "text",
                    key: "erc20_contract_address",
                    label: "ERC20 Contract Address",
                    hint: "Contract address for the ERC20 token to be used for payment",
                    placeholder: "0x...",
                    value: configFields.erc20_contract_address,
                  },
                  {
                    type: "text",
                    key: "fee_collection_address",
                    label: "Platform Fee Recipient Address",
                    hint: `Wallet address that will receive the platform fee (${
                      fee * 100
                    }% })`,
                    placeholder: "0x...",
                    value: configFields.fee_collection_address,
                  },
                  {
                    type: "text",
                    key: "sale_collection_address",
                    label: "Revenue Recipient Address",
                    hint: "Wallet address that will receive the sale revenue (amounts after platform fee)",
                    placeholder: "0x...",
                    value: configFields.sale_collection_address,
                  },
                ]}
                onChange={handleMintFormChange}
              />
              <Button
                size={"large"}
                sx={{
                  background: "base.gradient.1",
                  width: "100%",
                  marginTop: "base.spacing.x4",
                }}
                onClick={handleMint}
                disabled={amount === 0 || loading}
              >
                <Button.Icon
                  icon={amount ? "Wallet" : "Alert"}
                  iconVariant="regular"
                  sx={{
                    mr: "base.spacing.x1",
                    ml: "0",
                    width: "base.icon.size.400",
                  }}
                />
                {amount ? "Buy Now" : "Select items to purchase"}
              </Button>
            </Box>
          </Col>
          <Col xs={12} md={12} lg={8}>
            <Box>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}>Catalog</Heading>
              </Box>
              <ItemCards
                nfts={items}
                onClick={handleSelectItem}
                isSelected={handleIsSelectedItem}
                onRefetch={() => {
                  setItemsPointer((prev) => prev + 1);
                }}
              />
            </Box>
            <Box sx={{ marginTop: "base.spacing.x5" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}>Status</Heading>
              </Box>
              <Card>
                <Card.Caption>
                  <StatusCard
                    status="Approve Txn"
                    description={isApproved ? "✅" : ""}
                    variant={isApproved ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status="Minting"
                    description={receipt ? "Txn Hash | " + receipt : ""}
                    variant={receipt ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status={
                      receipt
                        ? receipt.status === 1
                          ? "Minted 🚀"
                          : "Not Minted - Failed 🧐 | "
                        : "Minted"
                    }
                    variant={
                      receipt
                        ? receipt.status === 1
                          ? "success"
                          : "fatal"
                        : "standard"
                    }
                    extraContent={
                      receipt ? (
                        <>
                          <Link
                            variant="primary"
                            sx={{ marginLeft: "base.spacing.x1" }}
                            onClick={() => {
                              window.open(
                                `https://immutable-testnet.blockscout.com/tx/${receipt}`,
                                "_blank"
                              );
                            }}
                          >
                            View on Block Explorer
                            <Link.Icon icon="JumpTo" />
                          </Link>
                        </>
                      ) : null
                    }
                  ></StatusCard>
                </Card.Caption>
              </Card>
            </Box>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12} lg={12}>
            <Box sx={{ marginTop: "base.spacing.x4" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Box sx={{ marginBottom: "base.spacing.x5" }}>
                  <Heading size={"small"}>List NFTs By Wallet Address</Heading>
                </Box>
                <ConfigForm
                  fields={[
                    {
                      type: "text",
                      key: "wallet_address",
                      label: "Wallet Address",
                      value: configFields.wallet_address
                        ? configFields.wallet_address
                        : configFields.recipient_address,
                    },
                    {
                      type: "text",
                      key: "collection_address",
                      label: "Collection Address",
                      value: configFields.collection_address,
                    },
                  ]}
                  onChange={handleMintFormChange}
                />
              </Box>
              <ItemCards nfts={nfts} />
            </Box>
          </Col>
        </Row>
      </Grid>
    </Box>
  );
}

export default PrimarySale;
