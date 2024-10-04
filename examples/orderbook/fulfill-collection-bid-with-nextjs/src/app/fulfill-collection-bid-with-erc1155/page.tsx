"use client";

import {
  Body,
  Box,
  Button,
  FormControl,
  Grid,
  Heading,
  Link,
  LoadingOverlay,
  Stack,
  Table,
  TextInput,
} from "@biom3/react";
import { orderbook } from "@imtbl/sdk";
import { OrderStatusName } from "@imtbl/sdk/orderbook";
import { ProviderEvent } from "@imtbl/sdk/passport";
import { ethers } from "ethers";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import { orderbookSDK } from "../utils/setupOrderbook";
import { passportInstance } from "../utils/setupPassport";

export default function FulfillERC1155WithPassport() {
  interface UnitsToFill {
    rowIndex: number;
    units: string;
  }

  interface TokenIdToFill {
    rowIndex: number;
    tokenId: string;
  }

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

  // setup the buy item contract addres s state
  const [buyItemContractAddress, setBuyItemContractAddressState] =
    useState<string | null>(null);

  // save the collection bids state
  const [collectionBids, setCollectionBidsState] = useState<orderbook.CollectionBid[]>([]);

  const [unitsToFill, setUnitsToFill] = useState<UnitsToFill | null>(null);

  const [tokenIdToFill, setTokenIdToFill] = useState<TokenIdToFill | null>(null);

  // setup the collection bid creation success message state
  const [successMessage, setSuccessMessageState] = useState<string | null>(null);

  // setup the collection bid creation error message state
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
  const handleBuyItemContractAddressChange = (event: any) => {
    resetMsgState();

    const buyContractAddrsVal =
      event.target.value === "" ? null : event.target.value;
    setBuyItemContractAddressState(buyContractAddrsVal);
  };

  const handleUnitsToFillChange = (index: number, val: string) => {
    resetMsgState();
    setUnitsToFill({
      rowIndex: index,
      units: val,
    });
  };

  const handleTokenIdToFillChange = (index: number, val: string) => {
    resetMsgState();
    setTokenIdToFill({
      rowIndex: index,
      tokenId: val,
    });
  }

  const getCollectionBids = async (
    client: orderbook.Orderbook,
    buyItemContractAddress?: string
  ): Promise<orderbook.CollectionBid[]> => {
    const params: orderbook.ListCollectionBidsParams = {
      pageSize: 50,
      sortBy: "created_at",
      status: OrderStatusName.ACTIVE,
      buyItemContractAddress,
    }

    const { result } = await client.listCollectionBids(params);
    return result;
  }

  // memoize the collection bids fetch
  useMemo(async () => {
    const collectionBids = await getCollectionBids(
      orderbookSDK,
      buyItemContractAddress === null ? undefined : buyItemContractAddress,
    );

    const filtered = collectionBids.filter(collectionBid =>
      collectionBid.accountAddress !== accountsState[0] &&
      collectionBid.buy[0].type === 'ERC1155_COLLECTION',
    );

    setCollectionBidsState(filtered.slice(0, 10));
  }, [accountsState, buyItemContractAddress]);

  const executeTrade = async (collectionBidID: string, rowIndex: number) => {
    const units =
      unitsToFill?.rowIndex === rowIndex ? unitsToFill.units : undefined;

    if (!units) {
      setErrorMessageState('Please enter the units to fill');
      return;
    }

    const tokenId =
      tokenIdToFill?.rowIndex === rowIndex ? tokenIdToFill.tokenId : undefined;

    if (!tokenId) {
      setErrorMessageState('Please enter the token ID to fill');
      return;
    }

    if (accountsState.length === 0) {
      setErrorMessageState('Please connect your wallet first');
      return;
    }

    resetMsgState();
    setLoadingState(true);
    setLoadingText('Fulfilling collection bid');

    try {
      await fulfillERC1155CollectionBid(collectionBidID, units.toString(), tokenId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessageState(message);
    }

    setLoadingState(false);
  }

  const fulfillERC1155CollectionBid = async (
    collectionBidID: string,
    amount: string,
    tokenId: string,
  ) => {
    const { actions } = await orderbookSDK.fulfillOrder(
      collectionBidID,
      accountsState[0],
      [],
      amount,
      tokenId,
    );

    for (const action of actions) {
      if (action.type === orderbook.ActionType.TRANSACTION) {
        const builtTx = await action.buildTransaction();
        await signer.sendTransaction(builtTx);
      }
    }
  }

  const unitsLeftToFill = (
    total: string,
    numerator: string,
    denominator: string
  ): number => {
    const totalAmount = parseInt(total);
    const numeratorAsInt = parseInt(numerator);
    const denominatorAsInt = parseInt(denominator);

    if (denominatorAsInt === 0 && numeratorAsInt === 0) {
      return totalAmount;
    }
  
    return totalAmount - Math.floor((numeratorAsInt / denominatorAsInt) * totalAmount)
  }

  return (
    <Box sx={{ marginBottom: "base.spacing.x5" }}>
      <Box sx={{ marginTop: "base.spacing.x10" }}>
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
          Fulfill Collection Bid - ERC1155 Fulfillment
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
            <TextInput onChange={handleBuyItemContractAddressChange} />
          </FormControl>
        </Grid>
      </Box>
        {collectionBids && collectionBids.length > 0 ? (
          <Box sx={{ maxHeight: "800px", marginBottom: "base.spacing.x5" }}>
            <Table sx={{ marginLeft: "base.spacing.x5", maxWidth: "1300px", maxHeight: "400px", overflowY: "auto", marginBottom: "base.spacing.x5"}}>
            <Table.Head>
              <Table.Row>
                <Table.Cell>SNO</Table.Cell>
                <Table.Cell>Bid ID</Table.Cell>
                <Table.Cell>Contract Address</Table.Cell>
                <Table.Cell>Offer Amount</Table.Cell>
                <Table.Cell>Fillable Units</Table.Cell>
                <Table.Cell>Units to Fill</Table.Cell>
                <Table.Cell>Token ID</Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {collectionBids.map((collectionBid: orderbook.CollectionBid, index: number) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{collectionBid.id}</Table.Cell>
                    <Table.Cell>{collectionBid.buy[0].contractAddress}</Table.Cell>
                    <Table.Cell>{collectionBid.sell[0].amount}</Table.Cell>
                    <Table.Cell>{unitsLeftToFill(
                        collectionBid.buy[0].amount,
                        collectionBid.fillStatus.numerator,
                        collectionBid.fillStatus.denominator,
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
                        <TextInput
                          onChange={(event: any) =>
                            handleUnitsToFillChange(index, event.target.value)
                          }
                        />
                      </FormControl>
                    </Table.Cell>
                    <Table.Cell>
                      <FormControl sx={{ marginBottom: "base.spacing.x5" }}>
                        <TextInput
                          onChange={(event: any) =>
                            handleTokenIdToFillChange(index, event.target.value)
                          }
                        />
                      </FormControl>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="medium"
                        variant="primary"
                        disabled={loading}
                        onClick={() => executeTrade(collectionBid.id, index)}
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
  )
}