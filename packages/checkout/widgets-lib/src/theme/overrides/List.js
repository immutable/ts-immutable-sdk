// ----------------------------------------------------------------------

export default function List(theme) {
  return {
    MuiList: {
      styleOverrides: {
        root: {
          minWidth: "280px",
          maxHeight: "300px",
          background: "rgb(68, 68, 68)",
          position: "relative",
          padding: "4px",
          overflowY: "auto",
          borderRadius: "16px",
          boxShadow: "rgba(0, 0, 0, 0.16) 0px 8px 12px 6px, rgba(0, 0, 0, 0.32) 0px 4px 4px",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          color: '#b6b6b6',
          background: 'rgba(243, 243, 243, 0.04)',
          padding: 'calc(22px) 12px',
          borderRadius: '12px',

          gap: '16px',
          transitionProperty: 'border, background, box-shadow',
          transitionDuration: '0.25s',
          transitionTimingFunction: 'ease-in-out',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          border: '2px solid transparent',
          background: 'transparent',
          backgroundColor: 'rgba(243, 243, 243, 0.04)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          textDecoration: 'none',
          padding: 'calc(22px) 12px',
          borderRadius: '12px',
          width: '100%',
          gap: '16px',

          transitionProperty: 'border, background, box-shadow',
          transitionDuration: '0.25s',
          transitionTimingFunction: 'ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(243, 243, 243, 0.08)',
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 2px 6px 2px, rgba(0, 0, 0, 0.32) 0px 1px 2px'
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'rgb(243, 243, 243)',
          fontFamily: 'Suisse-Intl, sans-serif',
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: '700',
        },
        secondary: {
          color: 'rgb(182, 182, 182)',
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: '400',
        },
      },
    },
    MuiListItemAvatar: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center',
          marginRight: '6px',
          width: '48px',
          height: '48px',
          '& .MuiAvatar-root': {
            background: 'rgba(243, 243, 243, 0.04)',
            width: '48px',
            height: '48px',
            fill: 'rgb(243, 243, 243)'
          }
        },
      },
    },
  };
}
