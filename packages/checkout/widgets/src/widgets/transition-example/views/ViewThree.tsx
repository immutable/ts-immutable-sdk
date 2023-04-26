import { Body, Heading } from '@biom3/react';
import { useCallback, useState } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';

enum ViewThreeContents {
  CONTENT_ONE = 'CONTENT_ONE',
  CONTENT_TWO = 'CONTENT_TWO',
}

export const ViewThree = () => {
  const [currentContent, setCurrentContent] = useState(
    ViewThreeContents.CONTENT_ONE
  );

  /*
    This is an example of how we can change the content using an enum with a function that's provided to the header & footer. This is using useCallback to ensure the switchContent is only created once instead of each re-render.
  */
  const switchContent = useCallback((content: ViewThreeContents) => {
    switch (content) {
      case ViewThreeContents.CONTENT_ONE:
        setCurrentContent(ViewThreeContents.CONTENT_TWO);
        break;
      case ViewThreeContents.CONTENT_TWO:
      default:
        setCurrentContent(ViewThreeContents.CONTENT_ONE);
        break;
    }
  }, []);

  return (
    <SimpleLayout
      header={
        <HeaderNavigation
          showClose
          showBack
          onBackButtonClick={
            currentContent === ViewThreeContents.CONTENT_TWO
              ? () => switchContent(currentContent)
              : undefined
          }
        />
      }
      footer={
        currentContent === ViewThreeContents.CONTENT_ONE ? (
          <FooterButton
            actionText="Next"
            onActionClick={() => switchContent(currentContent)}
          />
        ) : (
          <FooterLogo />
        )
      }
    >
      {currentContent === ViewThreeContents.CONTENT_ONE && (
        <ViewThreeContentOne />
      )}
      {currentContent === ViewThreeContents.CONTENT_TWO && (
        <ViewThreeContentTwo />
      )}
    </SimpleLayout>
  );
};

const ViewThreeContentOne = () => {
  return (
    <>
      <Heading>View Three</Heading>
      <Body>Some content here</Body>
    </>
  );
};

const ViewThreeContentTwo = () => {
  return (
    <>
      <Heading>View Three More</Heading>
      <Body>More content</Body>
    </>
  );
};
