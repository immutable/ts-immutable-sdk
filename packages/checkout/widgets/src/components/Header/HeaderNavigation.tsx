import { AppHeaderBar, ButtCon } from "@biom3/react";
import { useContext } from "react";
import { ViewActions, ViewContext } from "../../context/ViewContext";
import { ConnectWidgetViews } from "../../context/ConnectViewContextTypes";
import { HeaderNavigationStyles, ButtonNavigationStyles } from "./HeaderStyles";

export interface HeaderNavigationProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  showSettings?: boolean;
  transparent?: boolean;
  onSettingsClick?: () => void;
}

export const HeaderNavigation = ({ 
  title, 
  showBack = false, 
  showClose = false, 
  showSettings = false,
  transparent = false,
  onSettingsClick
  } : HeaderNavigationProps) => {
  const { viewDispatch } = useContext(ViewContext);

  const goBack = async () => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK
      }
    });
  }

  const close = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.FAIL, 
          error: new Error('User closed the connect widget')
        }
      }
    })
  }

  return (
    <AppHeaderBar testId="header-navigation-container" sx={HeaderNavigationStyles(transparent)} elevated={false}>
      {showBack && <AppHeaderBar.LeftButtCon icon="ArrowBackward" iconVariant="bold" onClick={goBack} testId='back-button' />}
      <AppHeaderBar.Title testId="header-title" size='medium' sx={{ textAlign: 'left' }}>{title}</AppHeaderBar.Title>
      <AppHeaderBar.RightHandButtons>
        {showSettings && onSettingsClick && <ButtCon icon="SettingsCog" iconVariant="bold" onClick={onSettingsClick} testId='settings-button' />}
        {showClose && <ButtCon iconVariant="bold" sx={ButtonNavigationStyles(transparent)} icon="Close" onClick={close} testId='close-button' />}
      </AppHeaderBar.RightHandButtons>
    </AppHeaderBar>
  )
}
