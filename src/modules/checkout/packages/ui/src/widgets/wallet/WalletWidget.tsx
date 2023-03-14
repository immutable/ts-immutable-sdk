import { BiomeThemeProvider, Heading } from '@biom3/react'
import { onDarkBase } from '@biom3/design-tokens'

import { 
  WalletWidgetProps,
} from '../../types'

export function WalletWidget(props:WalletWidgetProps) {
  const { params } = props;
  console.log(params);

  return(
    <BiomeThemeProvider theme={{base: onDarkBase}}>
    <Heading>Wallet Widget</Heading>
    </BiomeThemeProvider>
  )

}