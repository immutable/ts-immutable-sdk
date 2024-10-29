import {
  Box,
  Button,
  Divider,
  Drawer,
  Heading,
  OnboardingPagination,
  vFlex,
} from '@biom3/react';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import {
  getCacheItem,
  SEEN_ONBOARDING_KEY,
  setCacheItem,
} from '../functions/onboardingState';
import { getRemoteImage } from '../../../lib/utils';

const HERO_IMAGES = [
  '/add-funds-onboarding-1.svg',
  '/add-funds-onboarding-2.svg',
  '/add-funds-onboarding-3.svg',
];

export type OnboardingDrawerProps = {
  environment: Environment;
};

export function OnboardingDrawer({ environment }: OnboardingDrawerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [screenIndex, setScreenIndex] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    async function checkToInitialiseDrawer() {
      const cachedValue = await getCacheItem(SEEN_ONBOARDING_KEY);
      return cachedValue ? setVisible(false) : setVisible(true);
    }

    checkToInitialiseDrawer();
  }, []);

  const handleCtaOnClick = useCallback(() => {
    switch (screenIndex) {
      case 2: {
        // @NOTE: once they have "seen" the final slide, mark it as such
        // in the cache so that we don't show this to users again
        setCacheItem(SEEN_ONBOARDING_KEY, true);
        return setScreenIndex(3);
      }
      case 3:
        // @NOTE: they have "seen" all slides - so this drawer can be closed
        return setVisible(false);

      case 1:
      default:
        return setScreenIndex(2);
    }
  }, [screenIndex]);

  const src = useMemo(
    () => getRemoteImage(environment, HERO_IMAGES[screenIndex - 1]),
    [screenIndex],
  );

  return (
    <Drawer size="threeQuarter" visible={visible} showHeaderBar={false}>
      <Drawer.Content
        sx={{
          ...vFlex,
          alignItems: 'center',
          textAlign: 'center',
          px: 'base.spacing.x6',
        }}
      >
        <Box
          rc={<img src={src} alt={HERO_IMAGES[screenIndex - 1]} />}
          sx={{ userSelect: 'none' }}
        />
        <Divider
          size="xSmall"
          textAlign="center"
          sx={{ mt: 'base.spacing.x6', mb: 'base.spacing.x4' }}
        >
          {t(`views.ADD_FUNDS.onboarding.screen${screenIndex}.caption`)}
        </Divider>
        <Heading
          size="small"
          sx={{
            // @NOTE: this preserves newlines inside any strings, which
            // come out of the translation layer
            whiteSpace: 'pre-line',
          }}
        >
          {t(`views.ADD_FUNDS.onboarding.screen${screenIndex}.title`)}
        </Heading>
        <OnboardingPagination
          disabled
          size="small"
          currentPage={screenIndex}
          totalPages={3}
          sx={{ mt: 'base.spacing.x11', mb: 'base.spacing.x8' }}
        />
        <Button
          variant={screenIndex === 3 ? 'primary' : 'tertiary'}
          onClick={handleCtaOnClick}
          size="large"
          sx={{ alignSelf: 'stretch' }}
        >
          {t(`views.ADD_FUNDS.onboarding.screen${screenIndex}.buttonText`)}
        </Button>
      </Drawer.Content>
    </Drawer>
  );
}
