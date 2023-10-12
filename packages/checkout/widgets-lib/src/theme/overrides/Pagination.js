import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];

export default function Pagination(theme) {
  const isLight = theme.palette.mode === 'light';

  const rootStyle = (ownerState) => {
    const outlinedVariant = ownerState.variant === 'outlined';

    const softVariant = ownerState.variant === 'soft';

    const defaultStyle = {
      '& .MuiPaginationItem-root': {
        ...(outlinedVariant && {
          borderColor: alpha(theme.palette.grey[500], 0.32),
        }),
        '&.Mui-selected': {
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    };

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        ...(softVariant && {
          '& .MuiPaginationItem-root': {
            '&.Mui-selected': {
              color: theme.palette[color][isLight ? 'dark' : 'light'],
              backgroundColor: alpha(theme.palette[color].main, 0.16),
              '&:hover': {
                backgroundColor: alpha(theme.palette[color].main, 0.32),
              },
            },
          },
        }),
      }),
    }));

    return [...colorStyle, defaultStyle];
  };

  return {
    MuiPagination: {
      defaultProps: {
        color: 'primary',
      },

      styleOverrides: {
        root: ({ ownerState }) => rootStyle(ownerState),
      },
    },
  };
}
