// ----------------------------------------------------------------------

export default function IconButton(theme) {
  const isLight = theme.palette.mode === 'light';
  const rootStyle = (ownerState) => {
    const smallSize = ownerState.size === 'small';
    const mediumSize = ownerState.size === 'medium';
    const style = {
      background: '#f3f3f314',
      height: '48px',
      width: '48px',
      fontSize: '16px',
      fontWeight: '500',
      transitionProperty: 'box-shadow',
      transitionDuration: '0.25s',
      transitionTimingFunction: 'ease-in-out'
    };
    const size = {
      ...(smallSize && {
        height: '20px',
        width: '20px',
        fontSize: '16px',
        fontWeight: '500',
      }),
      ...(mediumSize && {
        height: '32px',
        width: '32px',
        fontSize: '12px',
        fontWeight: '500',
      }),
    };
    const hover = {
      '&:hover': {
        boxShadow: 'rgb(243, 243, 243) 0px 0px 0px 3px inset'
      },
      '&:hover::before': {
        content: '""',
        width: 'calc(100% - 10px)',
        height: 'calc(100% - 10px)',
        boxShadow: 'rgb(243, 243, 243) 0px 0px 0px 1px inset',
      },
      '&::before': {
        position: 'absolute',
        borderRadius: '40px',
        top: '50%',
        left: '50%',
        translate: '-50% -50%',
        boxShadow: 'transparent 0px 0px 0px 0px inset',
      },
    }
    return [style, size, hover];
  }
  return {
    MuiIconButton: {
      styleOverrides: {
        root: ({ ownerState }) => rootStyle(ownerState),
      },
    },
  };
}
