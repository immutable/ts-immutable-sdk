"use client";

import {
  Body,
  Box,
  Button,
  FormControl,
  Heading,
  Link,
  LoadingOverlay,
  Stack,
  TextInput
} from "@biom3/react";
import type { orderbook } from "@imtbl/sdk";
import type {
  ERC20Item,
  ERC721CollectionItem,
  PrepareCollectionBidParams
} from "@imtbl/sdk/orderbook";
import { ProviderEvent } from "@imtbl/sdk/passport";
import { ethers } from "ethers";
import NextLink from "next/link";
import { useState } from "react";
import {
  createCollectionBid,
  signAndSubmitApproval,
  signCollectionBid,
} from "../utils/collectionBid";
import { orderbookSDK } from "../utils/setupOrderbook";
import { passportInstance } from "../utils/setupPassport";

export default function CreateERC721CollectionBidWithPassport() {
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

  // setup the state for the ERC721 collection bid creation form elements

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string>("");

  // setup the buy item amount state
  const [sellItemAmount, setSellItemAmountState] = useState<string>("");

  // setup the buy item contract address state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string>("");

  // setup the buy item token amount state
  const [buyItemTokenAmount, setBuyItemTokenAmountState] = useState<string>("");

  // setup the collection bid creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the collection bid creation error message state
  const [collectionBidError, setCollectionBidErrorState] = useState<string | null>(null);

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

  const handleSellItemAmountChange = (event: any) => {
    setSellItemAmountState(event.target.value);
  };

  const handleBuyItemContractAddressChange = (event: any) => {
    setBuyItemContractAddressState(event.target.value);
  };

  const handleBuyItemTokenAmountChange = (event: any) => {
    setBuyItemTokenAmountState(event.target.value);
  };

  const handleSuccessfulCollectionBidCreation = (collectionBidID: string) => {
    setSuccessMessageState(`Collection bid created successfully - ${collectionBidID}`);
  };

  // #doc prepare-erc721-collection-bid
  // prepare ERC721 collection bid
  const prepareERC721CollectionBid =
    async (): Promise<orderbook.PrepareCollectionBidResponse> => {
      // build the sell item
      const sell: ERC20Item = {
        type: "ERC20",
        contractAddress: sellItemContractAddress,
        amount: sellItemAmount,
      };

      // build the buy item
      const buy: ERC721CollectionItem = {
        type: "ERC721_COLLECTION",
        contractAddress: buyItemContractAddress,
        amount: buyItemTokenAmount,
      };

      // build the prepare collection bid parameters
      const prepareCollectionBidParams: PrepareCollectionBidParams = {
        makerAddress: accountsState[0],
        buy,
        sell,
      };

      // invoke the orderbook SDK to prepare the collection bid
      return await orderbookSDK.prepareCollectionBid(prepareCollectionBidParams);
    };
  // #enddoc prepare-erc721-collection-bid

  // create ERC721 collection bid
  const createER721CollectionBid = async () => {
    setCollectionBidErrorState(null);

    try {
      // prepare the collection bid
      const preparedCollectionBid = await prepareERC721CollectionBid();

      // sign and submit approval transaction
      await signAndSubmitApproval(web3Provider, preparedCollectionBid);

      // sign the collection bid
      const orderSignature = await signCollectionBid(web3Provider, preparedCollectionBid);

      // create the collection bid
      const collectionBidID = await createCollectionBid(
        orderbookSDK,
        preparedCollectionBid,
        orderSignature,
      );

      handleSuccessfulCollectionBidCreation(collectionBidID);
    } catch (error: any) {
      console.error(error);
      setSuccessMessageState(null);
      setCollectionBidErrorState(`Something went wrong - ${error.message}`);
    }
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "base.spacing.x5" }}>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Passport
        </Heading>
        <Stack direction="row" justifyContent={"space-between"}>
          {accountsState.length === 0 ? (
            <Box sx={{ marginBottom: "base.spacing.x5" }}>
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
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
                sx={{ width: "90%", marginBottom: "base.spacing.x10" }}
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
            <Box sx={{ marginBottom: "base.spacing.x5", marginTop: "base.spacing.x1", textAlign: "right" }}>
              <div>
                <Body size="small" weight="bold">Connected Account:</Body>
              </div>
              <div>
                <Body size="xSmall" mono={true}>{accountsState.length >= 1 ? accountsState : "(not connected)"}</Body>
              </div>
            </Box>
          )}
        </Stack>
      </Box>
      <Box>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Create ERC721 collection bid
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
        {collectionBidError ? (
          <Box sx={{
            color: "red",
            marginBottom: "base.spacing.x5",
            maxWidth: "1300px",
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            {collectionBidError}
          </Box>
        ) : null}
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Contract Address</FormControl.Label>
          <TextInput onChange={handleBuyItemContractAddressChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Token Amount</FormControl.Label>
          <TextInput onChange={handleBuyItemTokenAmountChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>ERC20 Currency Contract Address</FormControl.Label>
          <TextInput onChange={handleSellItemContractAddressChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Currency Amount</FormControl.Label>
          <TextInput onChange={handleSellItemAmountChange} />
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
            onClick={createER721CollectionBid}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
