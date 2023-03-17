import { Body, Box } from "@biom3/react";

export interface BalanceInfo {
  name: string;
  description?: string;
  value: string;
  aud: string;
  iconLogo?: string;
}
export interface TokenBalanceInfo{
  params: BalanceInfo;
}
export function TokenBalance(props: TokenBalanceInfo) {
  console.log("token balance")
  return(
    <Box sx={{display:'flex', width:'100%', justifyContent:'space-between'}}>
      <Box>
        <Body>{props.params.name}</Body>
      </Box>
      <Box>
      <Body>{props.params.value}</Body>
      </Box>
    </Box>
)
}
