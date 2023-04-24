import { Body, Button, Heading } from "@biom3/react"
import { HeaderNavigation } from "../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../components/SimpleLayout/SimpleLayout"
import PurpleDownGradient from '../../../components/SimpleLayout/PurpleDownGradient.svg';
import ImmutableNetwork from '../../../components/SimpleLayout/ImmutableNetwork.svg';
import { FooterNavigation } from "../../../components/Footer/FooterNavigation";
import { useContext, useState } from "react";
import { TransitionExampleWidgetViews } from "../../../context/TransitionExampleViewContextTypes";
import { ViewActions, ViewContext } from "../../../context/ViewContext";

export const PageTwo = () => {
  const { viewDispatch } = useContext(ViewContext);
  const [buttonText, setButtonText] = useState("Next");
  const [body, setBody] = useState(PageTwoContentOne);
  const [hero, setHero] = useState<string | undefined>(PurpleDownGradient);
  const [actionFunction, setActionFunction] = useState(() => actionPrevious);

  function actionPrevious () {
    setButtonText("Previous");
    setBody(PageTwoContentTwo);
    setActionFunction(() => actionNext);
    setHero(ImmutableNetwork);
  }

  function actionNext () {
    setButtonText("Next");
    setBody(PageTwoContentOne);
    setActionFunction(() => actionPrevious);
    setHero(PurpleDownGradient);
  }

  return (
    <SimpleLayout 
      header={
        <HeaderNavigation
          showClose
          showBack
          transparent={true}
        />
      }
      footer={
        <FooterNavigation
          text={buttonText}
          callToAction={() => actionFunction()}
        />
      }
      heroImage={hero}
      floatHeader={true}
    >
      {body}
      <Button onClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: TransitionExampleWidgetViews.PAGE_THREE
              }
            }
          })
        }}
      >
          Go To Page Three
      </Button>
    </SimpleLayout>
  )
}

const PageTwoContentOne = () => {
  return (
    <>
      <Heading>Page Two</Heading>
      <Body>Some content here</Body>
    </>
  )
}

const PageTwoContentTwo = () => {
  return (
    <>
      <Heading>Page Two More</Heading>
      <Body>More content</Body>
    </>
  )
}
