import { SimpleLayout } from "../SimpleLayout/SimpleLayout";
import { Body, Box, Icon } from "@biom3/react";
import { SuccessLogoStyles, SuccessViewStyles } from "./SuccessViewStyles";
import { FooterButton } from "../Footer/FooterButton";

export interface SuccessViewProps {
  successText: string;
  actionText: string;
  onActionClick: () => void;
  successEventAction?: () => void;
}

export const SuccessView = ({successText, actionText, onActionClick, successEventAction}: SuccessViewProps) => {

  if(successEventAction !== undefined && typeof successEventAction === 'function') {
    successEventAction();
  }

  const onSuccessActionClick = () => {
    if(onActionClick !== undefined && typeof onActionClick === 'function'){
      onActionClick();
    }
  }

  return (
    <SimpleLayout
      footer={<FooterButton actionText={actionText} onActionClick={onSuccessActionClick}/>}>
      <Box sx={SuccessViewStyles} testId='success-box'>
        <Box sx={SuccessLogoStyles}>
          <Icon icon="Tick" variant="bold" sx={{ width: 'base.icon.size.400', fill:'base.color.brand.2' }} />
        </Box>
        <Body size='medium' weight='bold'>
          {successText}
        </Body>
      </Box>
    </SimpleLayout>
  )
}
