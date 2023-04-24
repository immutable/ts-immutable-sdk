import { Body, Heading } from "@biom3/react"
import { useState } from "react"
import { FooterLogo } from "../../../components/Footer/FooterLogo"
import { FooterNavigation } from "../../../components/Footer/FooterNavigation"
import { HeaderNavigation } from "../../../components/Header/HeaderNavigation"
import { SimpleLayout } from "../../../components/SimpleLayout/SimpleLayout"

export const ViewThree = () => {
  const [buttonText, setButtonText] = useState("Next");
  const [body, setBody] = useState(ViewThreeContentOne);
  const [footer, setFooter] = useState<JSX.Element | undefined>(ViewThreeFooterNavigation);
  const [actionFunction, setActionFunction] = useState<() => void | undefined>();

  function ViewThreeFooterNavigation () {
    return (
      <FooterNavigation
        text={buttonText}
        callToAction={actionNext}
      />
    )
  }

  function ViewThreeFooterLogo () {
    return (
      <FooterLogo />
    )
  }

  function actionPrevious () {
    setBody(ViewThreeContentOne);
    setActionFunction(undefined);
    setFooter(ViewThreeFooterNavigation);
  }

  function actionNext () {
    setButtonText("Next");
    setBody(ViewThreeContentTwo);
    setActionFunction(() => actionPrevious);
    setFooter(ViewThreeFooterLogo);
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

const ViewThreeContentOne = () => {
    return (
      <>
        <Heading>View Three</Heading>
        <Body>Some content here</Body>
      </>
    )
  }
  
const ViewThreeContentTwo = () => {
  return (
    <>
      <Heading>View Three More</Heading>
      <Body>More content</Body>
    </>
  )
}
