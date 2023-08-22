import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Heading, Banner, Button, Card, Link } from "@biom3/react";

import { Grid, Row, Col } from "react-flexbox-grid";

import { encodeApprove } from "../contracts/erc20";
import { useMetamaskProvider } from "../MetamaskProvider";
import { usePassportProvider } from "../context/PassportProvider";
import ItemCards from "../components/ItemCards";
import StatusCard from "../components/StatusCard";
import ConfigForm from "../components/ConfigForm";
import { useData } from "../context/DataProvider";
import { TransactionReceipt } from "@ethersproject/providers";

interface MintResponse {
  tx_id: string;
}

const useURLParams = () => {
  const [urlParams, setUrlParams] = useState({});
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    setUrlParams(params);
  }, []);

  return urlParams;
};

const useMint = (selectedItems: any[], amount: number, config = {}) => {
  const [response, setResponse] = useState<MintResponse | null>(null);
  const [error, setError] = useState(null);

  const fields = [
    "contract_address",
    "recipient_address",
    "erc20_contract_address",
    "fee_collection_address",
    "sale_collection_address",
  ];
  const params = Object.keys(config)
    .filter((key) => fields.includes(key))
    .reduce(
      (obj, key) => ({ ...obj, [key]: (config as Record<string, any>)[key] }),
      {}
    );

  const mint = useCallback(async () => {
    const data = {
      ...params,
      amount,
      items: selectedItems.map((item) => ({
        collection_address: item.contract_address,
        token_id: item.token_id.toString(),
      })),
    };

    try {
      const response = await fetch(
        "https://game-primary-sales.sandbox.imtbl.com/v1/games/pokemon/mint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const json = await response.json();
      setResponse(json);
    } catch (error) {
      setError(error as any);
    }
  }, [selectedItems, amount, config]);

  return { mint, response, error };
};

const useItems = () => {
  const once = useRef(true);
  const [items, setItems] = useState<any[]>([]);

  const getItems = useCallback(async () => {
    once.current = false;

    const size = 721; // number of pre generated NFT metadata
    try {
      const items$ = Array.from({ length: size }, (_, i) => i + 1).map(
        async (id) => {
          const response = await fetch(
            `https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/metadata/${id}`,
            { method: "GET" }
          );
          const json = await response.json();

          const price = Math.floor(Math.random() * 25) + 1;

          return {
            token_id: id,
            name: json.name,
            image: json.image,
            contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
            price: price,
            description: `USDC \$${price}`,
          };
        }
      );

      const _items = await Promise.all(items$);

      setItems(_items);
    } catch (error) {}
  }, []);

  useEffect(() => {
    once.current && getItems();
  }, []);

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

function PrimarySale() {
  const fee = 0.1;
  const params = useURLParams();
  const [amount, setAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [configFields, setConfigFields] = useState<Record<string, any>>({});
  const [approved, setApproved] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [mintResponse, setMintResponse] = useState<MintResponse | null>(null);

  const items = useItems() as any[];
  const {
    mm_connect,
    mm_sendTransaction,
    mm_loading,
    address,
    mm_getTransactionReceipt,
  } = useMetamaskProvider();

  const { sendTx } = usePassportProvider();

  const loading = mm_loading;

  let { mint, response } = useMint(selectedItems, amount, configFields);

  const nfts = useGetNfts(
    configFields.wallet_address || configFields.recipient_address,
    configFields.collection_address
  );

  // Reset the states of statuses if the selectedItems changes
  useEffect(() => {
    setApproved(false);
    setMintResponse(null);
    setReceipt(null);
  }, [selectedItems]);

  useEffect(() => {
    setMintResponse(response);

    if (response?.tx_id) {
      const interval = setInterval(async () => {
        try {
          const receipt = await mm_getTransactionReceipt(response!.tx_id);
          console.log("polling status ", receipt);

          // if receipt is null means the transaction is still pending, no status yet
          if (receipt) {
            // stop polling when we receive a status either success or fail
            if (receipt.status === 1 || receipt.status === 0) {
              setReceipt(receipt);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [response, mm_getTransactionReceipt]);

  useEffect(() => {
    setConfigFields(params);
  }, [params]);

  const setApprove = useCallback(
    async (amount: number, walletType: "MM" | "Passport"): Promise<boolean> => {
      console.log("🚀 ~ file: PrimarySale.tsx:163 ~ amount:", amount);
      if (!configFields.erc20_contract_address) {
        throw new Error("ERC20 contract address not defined!");
      }
      if (!configFields.contract_address) {
        throw new Error("Guarded multicaller contract address not defined!");
      }

      try {
        const txData = encodeApprove(
          configFields.contract_address,
          `${amount}`
        );
      
        const execute = walletType === "MM" ? mm_sendTransaction : sendTx;
        const approved = await execute(
          configFields.erc20_contract_address,
          txData
        );
      
        console.log("@@@ txData", txData);
        return approved;
      } catch (error) {
        console.error("An error occurred:", error);
        return false;
      }
    },
    [mm_sendTransaction, configFields]
  );

  const handleMint = useCallback(
    (walletType: "MM" | "Passport") => async () => {
      setApproved(false);
      setMintResponse(null);
      setReceipt(null);

      const approved = await setApprove(amount, walletType);
      if (approved) {
        mint();
        setApproved(true);
      }
    },
    [mint, amount]
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
            <Button
              size={"large"}
              sx={{
                background: "base.color.status.attention.bright",
                width: "100%",
              }}
              onClick={() => {
                mm_connect();
              }}
              disabled={loading}
            >
              <Button.Icon
                icon={loading ? "Loading" : "WalletConnect"}
                iconVariant="bold"
                sx={{
                  mr: "base.spacing.x1",
                  ml: "0",
                  width: "base.icon.size.400",
                }}
              />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
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
                  background: "base.color.status.attention.bright",
                  width: "100%",
                  marginTop: "base.spacing.x4",
                }}
                onClick={handleMint("MM")}
                disabled={amount === 0 || loading}
              >
                <Button.Icon
                  icon={loading ? "Loading" : amount ? "Minting" : "Alert"}
                  iconVariant="regular"
                  sx={{
                    mr: "base.spacing.x1",
                    ml: "0",
                    width: "base.icon.size.400",
                  }}
                />
                {loading
                  ? "Please wait..."
                  : amount
                  ? `Approve ${amount} USDC with MM`
                  : "Select items to purchase"}
              </Button>
              <Button
                size={"large"}
                sx={{
                  background: "base.gradient.1",
                  width: "100%",
                  marginTop: "base.spacing.x4",
                }}
                onClick={handleMint("Passport")}
                disabled={amount === 0 || loading}
              >
                <Button.Icon
                  icon={loading ? "Loading" : amount ? "Wallet" : "Alert"}
                  iconVariant="regular"
                  sx={{
                    mr: "base.spacing.x1",
                    ml: "0",
                    width: "base.icon.size.400",
                  }}
                />
                {loading
                  ? "Please wait..."
                  : amount
                  ? `Approve ${amount} USDC with Passport`
                  : "Select items to purchase"}
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
              />
            </Box>
            <Box sx={{ marginTop: "base.spacing.x5" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}>Status</Heading>
              </Box>
              <Card>
                <Card.Caption>
                  <StatusCard
                    status="Connect Wallet"
                    description={"| " + address}
                    variant={address ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status="Approve Txn"
                    description={approved ? "✅" : ""}
                    variant={approved ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status="Minting"
                    description={
                      mintResponse ? "Txn Hash | " + mintResponse.tx_id : ""
                    }
                    variant={mintResponse ? "success" : "standard"}
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
                                `https://immutable-testnet.blockscout.com/tx/${mintResponse?.tx_id}`,
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
