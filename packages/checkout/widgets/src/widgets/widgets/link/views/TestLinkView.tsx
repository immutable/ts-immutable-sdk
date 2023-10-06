import { Body, Box } from '@biom3/react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';

export function TestLinkView() {
  // const { connectLoaderState } = useContext(ConnectLoaderContext);
  // const { checkout, provider } = connectLoaderState;
  // const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  // const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  return (
    <SimpleLayout
      testId="test-link"
      header={(
        <HeaderNavigation
          title="Test Link"
          onCloseButtonClick={() => console.log('close clicked')}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box>
        <Body>
          Hello
        </Body>
      </Box>
    </SimpleLayout>
  );
}
