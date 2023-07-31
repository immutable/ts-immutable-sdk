import React from "react";
import { Box, Heading, Body, Banner, ButtCon } from "@biom3/react";
import { usePassportProvider } from "../context/PassportProvider";
import { useData } from "../context/DataProvider";
import { useMulticaller } from "../context/MulticallerProvider";
import ItemCards from "../components/ItemCards";
import { NFT } from "@imtbl/generated-clients/dist/multi-rollup";
import { Grid, Row, Col } from "react-flexbox-grid";
import CraftingBox from "../components/crafting/CraftingBox";
import CraftingConfig from "../components/crafting/CraftingConfig";
import { v4 as uuidv4 } from "uuid";
import CraftingApprovalConfirmation from "../components/crafting/CraftingApprovalConfirmation";
import {
  encodeIsApprovedAll,
  encodeSetApprovalForAll,
} from "../contracts/erc721";

const refreshingTime = 2;
const wallet = "0x05d1f8d5cac26584f2506307dfff3ea19684d16b";

function Crafting() {
  const [nfts, setNFTs] = React.useState<Array<NFT>>([]);
  const [selected, setSelected] = React.useState<Map<string, NFT>>(new Map());
  const [loading, setLoading] = React.useState<boolean>(false);
  const [approvalConfirmationVisible, setApprovalConfirmationVisible] =
    React.useState<boolean>(false);
  const [collectionAddress, setCollectionAddress] = React.useState<string>(
    "0x073E8D9Ca35EE06CC895baefA7Bdd063eCEe2C33"
  );
  const [multicallerAddress, setMulticallerAddress] = React.useState<string>(
    "0xaDEbf4f05E45568F90a57443264fc6079F6A4554"
  );
  const [gameProjectId, setGameProjectId] = React.useState<string>("1");
  const [successMessages, setSuccessMessages] = React.useState<
    Map<string, string>
  >(new Map());

  const { sendTx, call } = usePassportProvider();
  const { getNFTs } = useData();
  const { sign } = useMulticaller();

  React.useEffect(() => {
    const timer = setInterval(async () => {
      await getNFTsAsync(collectionAddress);
    }, refreshingTime * 1000);
    return () => clearInterval(timer);
  }, []);

  const getNFTsAsync = async (collectionAddress: string) => {
    if (collectionAddress === "") {
      return;
    }
    const res = await getNFTs(
      wallet,
      collectionAddress
      // "0x64f387f90466751fdd080c056d92ad544bc1a1c8"
    );
    setNFTs(res?.result || []);
  };

  const onItemCardClick = (nft: NFT) => {
    const key = `${nft.contract_address}-${nft.token_id}`;
    const newSelected = new Map(selected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.set(key, nft);
    }
    setSelected(newSelected);
  };

  const isSelected = (nft: NFT) =>
    selected.has(`${nft.contract_address}-${nft.token_id}`);

  const onCraftClick = async () => {
    if (selected.size === 0) {
      return;
    }
    setLoading(true);
    const approved = await isApproved();
    console.log(`Approved: ${approved}`);
    if (!approved) {
      setApprovalConfirmationVisible(true);
    } else {
      await craft();
      setLoading(false);
    }
  };

  const isApproved = async (): Promise<boolean> => {
    // const txData = encodeIsApprovedAll(wallet, multicallerAddress);
    // const approved = await call(collectionAddress, txData);
    // return parseInt(approved, 16) === 1;
    return false;
  };

  const onApproval = async () => {
    setApprovalConfirmationVisible(false);
    const txData = encodeSetApprovalForAll(multicallerAddress, true);
    const txHash = await sendTx(collectionAddress, txData);
    console.log(txHash);
    addSuccessMessage(txHash, `Approval transaction ${txHash}`);
    await craft();
    setLoading(false);
  };

  const onApprovalReject = () => {
    setApprovalConfirmationVisible(false);
    setLoading(false);
  };

  const craft = async () => {
    try {
      const calls = Array.from(selected.values()).map((nft) => ({
        address: nft.contract_address,
        functionSignature: "burn(uint256)",
        functionArgs: [nft.token_id],
      }));
      calls.push({
        address: collectionAddress,
        functionSignature: "mint(address,uint256)",
        functionArgs: [wallet, "1"],
      });
      const ref = uuidv4().replace(/-/g, "");
      const signResponse = await sign(gameProjectId, ref, calls);
      console.log(signResponse);

      if (signResponse !== undefined) {
        const txHash = await sendTx(
          signResponse.multicallerAddress,
          `0x${signResponse.txData}`
        );
        console.log(txHash);
        addSuccessMessage(txHash, `Crafting transaction ${txHash}`);
        setSelected(new Map());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onCollectionAddressChange = async (collectionAddress: string) => {
    setCollectionAddress(collectionAddress);
    await getNFTsAsync(collectionAddress);
  };

  const addSuccessMessage = (key: string, message: string) => {
    const newSuccessMessages = new Map(successMessages);
    newSuccessMessages.set(key, message);
    setSuccessMessages(newSuccessMessages);
  };

  const removeSuccessMessage = (key: string) => {
    const newSuccessMessages = new Map(successMessages);
    newSuccessMessages.delete(key);
    setSuccessMessages(newSuccessMessages);
  };

  return (
    <Box sx={{ padding: "base.spacing.x8" }}>
      <Grid fluid>
        {loading && (
          <Banner variant="guidance" sx={{ marginBottom: "base.spacing.x4" }}>
            <Banner.Title>Crafting...</Banner.Title>
          </Banner>
        )}
        {Array.from(successMessages.keys()).map((key) => (
          <Banner key={key} variant="success" sx={{ marginBottom: "base.spacing.x4" }}>
            <Banner.Title>{successMessages.get(key)}</Banner.Title>
            <Banner.RightHandButtons>
              <ButtCon
                icon="CloseWithCircle"
                onClick={() => {
                  removeSuccessMessage(key);
                }}
              />
            </Banner.RightHandButtons>
          </Banner>
        ))}
        <Row>
          <Col xs={12} md={3}>
            <Box sx={{ marginBottom: "base.spacing.x8" }}>
              <Heading>Config</Heading>
            </Box>
            <CraftingConfig
              collectionAddress={collectionAddress}
              onCollectionAddressChange={onCollectionAddressChange}
              multicallerAddress={multicallerAddress}
              onMulticallerAddressChange={setMulticallerAddress}
              gameProjectId={gameProjectId}
              onGameProjectIdChange={setGameProjectId}
            />
            <Box
              sx={{
                marginBottom: "base.spacing.x8",
                marginTop: "base.spacing.x8",
              }}
            >
              <Heading>Crafting</Heading>
            </Box>
            <CraftingBox loading={loading} onCraftClick={onCraftClick} />
          </Col>
          <Col xs={12} mdOffset={1} md={8}>
            <Box sx={{ marginBottom: "base.spacing.x8" }}>
              <Row>
                <Col xs={6}>
                  <Heading>Web3 Inventory</Heading>
                </Col>
                <Col xs={6}>
                  <Box sx={{ textAlign: "right" }}>
                    <Body sx={{ color: "base.color.text.secondary" }}>
                      Refereshing every {refreshingTime} seconds
                    </Body>
                  </Box>
                </Col>
              </Row>
            </Box>
            <ItemCards
              nfts={nfts}
              onClick={onItemCardClick}
              isSelected={isSelected}
            />
          </Col>
        </Row>
      </Grid>
      <CraftingApprovalConfirmation
        gameName="Economy Mechanics Playground"
        visible={approvalConfirmationVisible}
        onConfirm={onApproval}
        onReject={onApprovalReject}
        onCloseModal={() => {}}
      />
    </Box>
  );
}

export default Crafting;
