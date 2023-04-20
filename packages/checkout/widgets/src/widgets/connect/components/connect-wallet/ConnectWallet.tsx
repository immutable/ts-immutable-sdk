import { Box, Button } from "@biom3/react"
import { HeaderNavigation } from "../../../../components/HeaderNavigation"
import { SimpleLayout } from "../../../../components/SimpleLayout/SimpleLayout"
import { useContext } from "react"
import { ViewActions, ViewContext } from "../../../../context/ViewContext"
import { ConnectWidgetViews } from "../../../../context/ConnectViewContextTypes"
import { FooterLogo } from "../../../../components/Footer/FooterLogo"

export const ConnectWallet = () => {

  const { viewDispatch } = useContext(ViewContext);

  const dispatch = (type: ConnectWidgetViews.PASSPORT | ConnectWidgetViews.OTHER_WALLETS) => viewDispatch({
    payload: {
      type: ViewActions.UPDATE_VIEW,
      view: { type }
    }
  });

  return(
    <SimpleLayout 
      header={
        <HeaderNavigation
          title='Connect a wallet' 
          showClose
          />
      }
      footer={<FooterLogo />}
      >
        <Box>
          <Button 
            testId='connect-passport'
            onClick={() => dispatch(ConnectWidgetViews.PASSPORT)}>Passport</Button>
          <Button 
            testId='connect-other'
            onClick={() => dispatch(ConnectWidgetViews.OTHER_WALLETS)}>Other Wallets</Button>
        </Box>
    </SimpleLayout>
  )
}


