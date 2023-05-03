import { onDarkBase } from '@biom3/design-tokens';

export const HeroImageStyles = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

export const HeroBackGroundStyles = {
  height: '100%',
  width: '100%',
  backgroundImage: `linear-gradient(180deg, ${onDarkBase.color.brand[2]} 0%, #382749 100%);`,
};
