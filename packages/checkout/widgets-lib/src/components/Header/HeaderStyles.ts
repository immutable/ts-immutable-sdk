import { SxProps } from '@biom3/react';

export const HeaderNavigationStyles = (transparent: boolean): SxProps => {
  return {
    padding: '0',
    backgroundColor: transparent ? 'transparent' : '',
  };
};
