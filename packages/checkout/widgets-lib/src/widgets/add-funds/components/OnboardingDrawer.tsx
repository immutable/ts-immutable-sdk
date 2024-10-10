import { Body, Button, Caption, Drawer, DUMMY_RASTER_IMAGE_2_URL, DUMMY_RASTER_IMAGE_3_URL, DUMMY_RASTER_IMAGE_URL, Heading } from '@biom3/react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getCacheItem, SEEN_ONBOARDING_KEY, setCacheItem } from '../functions/onboardingState';


type OnboardingDrawerProps = {};
const MAPPED_SCREEN_CONTENT = [
  {
    title: <>Payments on Immutable<br />have evolved</>,
    caption: 'listen up',
    buttonText: 'Next',
    imageUrl: DUMMY_RASTER_IMAGE_2_URL
  },
  {
    title: <>Deliver tokens to Passport<br />&amp; pay from any wallet</>,
    caption: 'whats evolved',
    buttonText: 'Next',
    imageUrl: DUMMY_RASTER_IMAGE_3_URL
  },
  {
    title: <>Pay with tokens on other chains,<br />we'll find you the best option</>,
    caption: 'listen up',
    buttonText: 'Choose the Wallet to Pay with',
    imageUrl: DUMMY_RASTER_IMAGE_URL
  },
];

export function OnboardingDrawer({ ...props }: OnboardingDrawerProps) {
  const [visible, setVisible] = useState(false);
  const [screenIndex, setScreenIndex] = useState<0 | 1 | 2>(0);
  const currentScreenContent = useMemo(() => MAPPED_SCREEN_CONTENT[screenIndex], [screenIndex]);

  useEffect(() => {
    async function checkToInitialiseDrawer() {
      const cachedValue = await getCacheItem(SEEN_ONBOARDING_KEY);
      if (cachedValue) {
        return setVisible(false);
      }

      return setVisible(true);
    }

    checkToInitialiseDrawer();
  }, []);

  const handleCtaOnClick = useCallback(() => {
    switch (screenIndex) {
      case 0:
        return setScreenIndex(1);
      case 1:
        return setScreenIndex(2);
      case 2: {
        setCacheItem(SEEN_ONBOARDING_KEY, true);
        return setVisible(false);
      }
    }
  }, [screenIndex]);

  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      showHeaderBar={false}
    >
      <Drawer.Content>
        <Caption>{currentScreenContent.caption}</Caption>
        <Heading>{currentScreenContent.title}</Heading>
        <Button onClick={handleCtaOnClick}>{currentScreenContent.buttonText}</Button>
      </Drawer.Content>
    </Drawer>
  );
}
