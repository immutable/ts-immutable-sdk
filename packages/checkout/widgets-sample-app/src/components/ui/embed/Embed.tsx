import { onDarkBase } from "@biom3/design-tokens"
import { BiomeCombinedProviders } from "@biom3/react"
import { MainPage } from "./MainPage"

export const Embed = () => {
  return(
    <BiomeCombinedProviders theme={{base: onDarkBase}}>
      <MainPage />
    </BiomeCombinedProviders>
  )
}
