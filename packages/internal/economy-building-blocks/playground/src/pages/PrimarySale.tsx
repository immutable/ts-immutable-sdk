import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Heading,
  Button,
  Card,
  Link,
  Body,
  MenuItem,
  Icon,
} from "@biom3/react";

import { Grid, Row, Col } from "react-flexbox-grid";

import ItemCards from "../components/ItemCards";
import StatusCard from "../components/StatusCard";
import ConfigForm from "../components/ConfigForm";
import { useData } from "../context/DataProvider";
import { PrimaryRevenueEventType } from "@imtbl/checkout-widgets";
import { config, passport } from "@imtbl/sdk";

const approveFunction = "approve(address spender,uint256 amount)";
const executeFunction =
  "execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)";

const passportConfig = {
  environment: "sandbox",
  clientId: "yBoJyIcgPv0ixCP867Glbw8D3DfkMkE6",
  redirectUri: "http://localhost:3000/sale?login=true",
  logoutRedirectUri: "http://localhost:3000/sale?logout=true",
  audience: "platform_api",
  scope: "openid offline_access email transact",
};

const usePassportInstance = (passportConfig: any) => {
  const {
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
  } = passportConfig;

  if (!clientId || !redirectUri || !logoutRedirectUri || !audience || !scope) {
    return null;
  }

  const passportInstance = new passport.Passport({
    baseConfig: new config.ImmutableConfiguration({
      environment: environment || config.Environment.SANDBOX,
    }),
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
  });

  return passportInstance;
};

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
          const price = Math.round((Math.random() * 3 + 0.1) * 100) / 1000;

          return {
            productId: `P${id.toString().padStart(4, "0")}`,
            token_id: id,
            name: json.name,
            image: json.image,
            contract_address,
            price: price,
            description: json.description,
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

const useOpenPopup = (
  url: string,
  name: string,
  specs: string,
  passportOn: boolean
) => {
  const popup = useRef<Window | null>(null);
  const passportInstance = usePassportInstance(passportConfig);

  const openPopup = useCallback(() => {
    if (passportOn) {
      (window as unknown as any).sharedData = { passportInstance };
    }

    popup.current = window.open(url, name, specs);
  }, [url, name, specs]);

  const closePopup = useCallback(() => {
    if (popup.current && !popup.current.closed) {
      // popup.current.close();
    }
  }, []);

  return { openPopup, closePopup, popup };
};

const useMint = (
  amount: number,
  selectedItems: any[],
  configFields: any,
  passportOn: boolean
) => {
  const [loading, setLoading] = useState(false);

  const items = selectedItems.map((item) => ({
    productId: item.productId.toString(),
    qty: item.quantity,
    name: item.name,
    image: item.image,
    description: item.description,
  }));

  const params = {
    amount: amount.toString(),
    env: configFields.env,
    environmentId: configFields.environmentId,
    fromContractAddress: configFields.fromContractAddress,
    products: btoa(JSON.stringify(items)),
  };

  const urlParams = new URLSearchParams(params).toString();

  const { openPopup, closePopup } = useOpenPopup(
    `${window.location.origin}/mint-sale?${urlParams}`,
    "Mint",
    "width=430,height=650",
    passportOn
  );

  const handleMint = useCallback(async () => {
    setLoading(true);
    openPopup();
  }, [amount, configFields, selectedItems]);

  return { loading, handleMint, closePopup };
};

function PrimarySale() {
  const fee = 0.1;
  const params = useURLParams() as any;
  const login = params.login;
  const passportInstance = usePassportInstance(passportConfig);

  const [amount, setAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [configFields, setConfigFields] = useState<Record<string, any>>({});
  const [approvedTx, setApprovedTx] = useState("");
  const [executedTx, setExecutedTx] = useState("");
  const [passportOn, setPassportOn] = useState<boolean>(true);
  const [receipt, setReceipt] = useState<any | null>(null);

  const [itemsPointer, setItemsPointer] = useState(1);

  const items = useItems(configFields.contract_address, itemsPointer) as any[];

  const nfts = useGetNfts(
    configFields.wallet_address || configFields.recipient_address,
    configFields.collection_address
  );

  useEffect(() => {
    if (!passportInstance || !executedTx) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const zkEvmProvider = await passportInstance.connectEvm();
        const currentReceipt = await zkEvmProvider.request({
          method: "eth_getTransactionReceipt",
          params: [executedTx],
        });

        setReceipt(currentReceipt);

        if (currentReceipt) {
          if (currentReceipt.status === "0x1") {
            console.log("Transaction was successfully minted.");
            clearInterval(intervalId);
          } else if (currentReceipt.status === "0x0") {
            console.log("Transaction failed during execution.");
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error fetching transaction receipt", error);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [executedTx]);

  useEffect(() => {
    if (passportInstance) {
      passportInstance.loginCallback();
    }
  }, [login]);

  // Reset the states of statuses if the selectedItems changes
  useEffect(() => {
    setApprovedTx("");
    setExecutedTx("");
    setReceipt(null);
  }, [selectedItems]);

  useEffect(() => {
    setConfigFields(params);
  }, [params]);

  const handleEvent = ((event: MessageEvent<any>) => {
    if (
      !event.data ||
      typeof event.data !== "object" ||
      !("type" in event.data) ||
      !("data" in event.data) ||
      !("identifier" in event.data)
    ) {
      return;
    }
    console.log("@@@@ event from popup", event);

    const { data, identifier } = event.data;

    if (identifier !== "primary-revenue-widget-events") {
      return;
    }

    switch (data.type) {
      case PrimaryRevenueEventType.CLOSE_WIDGET: {
        console.log("@@@ close widget");
        closePopup();
        break;
      }
      case PrimaryRevenueEventType.SUCCESS: {
        console.log("@@@ sucess event", data);
        setApprovedTx(data.data[approveFunction]);
        setExecutedTx(data.data[executeFunction]);

        closePopup();
        break;
      }
      case "imtbl-connect-widget-success": {
        setConfigFields((prev) => ({
          ...prev,
          wallet_address: data.walletAddress,
        }));

        break;
      }
      default:
        console.log("Does not match any expected event type");
    }
  }) as EventListener;

  useEffect(() => {
    window.addEventListener("message", handleEvent);

    return () => {
      window.removeEventListener("message", handleEvent);
    };
  }, []);

  const { loading, handleMint, closePopup } = useMint(
    amount,
    selectedItems,
    configFields,
    passportOn
  );

  const handleIsSelectedItem = useCallback(
    (item: any) => {
      return selectedItems.some((selectedItem) => {
        return selectedItem.productId === item.productId;
      });
    },
    [selectedItems]
  );

  const handleSelectItem = useCallback(
    (item: any, quantity: number) => {
      let items = selectedItems.filter((selectedItem) => {
        return selectedItem.token_id !== item.token_id;
      });

      if (handleIsSelectedItem(item)) {
        // Find the existing item and update its quantity
        const existingItem = selectedItems.find(
          (selectedItem) => selectedItem.token_id === item.token_id
        );
        if (existingItem) {
          existingItem.quantity = quantity + existingItem.quantity;
          items = [...items, existingItem];
        }
      } else {
        // If the item does not exist, add it with the quantity field
        items = [...items, { ...item, quantity }];
      }

      const amount = items.reduce((acc, currentItem) => {
        return acc + currentItem.price * currentItem.quantity;
      }, 0);

      setSelectedItems(items);
      setAmount(amount);
      console.log("@@@@ selected items", items);
      console.log("@@@@ amount", amount);
    },
    [handleIsSelectedItem, selectedItems]
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
        <Row>
          <Col xs={12} md={12} lg={4}>
            <Box sx={{ marginTop: "base.spacing.x5" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}>Status</Heading>
              </Box>
              <Card>
                <Card.Caption>
                  <StatusCard
                    status="Approve Txn"
                    description={approvedTx ? `${approvedTx} ✅` : ""}
                    variant={approvedTx ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status="Execute Txn"
                    description={executedTx ? `${executedTx} ✅` : ""}
                    variant={executedTx ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status="Minting"
                    variant={executedTx ? "success" : "standard"}
                  ></StatusCard>
                  <StatusCard
                    status={
                      receipt
                        ? parseInt(receipt.status) === 1
                          ? "Minted 🚀"
                          : "Not Minted - Failed 🧐 | "
                        : "Minted"
                    }
                    variant={
                      receipt
                        ? parseInt(receipt.status) === 1
                          ? "success"
                          : "fatal"
                        : "standard"
                    }
                    extraContent={
                      executedTx ? (
                        <>
                          <Link
                            variant="primary"
                            sx={{ marginLeft: "base.spacing.x1" }}
                            onClick={() => {
                              window.open(
                                `https://explorer.testnet.immutable.com/tx/${executedTx}`,
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
            <Box sx={{ marginTop: "base.spacing.x5" }}>
              <Box sx={{ marginBottom: "base.spacing.x5" }}>
                <Heading size={"small"}> My Cart</Heading>
              </Box>

              <Card sx={{ height: "100%" }}>
                <Card.Caption>
                  {selectedItems && selectedItems.length ? (
                    selectedItems.map((item) => (
                      <MenuItem emphasized size="small">
                        <MenuItem.FramedImage imageUrl={item.image} />
                        <MenuItem.Label>
                          {item.name} x {item.quantity}
                        </MenuItem.Label>
                        <MenuItem.Caption>{item.description}</MenuItem.Caption>
                        {item.price && (
                          <MenuItem.PriceDisplay
                            price={item.price.toString()}
                            currencyImageUrl="https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg"
                          />
                        )}
                      </MenuItem>
                    ))
                  ) : (
                    <Body>No items selected</Body>
                  )}
                  <br />
                  {selectedItems.length ? (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Heading size={"small"}>Subtotal</Heading>
                        <Body> ${amount} USDC</Body>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Heading size={"small"}>
                          Total (+ fees {fee * 100}%):
                        </Heading>
                        ${amount * fee} USDC
                      </Box>
                    </>
                  ) : null}
                </Card.Caption>
              </Card>
            </Box>
          </Col>
          <Col xs={12} md={12} lg={8}>
            <Box>
              <Box
                sx={{
                  marginTop: "base.spacing.x4",
                  display: "flex",
                  justifyContent: "end",
                }}
              >
                <Button
                  size={"medium"}
                  sx={{
                    background: "base.color.accent.8",
                    width: "20%",
                    marginTop: "base.spacing.x4",
                  }}
                  onClick={() => setPassportOn((prev) => !prev)}
                >
                  <Button.Icon
                    icon={"Wallet"}
                    iconVariant="regular"
                    sx={{
                      mr: "base.spacing.x1",
                      ml: "0",
                      width: "base.icon.size.400",
                    }}
                  />
                  {passportOn ? "Disable Passport" : "Enable Passport"}
                </Button>
              </Box>
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
                withQtySelector
              />
            </Box>
            <Box sx={{ marginTop: "base.spacing.x4" }}>
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
