"use client";

import { useEffect, useMemo, useState } from "react";
import { Provider, ProviderEvent } from "@imtbl/sdk/passport";
import { passportInstance } from "../utils/setupPassport";
import { orderbookSDK } from "../utils/setupOrderbook";
import {
  Body,
  Box,
  Button,
  FormControl,
  Grid,
  Heading,
  Link,
  LoadingOverlay,
  Select,
  Stack,
  Table,
  TextInput,
} from "@biom3/react";
import { orderbook } from "@imtbl/sdk";
import { OrderStatusName } from "@imtbl/sdk/orderbook";
import { BrowserProvider } from "ethers";
import { JsonRpcSigner } from "ethers";
import NextLink from "next/link";

export default function FulfillERC721WithPassport() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // setup the loading text to display while loading
  const [loadingText, setLoadingText] = useState<string>("");

  // fetch the Passport provider from the Passport instance
  const [passportProvider, setPassportProvider] = useState<Provider>();

  useEffect(() => {
    const fetchPassportProvider = async () => {
      const passportProvider = await passportInstance.connectEvm();
      setPassportProvider(passportProvider);
    };
    fetchPassportProvider();
  }, []);

  // create the BrowserProvider using the Passport provider
  const browserProvider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);

  // create the signer using the BrowserProvider
  const [signer, setSigner] = useState<JsonRpcSigner>();

  useEffect(() => {
    const fetchSigner = async () => {
      const signer = await browserProvider?.getSigner();
      setSigner(signer);
    };
    fetchSigner();
  }, [browserProvider]);

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string | null>(null);

  // setup the buy item type state
  const [buyItemType, setBuyItemTypeState] = useState<"NATIVE" | "ERC20">(
    "NATIVE",
  );

  // setup the taker ecosystem fee recipient state
  const [takerEcosystemFeeRecipient, setTakerEcosystemFeeRecipientState] = useState<string>("");

  // setup the taker ecosystem fee amount state
  const [takerEcosystemFeeAmount, setTakerEcosystemFeeAmountState] = useState<string>("");

  // save the listings state
  const [listings, setListingsState] = useState<orderbook.Listing[]>([]);

  // setup the listing creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the listing creation error message state
  const [errorMessage, setErrorMessageState] = useState<string | null>(null);

  const passportLogin = async () => {
    if (browserProvider?.send) {
      // disable button while loading
      setLoadingState(true);
      setLoadingText("Connecting to Passport");

      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // reset info msg state
      resetMsgState();
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider?.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    setLoadingText("Logging out");
    // reset the account state
    setAccountsState([]);
    // reset info msg state
    resetMsgState();
    // logout from passport
    await passportInstance.logout();
  };

  const resetMsgState = () => {
    setSuccessMessageState(null);
    setErrorMessageState(null);
  };

  // state change handlers
  const handleSellItemContractAddressChange = (event: any) => {
    resetMsgState();

    const sellContractAddrsVal =
      event.target.value === "" ? null : event.target.value;
    setSellItemContractAddressState(sellContractAddrsVal);
  };

  const handleBuyItemTypeChange = (val: any) => {
    resetMsgState();

    setBuyItemTypeState(val);
  };

  const handleTakerEcosystemFeeRecipientChange = (event: any) => {
    setTakerEcosystemFeeRecipientState(event.target.value);
  };

  const handleTakerEcosystemFeeAmountChange = (event: any) => {
    setTakerEcosystemFeeAmountState(event.target.value);
  };

  const getListings = async (
    client: orderbook.Orderbook,
    sellItemContractAddress?: string,
    buyItemType?: "NATIVE" | "ERC20",
  ): Promise<orderbook.Listing[]> => {
    let params: orderbook.ListListingsParams = {
      pageSize: 50,
      sortBy: "created_at",
      status: OrderStatusName.ACTIVE,
      sellItemContractAddress,
      buyItemType,
    };
    const listings = await client.listListings(params);
    return listings.result;
  };

  // memoize the listings fetch
  useMemo(async () => {
    const listings = await getListings(
      orderbookSDK,
      sellItemContractAddress == null ? undefined : sellItemContractAddress,
      buyItemType,
    );
    const filtered = listings.filter(
      (listing) =>
        listing.accountAddress !== accountsState[0] &&
        listing.sell[0].type === "ERC721",
    );
    setListingsState(filtered.slice(0, 10));
  }, [accountsState, sellItemContractAddress, buyItemType]);

  const executeTrade = async (listingID: string) => {
    if (accountsState.length === 0) {
      setErrorMessageState("Please connect your wallet first");
      return;
    }

    resetMsgState();
    setLoadingState(true);
    setLoadingText("Fulfilling listing");

    try {
      await fulfillERC721Listing(listingID);
      setSuccessMessageState(`Listing filled successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessageState(message);
    }

    setLoadingState(false);
  };

  // #doc fulfill-erc721-listing
  // Fulfill ERC721 listing
  const fulfillERC721Listing = async (listingID: string) => {
    const { actions } = await orderbookSDK.fulfillOrder(
      listingID,
      accountsState[0],
      takerEcosystemFeeRecipient != "" ? [{
        recipientAddress: takerEcosystemFeeRecipient, // Replace address with your own marketplace address
        amount: takerEcosystemFeeAmount, // Insert taker ecosystem/marketplace fee here
      }] : [],
    );

    for (const action of actions) {
      if (action.type === orderbook.ActionType.TRANSACTION) {
        const builtTx = await action.buildTransaction();
        await signer?.sendTransaction(builtTx);
      }
    }
  };
  // #enddoc fulfill-erc721-listing

  return (
    <Box sx={{ marginBottom: "base.spacing.x5" }}>
      <LoadingOverlay visible={loading}>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText
            text={[loadingText]}
            textDuration={1000}
          />
        </LoadingOverlay.Content>
      </LoadingOverlay>
      <Box sx={{ marginBottom: "base.spacing.x10" }}>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Passport
        </Heading>
        <Stack direction="row" justifyContent={"space-between"}>
          <Box sx={{ marginBottom: "base.spacing.x5" }}>
            {accountsState.length === 0 ? (
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={passportLogin}
              >
                Login
              </Button>
            ) : (
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "90%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={passportLogout}
              >
                Logout
              </Button>
            )}
          </Box>
          <Box sx={{ marginBottom: "base.spacing.x5", marginTop: "base.spacing.x1", textAlign: "right" }}>
            <div>
              <Body size="small" weight="bold">Connected Account:</Body>
            </div>
            <div>
              <Body size="xSmall" mono={true}>{accountsState.length >= 1 ? accountsState : "(not connected)"}</Body>
            </div>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Fulfill Listing - ERC721 Fulfillment
        </Heading>
        {successMessage ? (
          <Box
            sx={{
              color: "green",
              fontSize: "15",
              marginBottom: "base.spacing.x5",
            }}
          >
            {successMessage}
          </Box>
        ) : null}
        {errorMessage ? (
          <Box
            sx={{
              color: "red",
              fontSize: "15",
              marginBottom: "base.spacing.x5",
              maxWidth: "1300px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {errorMessage}
          </Box>
        ) : null}
      </Box>
      <Box>
        <Stack direction="row">
          <FormControl sx={{ marginBottom: "base.spacing.x5", width: "415px" }}>
            <FormControl.Label>NFT Contract Address</FormControl.Label>
            <TextInput onChange={handleSellItemContractAddressChange} />
          </FormControl>
          <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
            <FormControl.Label>Currency Type</FormControl.Label>
            <Select
              size="medium"
              defaultOption="Native"
              onSelectChange={handleBuyItemTypeChange}
            >
              <Select.Option optionKey={"NATIVE"}>
                <Select.Option.Icon icon="ImxToken" />
                <Select.Option.Label>Native</Select.Option.Label>
                <Select.Option.Caption>Native Currency</Select.Option.Caption>
              </Select.Option>
              <Select.Option optionKey={"ERC20"}>
                <Select.Option.Icon icon="Tokens" />
                <Select.Option.Label>ERC20</Select.Option.Label>
                <Select.Option.Caption>ERC20 Tokens</Select.Option.Caption>
              </Select.Option>
            </Select>
          </FormControl>
        </Stack>
      </Box>
      <Box>
        <Heading size="xSmall" sx={{ marginBottom: "base.spacing.x5" }}>
          Taker Ecosystem Fee
        </Heading>
        <Stack direction="row">
          <FormControl sx={{ marginBottom: "base.spacing.x5", width: "415px" }}>
            <FormControl.Label>Recipient Address</FormControl.Label>
            <TextInput onChange={handleTakerEcosystemFeeRecipientChange} />
          </FormControl>
          <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
            <FormControl.Label>Fee Amount</FormControl.Label>
            <TextInput onChange={handleTakerEcosystemFeeAmountChange} />
          </FormControl>
        </Stack>
      </Box>
      {listings && listings.length > 0 ? (
        <Box sx={{ maxHeight: "800px", marginBottom: "base.spacing.x5" }}>
          <Table sx={{ maxWidth: "1500px", width: "100%", maxHeight: "400px", overflowY: "auto", marginBottom: "base.spacing.x5"}}>
            <Table.Head>
              <Table.Row>
                <Table.Cell sx={{ padding: "base.spacing.x2" }}>SNO</Table.Cell>
                <Table.Cell sx={{ padding: "base.spacing.x2" }}>Listing ID</Table.Cell>
                <Table.Cell sx={{ padding: "base.spacing.x2" }}>Contract Address</Table.Cell>
                <Table.Cell sx={{ padding: "base.spacing.x2" }}>Token ID</Table.Cell>
                <Table.Cell sx={{ padding: "base.spacing.x2" }}></Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {listings.map((listing: orderbook.Listing, index: number) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell sx={{ paddingLeft: "base.spacing.x5", paddingRight: "base.spacing.x2", paddingY: "base.spacing.x5" }}><Body mono={true} size="small">{index + 1}</Body></Table.Cell>
                    <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}><Body mono={true} size="small">{listing.id}</Body></Table.Cell>
                    <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}><Body mono={true} size="small">{listing.sell[0].contractAddress}</Body></Table.Cell>
                    <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}><Body mono={true} size="small">{listing.sell[0].tokenId}</Body></Table.Cell>
                    <Table.Cell sx={{ paddingLeft: "base.spacing.x2", paddingRight: "base.spacing.x5", paddingY: "base.spacing.x2" }}>
                      <Button
                        size="small"
                        variant="primary"
                        disabled={loading}
                        onClick={() => executeTrade(listing.id)}
                      >
                        Submit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Box>
      ) : null}
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
