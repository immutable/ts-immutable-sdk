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
import { orderbook } from "@imtbl/sdk";
import {
  ERC1155Item,
  ERC20Item,
  PrepareBidParams,
} from "@imtbl/sdk/orderbook";
import { Provider, ProviderEvent } from "@imtbl/sdk/passport";
import { BrowserProvider, ethers } from "ethers";
import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createBid,
  signAndSubmitApproval,
  signBid,
} from "../utils/bid";
import { orderbookSDK } from "../utils/setupOrderbook";
import { passportInstance } from "../utils/setupPassport";

export default function CreateERC1155BidWithPassport() {
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
  const web3Provider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);

  // setup the state for the ERC1155 bid creation form elements

  // setup the sell item contract address state
  const [sellItemContractAddress, setSellItemContractAddressState] =
    useState<string>("");

  // setup the sell item amount state
  const [sellItemAmount, setSellItemAmountState] = useState<string>("");

  // setup the buy item contract address state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string>("");

  // setup the buy item token ID state
  const [buyItemTokenID, setBuyItemTokenIDState] = useState<string>("");

  // setup the buy item quantity state
  const [buyItemQty, setBuyItemQtyState] = useState<string>("");

  // setup the maker ecosystem fee recipient state
  const [makerEcosystemFeeRecipient, setMakerEcosystemFeeRecipientState] = useState<string>("");

  // setup the maker ecosystem fee amount state
  const [makerEcosystemFeeAmount, setMakerEcosystemFeeAmountState] = useState<string>("");

  // setup the bid creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the bid creation error message state
  const [bidError, setBidErrorState] = useState<string | null>(null);

  const passportLogin = async () => {
    if (web3Provider?.send) {
      // disable button while loading
      setLoadingState(true);
      setLoadingText("Connecting to Passport");

      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.send("eth_requestAccounts", []);

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

  const handleBuyItemTokenIDChange = (event: any) => {
    setBuyItemTokenIDState(event.target.value);
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

  const handleSuccessfulBidCreation = (bidID: string) => {
    setSuccessMessageState(`Bid created successfully - ${bidID}`);
  };

  // #doc prepare-erc1155-bid
  // prepare ERC1155 bid
  const prepareERC1155Bid =
    async (): Promise<orderbook.PrepareBidResponse> => {
      // build the sell item
      const sell: ERC20Item = {
        type: "ERC20",
        contractAddress: sellItemContractAddress,
        amount: sellItemAmount,
      };

      // build the buy item
      const buy: ERC1155Item = {
        type: "ERC1155",
        contractAddress: buyItemContractAddress,
        tokenId: buyItemTokenID,
        amount: buyItemQty
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
  // #enddoc prepare-erc1155-bid

  // create ERC1155 bid
  const createER1155Bid = async () => {
    setBidErrorState(null);
    setLoadingState(true);
    setLoadingText('Creating bid');

    if (!web3Provider) {
      setBidErrorState("Please connect to Passport");
      return;
    }

    try {
      // prepare the bid
      const preparedBid = await prepareERC1155Bid();

      // sign and submit approval transaction
      await signAndSubmitApproval(web3Provider, preparedBid);

      // sign the bid
      const orderSignature = await signBid(web3Provider, preparedBid);

      // create the bid
      const bidID = await createBid(
        orderbookSDK,
        preparedBid,
        orderSignature,
        makerEcosystemFeeRecipient != "" ? {
          recipientAddress: makerEcosystemFeeRecipient,
          amount: makerEcosystemFeeAmount,
        } : undefined
      );

      handleSuccessfulBidCreation(bidID);
    } catch (error: any) {
      console.error(error);
      setSuccessMessageState(null);
      setBidErrorState(`Something went wrong - ${error.message}`);
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
          Create ERC1155 bid
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
            onClick={createER1155Bid}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
