import { HeaderNavigation } from "../../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../../components/SimpleLayout/SimpleLayout"
import purpleDownGradient from "../../../../assets/PurpleDownGradient.svg"
import { FooterButton } from "../../../../components/Footer/FooterButton"
import { useCallback, useContext, useState } from "react"
import { ConnectActions, ConnectContext } from "../../context/ConnectContext"
import { ViewActions, ViewContext } from "../../../../context/ViewContext"
import { ConnectionProviders } from "@imtbl/checkout-sdk-web"
import { ConnectWidgetViews } from "../../../../context/ConnectViewContextTypes"
import { Body, Box, Heading } from "@biom3/react"

export const ReadyToConnect = () => {
  const { connectState: { checkout }, connectDispatch } = useContext(ConnectContext);
  const { viewDispatch} = useContext(ViewContext);
  const [footerButtonText, setFooterButtonText] = useState("Ready to connect");

  const onConnectClick = useCallback(async () => {
    if(checkout) {
      try{
        const connectResult = await checkout.connect({
          providerPreference: ConnectionProviders.METAMASK,
        });
        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: connectResult.provider
          }
        });
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {type: ConnectWidgetViews.SUCCESS}
          }
        })
      } catch(err: any) {
        setFooterButtonText("Try again");
      }
    }
    
  },[checkout, connectDispatch, viewDispatch])

  return (
    <SimpleLayout
      header={<HeaderNavigation showBack title="" showClose transparent />}
      floatHeader
      heroImage={purpleDownGradient}
      footer={<FooterButton actionText={footerButtonText} onActionClick={onConnectClick} />}
      >
        <Box sx={{paddingY: 'base.spacing.x10', paddingX: 'base.spacing.x9', display: 'flex', flexDirection: 'column', rowGap: 'base.spacing.x4'}}>
          <Heading size="small" weight="bold" sx={{color: 'base.color.text.primary'}}>Check for the pop-up from MetaMask</Heading>
          <Body size="small" sx={{color: 'base.color.text.secondary'}}>Follow the prompts in the Metamask popup to connect</Body>
        </Box>
    </SimpleLayout>
  )
}