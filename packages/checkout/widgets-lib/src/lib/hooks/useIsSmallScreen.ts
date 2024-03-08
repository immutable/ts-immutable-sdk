import { base } from '@biom3/design-tokens';
import { useWindowSizeStore } from '@biom3/react';

function useIsSmallScreen() {
  const { state: width } = useWindowSizeStore((store) => store.width);
  const isSmallScreenMode = typeof width === 'number' && width < base.breakpoint.medium;

  return { isSmallScreenMode };
}

export default useIsSmallScreen;
