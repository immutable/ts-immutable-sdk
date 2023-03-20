import { Body, Box } from "@biom3/react";

export interface BalanceInfo {
  name: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  iconLogo?: string;
}
export interface TokenBalanceInfo{
  params: BalanceInfo;
}
export function TokenBalance(props: TokenBalanceInfo) {
  return(
    <Box sx={{display:'flex', width:'100%', justifyContent:'space-between'}}>
      <Box>
        <Body>{props.params.name}</Body>
      </Box>
      <Box>
      <Body>{props.params.balance}</Body>
      </Box>
    </Box>
)
}
