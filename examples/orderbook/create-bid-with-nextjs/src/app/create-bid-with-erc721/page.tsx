"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ProviderEvent } from "@imtbl/sdk/passport";
import { passportInstance } from "../utils/setupPassport";
import { orderbookSDK } from "../utils/setupOrderbook";
import {
  signAndSubmitApproval,
  signBid,
  createBid,
} from "../utils/bid";
import {
  Box,
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
  ERC20Item,
  PrepareBidParams,
} from "@imtbl/sdk/orderbook";
import NextLink from "next/link";

export default function CreateERC721BidWithPassport() {
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

  // setup the state for the ERC721 bid creation form elements

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string>("");

  // setup the buy item amount state
  const [sellItemAmount, setSellItemAmountState] = useState<string>("");

  // setup the buy item contract address state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string>("");

  // setup the buy item token ID state
  const [buyItemTokenID, setBuyItemTokenIDState] = useState<string>("");

  // setup the bid creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the bid creation error message state
  const [bidError, setBidErrorState] = useState<string | null>(null);

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

  const handleBuyItemTokenIDChange = (event: any) => {
    setBuyItemTokenIDState(event.target.value);
  };

  const handleSuccessfulBidCreation = (bidID: string) => {
    setSuccessMessageState(`Bid created successfully - ${bidID}`);
  };

  // #doc prepare-erc721-bid
  // prepare ERC721 bid
  const prepareERC721Bid =
    async (): Promise<orderbook.PrepareBidResponse> => {
      // build the sell item
      const sell: ERC20Item = {
        type: "ERC20",
        contractAddress: sellItemContractAddress,
        amount: sellItemAmount,
      };

      // build the buy item
      const buy: ERC721Item = {
        type: "ERC721",
        contractAddress: buyItemContractAddress,
        tokenId: buyItemTokenID,
      };

      // build the prepare bid parameters
      const prepareBidParams: PrepareBidParams = {
        makerAddress: accountsState[0],
        buy,
        sell,
      };

      // invoke the orderbook SDK to prepare the bid
      return await orderbookSDK.prepareBid(prepareBidParams);
    };
  // #enddoc prepare-erc721-bid

  // create ERC721 bid
  const createER721Bid = async () => {
    setBidErrorState(null);

    try {
      // prepare the bid
      const preparedBid = await prepareERC721Bid();

      // sign and submit approval transaction
      await signAndSubmitApproval(web3Provider, preparedBid);

      // sign the bid
      const orderSignature = await signBid(web3Provider, preparedBid);

      // create the bid
      const bidID = await createBid(
        orderbookSDK,
        preparedBid,
        orderSignature,
      );

      handleSuccessfulBidCreation(bidID);
    } catch (error: any) {
      console.error(error);
      setSuccessMessageState(null);
      setBidErrorState(`Something went wrong - ${error.message}`);
    }
  };

  return (
    <Box>
      <Box sx={{ marginBottom: "base.spacing.x5" }}>
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
          Create ERC721 bid
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
        {bidError ? (
          <Box sx={{
            color: "red",
            marginBottom: "base.spacing.x5",
            maxWidth: "1300px",
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            {bidError}
          </Box>
        ) : null}
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Contract Address</FormControl.Label>
          <TextInput onChange={handleBuyItemContractAddressChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>NFT Token ID</FormControl.Label>
          <TextInput onChange={handleBuyItemTokenIDChange} />
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
            onClick={createER721Bid}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
