import { Box, Button } from "@biom3/react"
import { HeaderNavigation } from "../../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../../components/SimpleLayout/SimpleLayout"
import { useContext } from "react"
import { ViewActions, ViewContext } from "../../../../context/ViewContext"
import { ConnectWidgetViews } from "../../../../context/ConnectViewContextTypes"
import { FooterLogo } from "../../../../components/Footer/FooterLogo"
import { SuccessScreen } from "../../../../components/Success/SuccessScreen";

export const ConnectWallet = () => {

  const { viewDispatch } = useContext(ViewContext);

  const dispatch = (type: ConnectWidgetViews.PASSPORT | ConnectWidgetViews.OTHER_WALLETS) => viewDispatch({
    payload: {
      type: ViewActions.UPDATE_VIEW,
      view: { type }
    }
  });

  return(
    <SuccessScreen successText='Connection secure' actionText='click me'/>
  )
}
