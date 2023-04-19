import { AppHeaderBar, ButtCon } from "@biom3/react";
import { useContext } from "react";
import { ViewActions, ViewContext } from "../context/ViewContext";
import { ConnectWidgetViews } from "../context/ConnectViewContextTypes";

export interface HeaderNavigationProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

export const HeaderNavigation = ({ 
  title, 
  showBack = false, 
  showClose = false, 
  showSettings = false, 
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
    <AppHeaderBar elevated={false}>
      {showBack && <AppHeaderBar.LeftButtCon icon="ArrowBackward" iconVariant="bold" onClick={goBack} />}
      {title && <AppHeaderBar.Title size='medium' sx={{ textAlign: 'left' }}>{title}</AppHeaderBar.Title>}
      <AppHeaderBar.RightHandButtons>
        {showSettings && onSettingsClick && <ButtCon icon="SettingsCog" onClick={onSettingsClick} />}
        {showClose && <ButtCon icon="Close" onClick={close} />}
      </AppHeaderBar.RightHandButtons>
    </AppHeaderBar>
  )
}
