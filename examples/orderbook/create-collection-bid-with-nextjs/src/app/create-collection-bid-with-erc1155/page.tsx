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
  ERC1155CollectionItem,
  ERC20Item,
  PrepareCollectionBidParams
} from "@imtbl/sdk/orderbook";
import { Provider, ProviderEvent } from "@imtbl/sdk/passport";
import { BrowserProvider, ethers } from "ethers";
import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createCollectionBid,
  signAndSubmitApproval,
  signCollectionBid,
} from "../utils/collectionBid";
import { orderbookSDK } from "../utils/setupOrderbook";
import { passportInstance } from "../utils/setupPassport";

export default function CreateERC1155CollectionBidWithPassport() {
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

  // setup the state for the ERC1155 collection bid creation form elements

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string>("");

  // setup the sell item amount state
  const [sellItemAmount, setSellItemAmountState] = useState<string>("");

  // setup the buy item contract address state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string>("");

  // setup the buy item quantity state
  const [buyItemQty, setBuyItemQtyState] = useState<string>("");

  // setup the maker ecosystem fee recipient state
  const [makerEcosystemFeeRecipient, setMakerEcosystemFeeRecipientState] = useState<string>("");

  // setup the maker ecosystem fee amount state
  const [makerEcosystemFeeAmount, setMakerEcosystemFeeAmountState] = useState<string>("");

  // setup the collection bid creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the collection bid creation error message state
  const [collectionBidError, setCollectionBidErrorState] = useState<string | null>(null);

  const passportLogin = async () => {
    if (browserProvider?.send) {
      // disable button while loading
      setLoadingState(true);
      setLoadingText("Connecting to Passport");

      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
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

  const handleBuyItemTokenQtyChange = (event: any) => {
    setBuyItemQtyState(event.target.value);
  };

  const handleMakerEcosystemFeeRecipientChange = (event: any) => {
    setMakerEcosystemFeeRecipientState(event.target.value);
  };

  const handleMakerEcosystemFeeAmountChange = (event: any) => {
    setMakerEcosystemFeeAmountState(event.target.value);
  };

  const handleSuccessfulCollectionBidCreation = (collectionBidID: string) => {
    setSuccessMessageState(`Collection bid created successfully - ${collectionBidID}`);
  };

  // #doc prepare-erc1155-collection-bid
  // prepare ERC1155 collection bid
  const prepareERC1155CollectionBid =
    async (): Promise<orderbook.PrepareCollectionBidResponse> => {
      // build the sell item
      const sell: ERC20Item = {
        type: "ERC20",
        contractAddress: sellItemContractAddress,
        amount: sellItemAmount,
      };

      // build the buy item
      const buy: ERC1155CollectionItem = {
        type: "ERC1155_COLLECTION",
        contractAddress: buyItemContractAddress,
        amount: buyItemQty
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
  // #enddoc prepare-erc1155-collection-bid

  // create ERC1155 collection bid
  const createER1155CollectionBid = async () => {
    setCollectionBidErrorState(null);
    setLoadingState(true);
    setLoadingText('Creating collection bid');

    if (!browserProvider) {
      setCollectionBidErrorState("Please connect to Passport");
      return;
    }

    try {
      // prepare the collection bid
      const preparedCollectionBid = await prepareERC1155CollectionBid();

      // sign and submit approval transaction
      await signAndSubmitApproval(browserProvider, preparedCollectionBid);

      // sign the collection bid
      const orderSignature = await signCollectionBid(browserProvider, preparedCollectionBid);

      // create the collection bid
      const collectionBidID = await createCollectionBid(
        orderbookSDK,
        preparedCollectionBid,
        orderSignature,
        makerEcosystemFeeRecipient != "" ? {
          recipientAddress: makerEcosystemFeeRecipient,
          amount: makerEcosystemFeeAmount,
        } : undefined
      );

      handleSuccessfulCollectionBidCreation(collectionBidID);
    } catch (error: any) {
      console.error(error);
      setSuccessMessageState(null);
      setCollectionBidErrorState(`Something went wrong - ${error.message}`);
    }

    setLoadingState(false);
  };

  return (
    <Box sx={{ width: "450px" }}>
      <LoadingOverlay visible={loading}>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText
            text={[loadingText]}
            textDuration={1000}
          />
        </LoadingOverlay.Content>
      </LoadingOverlay>
      <Box sx={{ marginBottom: "base.spacing.x5" }}>
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
          Create ERC1155 collection bid
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
          <FormControl.Label>NFT Token Quantity</FormControl.Label>
          <TextInput onChange={handleBuyItemTokenQtyChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>ERC20 Currency Contract Address</FormControl.Label>
          <TextInput onChange={handleSellItemContractAddressChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Currency Amount</FormControl.Label>
          <TextInput onChange={handleSellItemAmountChange} />
        </FormControl>
        <Heading size="xSmall" sx={{ marginBottom: "base.spacing.x5" }}>
          Maker Ecosystem Fee
        </Heading>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Recipient Address</FormControl.Label>
          <TextInput onChange={handleMakerEcosystemFeeRecipientChange} />
        </FormControl>
        <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
          <FormControl.Label>Fee Amount</FormControl.Label>
          <TextInput onChange={handleMakerEcosystemFeeAmountChange} />
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
            onClick={createER1155CollectionBid}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
