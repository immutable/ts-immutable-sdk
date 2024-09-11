"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ProviderEvent } from "@imtbl/sdk/passport";
import { passportInstance } from "../utils/setupPassport";
import { orderbookSDK } from "../utils/setupOrderbook";
import {
  signAndSubmitApproval,
  signListing,
  createListing,
} from "@/app/utils/listing";
import {
  Box,
  Select,
  TextInput,
  FormControl,
  Heading,
  Grid,
  Button,
  LoadingOverlay,
  Link,
} from "@biom3/react";
import { orderbook } from "@imtbl/sdk";
import {
  ERC721Item,
  NativeItem,
  ERC20Item,
  PrepareListingParams,
} from "@imtbl/sdk/orderbook";
import NextLink from "next/link";

export default function CreateERC721ListingWithPassport() {
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

  // setup the state for the ERC721 listing creation form elements

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string>("");

  // setup the sell item token ID state
  const [sellItemTokenID, setSellItemTokenIDState] = useState<string>("");

  // setup the buy item type state
  const [buyItemType, setBuyItemTypeState] = useState<string>("Native");

  // setup the show buy item contract address state
  const [showBuyItemContractAddress, setShowBuyItemContractAddressState] =
    useState<boolean>(false);

  // setup the buy item contract address state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string>("");

  // setup the buy item amount state
  const [buyItemAmount, setBuyItemAmountState] = useState<string>("");

  // setup the listing creation success message state
  const [successMessage, setSuccessMessageState] = useState<any>(null);

  // setup the listing creation error message state
  const [listingError, setListingErrorState] = useState<any>(null);

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
    // logout from passport
    await passportInstance.logout();
  };

  // state change handlers
  const handleSellItemContractAddressChange = (event: any) => {
    setSellItemContractAddressState(event.target.value);
  };

  const handleSellItemTokenIDChange = (event: any) => {
    setSellItemTokenIDState(event.target.value);
  };

  const handleBuyItemTypeChange = (val: any) => {
    setBuyItemTypeState(val);
    val === "ERC20"
      ? setShowBuyItemContractAddressState(true)
      : setShowBuyItemContractAddressState(false);
  };

  const handleBuyItemContractAddressChange = (event: any) => {
    setBuyItemContractAddressState(event.target.value);
  };

  const handleBuyItemAmountChange = (event: any) => {
    setBuyItemAmountState(event.target.value);
  };

  const handleSuccessfulListingCreation = (listingID: string) => {
    setSuccessMessageState(`Listing created successfully - ${listingID}`);
  };

  // #doc prepare-erc721-listing
  // prepare ERC721 listing
  const prepareERC721Listing =
    async (): Promise<orderbook.PrepareListingResponse> => {
      // build the sell item
      const sell: ERC721Item = {
        contractAddress: sellItemContractAddress,
        tokenId: sellItemTokenID,
        type: "ERC721",
      };

      // build the buy item
      const buy =
        buyItemType === "Native"
          ? ({
              amount: buyItemAmount,
              type: "NATIVE",
            } as NativeItem)
          : ({
              amount: buyItemAmount,
              type: "ERC20",
              contractAddress: buyItemContractAddress,
            } as ERC20Item);

      // build the prepare listing parameters
      const prepareListingParams: PrepareListingParams = {
        makerAddress: accountsState[0],
        buy,
        sell,
      };

      // invoke the orderbook SDK to prepare the listing
      return await orderbookSDK.prepareListing(prepareListingParams);
    };
  // #enddoc prepare-erc721-listing

  // create ERC721 listing
  const createER721Listing = async () => {
    setListingErrorState(null);

    try {
      // prepare the listing
      const preparedListing = await prepareERC721Listing();

      // sign and submit approval transaction
      await signAndSubmitApproval(web3Provider, preparedListing);

      // sign the listing
      const orderSignature = await signListing(web3Provider, preparedListing);

      // create the listing
      const listingID = await createListing(
        orderbookSDK,
        preparedListing,
        orderSignature,
      );

      handleSuccessfulListingCreation(listingID);
    } catch (error: any) {
      console.error(error);
      setSuccessMessageState(null);
      setListingErrorState(`Something went wrong - ${error.message}`);
    }
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "base.spacing.x5" }}>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Passport
        </Heading>
        <Grid>
          {accountsState.length === 0 && (
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
          )}
          {accountsState.length >= 1 && (
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
          )}
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
          Create ERC721 listing
        </Heading>
        {successMessage && (
          <Box
            sx={{
              color: "green",
              fontSize: "15",
              marginBottom: "base.spacing.x5",
            }}
          >
            {successMessage}
          </Box>
        )}
        {listingError && (
          <Box sx={{ color: "red", marginBottom: "base.spacing.x5" }}>
            {listingError}
          </Box>
        )}
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Contract Address</FormControl.Label>
          <TextInput onChange={handleSellItemContractAddressChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Token ID</FormControl.Label>
          <TextInput onChange={handleSellItemTokenIDChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Currency Type</FormControl.Label>
          <Select
            size="medium"
            defaultOption="Native"
            onSelectChange={handleBuyItemTypeChange}
          >
            <Select.Option optionKey={"Native"}>
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
        {showBuyItemContractAddress && (
          <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
            <FormControl.Label>Currency Contract Address</FormControl.Label>
            <TextInput onChange={handleBuyItemContractAddressChange} />
          </FormControl>
        )}
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Currency Amount</FormControl.Label>
          <TextInput onChange={handleBuyItemAmountChange} />
        </FormControl>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "base.spacing.x2",
            marginBottom: "base.spacing.x5",
          }}
        >
          <Button
            size="medium"
            variant="primary"
            sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
            onClick={createER721Listing}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
