import { Body, Heading } from "@biom3/react"
import { useState } from "react"
import { FooterLogo } from "../../../components/Footer/FooterLogo"
import { FooterNavigation } from "../../../components/Footer/FooterNavigation"
import { HeaderNavigation } from "../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../components/SimpleLayout/SimpleLayout"

export const PageThree = () => {
  const [buttonText, setButtonText] = useState("Next");
  const [body, setBody] = useState(PageThreeContentOne);
  const [footer, setFooter] = useState<JSX.Element | undefined>(PageThreeFooterNavigation);
  const [actionFunction, setActionFunction] = useState<() => void | undefined>();

  function PageThreeFooterNavigation () {
    return (
      <FooterNavigation
        text={buttonText}
        callToAction={actionNext}
      />
    )
  }

  function PageThreeFooterLogo () {
    return (
      <FooterLogo />
    )
  }

  function actionPrevious () {
    setBody(PageThreeContentOne);
    setActionFunction(undefined);
    setFooter(PageThreeFooterNavigation);
  }

  function actionNext () {
    setButtonText("Next");
    setBody(PageThreeContentTwo);
    setActionFunction(() => actionPrevious);
    setFooter(PageThreeFooterLogo);
  }

  return (
    <SimpleLayout 
      header={
        <HeaderNavigation
          showClose
          showBack
          onBackButtonClick={actionFunction ? () => actionFunction() : undefined}
        />
      }
      footer={footer}
    >
      {body}
    </SimpleLayout>
  )
}

const PageThreeContentOne = () => {
    return (
      <>
        <Heading>Page Three</Heading>
        <Body>Some content here</Body>
      </>
    )
  }
  
const PageThreeContentTwo = () => {
  return (
    <>
      <Heading>Page Three More</Heading>
      <Body>More content</Body>
    </>
  )
}
