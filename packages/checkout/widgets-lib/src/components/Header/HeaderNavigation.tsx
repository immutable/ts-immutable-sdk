import { AppHeaderBar, ButtCon } from '@biom3/react';
import { useContext } from 'react';
import { ViewActions, ViewContext } from '../../context/ViewContext';
import { HeaderNavigationStyles, ButtonNavigationStyles } from './HeaderStyles';

export interface HeaderNavigationProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  transparent?: boolean;
  onSettingsClick?: () => void;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

export const HeaderNavigation = ({
  title,
  showBack = false,
  showSettings = false,
  transparent = false,
  onSettingsClick,
  onBackButtonClick,
  onCloseButtonClick,
}: HeaderNavigationProps) => {
  const { viewDispatch } = useContext(ViewContext);

  const goBack = async () => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  };

  const handleBackButtonClick = () => {
    onBackButtonClick ? onBackButtonClick() : goBack();
  };

  return (
    <AppHeaderBar
      testId="header-navigation-container"
      sx={HeaderNavigationStyles(transparent)}
      contentAlign="left"
    >
      {showBack && (
        <AppHeaderBar.LeftButtCon
          icon="ArrowBackward"
          iconVariant="bold"
          onClick={handleBackButtonClick}
          testId="back-button"
        />
      )}
      <AppHeaderBar.Title
        testId="header-title"
        size="small"
        sx={{ textAlign: 'left' }}
      >
        {title}
      </AppHeaderBar.Title>
      <AppHeaderBar.RightHandButtons>
        {showSettings && onSettingsClick && (
          <ButtCon
            icon="SettingsCog"
            iconVariant="bold"
            onClick={onSettingsClick}
            testId="settings-button"
          />
        )}
        {onCloseButtonClick && (
          <ButtCon
            iconVariant="bold"
            sx={ButtonNavigationStyles(transparent)}
            icon="Close"
            onClick={onCloseButtonClick}
            testId="close-button"
          />
        )}
      </AppHeaderBar.RightHandButtons>
    </AppHeaderBar>
  );
};
