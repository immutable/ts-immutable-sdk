import { onLightBase } from "@biom3/design-tokens"
import { BiomeCombinedProviders } from "@biom3/react"
import CheckoutUI from "../checkout/checkout"

export const Checkout = () => {
  return(
    <BiomeCombinedProviders theme={{base: onLightBase}}>
      <CheckoutUI />
    </BiomeCombinedProviders>
  )
}
