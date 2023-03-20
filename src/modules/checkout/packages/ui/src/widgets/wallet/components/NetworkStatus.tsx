import { Badge, Body, Box } from "@biom3/react";

interface NetworkStatusProps {
  networkName: string;
}

export const NetworkStatus = (props: NetworkStatusProps) => {
  const {networkName} = props;
  return(
    <Box sx={{display: 'flex', flexGrow: '1', direction: 'row', alignItems: "center"}}>
      <Box sx={{paddingRight: 'base.spacing.x1'}}>
        <Badge variant={networkName !== "" ? "success" : "alert"} isAnimated={networkName !== ""} />
      </Box>
      <Body>
        Network: <Body sx={{textTransform:'capitalize'}}>{networkName}</Body>
      </Body>
    </Box>
  )

}