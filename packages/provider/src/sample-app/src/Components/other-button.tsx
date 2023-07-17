import { useContext } from "react";
import { AppCtx } from "../Context/app-context"
import { Box, Button } from "@biom3/react";

export const OtherButton = () => {
  const {state} = useContext(AppCtx);

  async function handleClick() {

    console.log(await state.metaMaskIMXProvider?.createTrade({
      order_id: 301814395,
      user: state.address
    }));
  }

  return (
  <Box sx={{ padding: 'base.spacing.x5' }}>
    <Button onClick={handleClick}>
      Other
    </Button>
  </Box>)
    
}
