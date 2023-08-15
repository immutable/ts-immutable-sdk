import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Box, Heading, Body, Banner, Button } from "@biom3/react";

import { Grid, Row, Col } from "react-flexbox-grid";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";

import { encodeApprove } from "../contracts/erc20";
import { useMetamaskProvider } from "../MetamaskProvider";
import ItemCards from "../components/ItemCards";
import ConfigForm from "../components/ConfigForm";

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
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const mint = useCallback(async () => {
    const data = {
      ...config,
      amount,
      items: selectedItems.map((item) => ({
        contract_address: item.contract_address,
        token_id: item.token_id,
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

const useItems = (): Array<
  Pick<
    NFT,
    "token_id" | "name" | "image" | "contract_address" | "description"
  > & {
    price: number;
  }
> => {
  return [
    {
      token_id: "59464",
      name: "Item 59464",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 5,
      description: "$USDC 5",
    },
    {
      token_id: "53538",
      name: "Item 53538",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/002.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 10,
      description: "$USDC 10",
    },
    {
      token_id: "4767",
      name: "Item 47674",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/003.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 15,
      description: "$USDC 15",
    },
    {
      token_id: "78567",
      name: "Item 78567",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 5,
      description: "$USDC 5",
    },
    {
      token_id: "36018",
      name: "Item 36018",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/005.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 10,
      description: "$USDC 10",
    },
    {
      token_id: "60250",
      name: "Item 60250",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 15,
      description: "$USDC 15",
    },
    {
      token_id: "1016",
      name: "Item 10164",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 5,
      description: "$USDC 5",
    },
    {
      token_id: "55696",
      name: "Item 55696",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/008.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 10,
      description: "$USDC 10",
    },
    {
      token_id: "94898",
      name: "Item 94898",
      image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/009.png",
      contract_address: "0xbb0FBc170E2cF13368c60A2B7fD7C6dA4a86b6C8",
      price: 15,
      description: "$USDC 15",
    },
  ];
};

function PrimarySale() {
  const fee = 0.1;
  const params = useURLParams();
  const [amount, setAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [configFields, setConfigFields] = useState<Record<string, any>>({});

  const items = useItems() as any[];
  const { mm_connect, mm_sendTransaction } = useMetamaskProvider();

  const { mint } = useMint(selectedItems, amount, configFields);

  useEffect(() => {
    setConfigFields(params);
  }, [params]);

  const setApprove = useCallback(
    async (amount: number): Promise<boolean> => {
      console.log("🚀 ~ file: PrimarySale.tsx:163 ~ amount:", amount)
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
        const approved = await mm_sendTransaction(
          configFields.erc20_contract_address,
          txData
        );
        return approved;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    [mm_sendTransaction, configFields]
  );

  const handleMint = useCallback(async () => {
    const approved = await setApprove(amount);
    if (approved) {
      mint();
    }
  }, [mint, amount]);

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

  const handleFormChange = useCallback(
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
            >
              <Button.Icon
                icon="WalletConnect"
                iconVariant="bold"
                sx={{
                  mr: "base.spacing.x1",
                  ml: "0",
                  width: "base.icon.size.400",
                }}
              />
              Connect with Metamask
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
                onChange={handleFormChange}
              />
              <Button
                size={"large"}
                sx={{ background: "base.gradient.1", width: "100%" }}
                onClick={handleMint}
                disabled={amount === 0}
              >
                <Button.Icon
                  icon={amount ? "Minting" : "Alert"}
                  iconVariant="regular"
                  sx={{
                    mr: "base.spacing.x1",
                    ml: "0",
                    width: "base.icon.size.400",
                  }}
                />
                {amount ? `Approve ${amount} USDC` : "Select Items"}
              </Button>
            </Box>
          </Col>
          <Col xs={12} md={12} lg={8}>
            <ItemCards
              nfts={items}
              onClick={handleSelectItem}
              isSelected={handleIsSelectedItem}
            />
          </Col>
        </Row>
      </Grid>
    </Box>
  );
}

export default PrimarySale;
