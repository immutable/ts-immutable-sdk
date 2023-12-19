import { AppHeaderBar, ButtCon } from '@biom3/react';
import { ReactNode, useContext } from 'react';
import { HeaderNavigationStyles, ButtonNavigationStyles } from './HeaderStyles';
import {
  ViewActions,
  ViewContext,
} from '../../context/view-context/ViewContext';

export interface HeaderNavigationProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
  rightActions?: ReactNode;
}

export function HeaderNavigation({
  title,
  showBack = false,
  transparent = false,
  onBackButtonClick,
  onCloseButtonClick,
  rightActions,
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
    <AppHeaderBar
      testId="header-navigation-container"
      sx={HeaderNavigationStyles(transparent)}
      contentAlign={showBack ? 'center' : 'left'}
      size="small"
    >
      {showBack && (
        <AppHeaderBar.LeftButtCon
          sx={ButtonNavigationStyles(transparent)}
          icon="ArrowBackward"
          iconVariant="bold"
          onClick={handleBackButtonClick}
          testId="back-button"
        />
      )}
      <AppHeaderBar.Title testId="header-title" size="small">
        {title}
      </AppHeaderBar.Title>
      <AppHeaderBar.RightSlot>
        {rightActions}
        {onCloseButtonClick && (
          <ButtCon
            iconVariant="bold"
            sx={ButtonNavigationStyles(transparent)}
            icon="Close"
            onClick={onCloseButtonClick}
            testId="close-button"
          />
        )}
      </AppHeaderBar.RightSlot>
    </AppHeaderBar>
  );
}
