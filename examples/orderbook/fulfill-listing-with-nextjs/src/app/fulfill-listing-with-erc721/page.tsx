"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { ProviderEvent } from "@imtbl/sdk/passport";
import { passportInstance } from "../utils/setupPassport";
import { orderbookSDK } from "../utils/setupOrderbook";
import {
  Box,
  FormControl,
  Heading,
  TextInput,
  Select,
  Grid,
  Button,
  LoadingOverlay,
  Link,
  Table,
} from "@biom3/react";
import NextLink from "next/link";
import { orderbook } from "@imtbl/sdk";
import { OrderStatusName } from "@imtbl/sdk/orderbook";

export default function FulfillERC721WithPassport() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // setup the loading text to display while loading
  const [loadingText, setLoadingText] = useState<string>("");

  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // create the Web3Provider using the Passport provider
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);

  // create the signer using the Web3Provider
  const signer = web3Provider.getSigner();

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string | null>(null);

  // setup the buy item type state
  const [buyItemType, setBuyItemTypeState] = useState<"NATIVE" | "ERC20">(
    "NATIVE",
  );

  // save the listings state
  const [listings, setListingsState] = useState<orderbook.Listing[]>([]);

  // setup the listing creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the listing creation error message state
  const [errorMessage, setErrorMessageState] = useState<string | null>(null);

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // disable button while loading
      setLoadingState(true);
      setLoadingText("Connecting to Passport");

      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({
        method: "eth_requestAccounts",
      });

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // reset info msg state
      resetMsgState();
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
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
      [
        {
          amount: "1000000", // Insert taker ecosystem/marketplace fee here
          recipientAddress: "0x0000000000000000000000000000000000000000", // Replace address with your own marketplace address
        },
      ],
    );

    for (const action of actions) {
      if (action.type === orderbook.ActionType.TRANSACTION) {
        const builtTx = await action.buildTransaction();
        await signer.sendTransaction(builtTx);
      }
    }
  };
  // #enddoc fulfill-erc721-listing

  return (
    <Box sx={{ marginBottom: "base.spacing.x5" }}>
      <Box sx={{ marginTop: "base.spacing.x10" }}>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Passport
        </Heading>
        <Grid>
          {accountsState.length === 0 ? (
            <Box sx={{ marginBottom: "base.spacing.x5" }}>
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "50%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={passportLogin}
              >
                Login
              </Button>
            </Box>
          ) : null}
          {accountsState.length >= 1 ? (
            <Box sx={{ marginBottom: "base.spacing.x5" }}>
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "50%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={passportLogout}
              >
                Logout
              </Button>
            </Box>
          ) : null}
          {loading ? (
            <LoadingOverlay visible>
              <LoadingOverlay.Content>
                <LoadingOverlay.Content.LoopingText
                  text={[loadingText]}
                  textDuration={1000}
                />
              </LoadingOverlay.Content>
            </LoadingOverlay>
          ) : (
            <Box sx={{ marginBottom: "base.spacing.x5" }}>
              Connected Account:
              {accountsState.length >= 1 ? accountsState : "(not connected)"}
            </Box>
          )}
        </Grid>
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
        <Grid>
          <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
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
        </Grid>
      </Box>
        {listings && listings.length > 0 ? (
          <Box sx={{ maxHeight: "800px", marginBottom: "base.spacing.x5" }}>
            <Table sx={{ marginLeft: "base.spacing.x5", maxWidth: "1300px", maxHeight: "400px", overflowY: "auto", marginBottom: "base.spacing.x5"}}>
            <Table.Head>
              <Table.Row>
                <Table.Cell>SNO</Table.Cell>
                <Table.Cell>Listing ID</Table.Cell>
                <Table.Cell>Contract Address</Table.Cell>
                <Table.Cell>Token ID</Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {listings.map((listing: orderbook.Listing, index: number) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{listing.id}</Table.Cell>
                    <Table.Cell>{listing.sell[0].contractAddress}</Table.Cell>
                    <Table.Cell>{listing.sell[0].tokenId}</Table.Cell>
                    <Table.Cell>
                      <Button
                        size="medium"
                        variant="primary"
                        disabled={loading}
                        onClick={() => executeTrade(listing.id)}
                      >
                        Buy
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
