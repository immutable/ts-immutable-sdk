export const SimpleLayoutStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'base.color.brand.2',
  minHeight: '680px',
  width: '450px',
};

export const HeaderStyle = (floatHeader: boolean) => {
  return {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: floatHeader ? 'absolute' : 'relative',
  };
};

export const FooterStyle = {
  height: '10%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
};

export const ContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
};

export const HeroContent = {
  flex: '1 0 0', // needed to set flex-basis to 0 for even distribution with BodyStyle
  width: '100%',
};

export const BodyStyle = {
  flex: '1 0 0', // needed to set flex-basis to 0 for even distribution with HeroImageStyle
  width: '100%',
};
