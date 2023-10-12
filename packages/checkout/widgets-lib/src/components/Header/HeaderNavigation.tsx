import { AppHeaderBar, ButtCon } from '@biom3/react';
import { useContext } from 'react';
import { HeaderNavigationStyles, ButtonNavigationStyles } from './HeaderStyles';
import {
  ViewActions,
  ViewContext,
} from '../../context/view-context/ViewContext';
import { AppBar, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
export interface HeaderNavigationProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  transparent?: boolean;
  onSettingsClick?: () => void;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

export function HeaderNavigation({
  title,
  showBack = false,
  showSettings = false,
  transparent = false,
  onSettingsClick,
  onBackButtonClick,
  onCloseButtonClick,
}: HeaderNavigationProps) {
  const { viewDispatch } = useContext(ViewContext);

  const goBack = async () => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  };

  const handleBackButtonClick = () => {
    if (onBackButtonClick) {
      onBackButtonClick();
    } else {
      goBack();
    }
  };

  return (
    <>
      <AppBar
        position="static"
        sx={HeaderNavigationStyles(true)}
      >
        <Toolbar disableGutters sx={{ px: 2 }}>
          {showBack && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              sx={ButtonNavigationStyles(transparent)}
              onClick={handleBackButtonClick}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} test-id="header-title">
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {showSettings && onSettingsClick && (
              <IconButton
                color="inherit"
                test-id="settings-button"
              >
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton
              color="inherit"
              test-id="close-button"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
    </>

  );
}
