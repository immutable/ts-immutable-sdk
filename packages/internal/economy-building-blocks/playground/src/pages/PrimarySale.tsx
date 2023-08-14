import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Box, Heading, Body, Banner, Button } from "@biom3/react";

import { Grid, Row, Col } from "react-flexbox-grid";

import { encodeApprove } from "../contracts/erc20";
import { useMetamaskProvider } from "../MetamaskProvider";

const useMint = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const mint = useCallback(async () => {
    const data = {
      recipient_address: "0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8",
      items: [
        {
          collection_address: "0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8",
          qty: 1,
        },
      ],
    };

    try {
      const response = await fetch("http://localhost:3001/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      setResponse(json);
    } catch (error) {
      setError(error as any);
    }
  }, []);

  return { mint, response, error };
};

function PrimarySale() {
  const { mm_connect, mm_sendTransaction } = useMetamaskProvider();

  const { mint, response, error } = useMint();

  const setApprove = async (): Promise<boolean> => {
    try {
      const usdcAddress = "0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8";
      const multicallerAddress = "0x6f740c978Fb04CA025b3319FFB6B55D10BF498cE";

      const txData = encodeApprove(multicallerAddress, "1", 6);
      const approved = await mm_sendTransaction(usdcAddress, txData);
      return approved;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <Box sx={{ padding: "base.spacing.x8" }}>
      <Grid fluid>
        <Banner variant="guidance" sx={{ marginBottom: "base.spacing.x4" }}>
          <Banner.Title>Connecting...</Banner.Title>
        </Banner>
        <Button
          size={"large"}
          sx={{ background: "base.gradient.1" }}
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
          Connect
        </Button>
        <Button
          size={"large"}
          sx={{ background: "base.gradient.1" }}
          onClick={async () => {
            const approved = await setApprove();
            if (approved) {
              mint();
            }
          }}
        >
          <Button.Icon
            icon="Minting"
            iconVariant="bold"
            sx={{
              mr: "base.spacing.x1",
              ml: "0",
              width: "base.icon.size.400",
            }}
          />
          Approve
        </Button>
      </Grid>
    </Box>
  );
}

export default PrimarySale;
