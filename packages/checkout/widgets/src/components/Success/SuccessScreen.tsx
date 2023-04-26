import { SimpleLayout } from "../SimpleLayout/SimpleLayout";
import { Body, Box, Icon } from "@biom3/react";
import { SuccessLogoStyles, SuccessScreenStyles } from "./SuccessStyles";
import { sendCloseWidgetEvent } from "../../widgets/connect/ConnectWidgetEvents";
import { FooterButton } from "../Footer/FooterButton";

export interface SuccessScreenProps {
  successText: string;
  actionText: string;
  onActionClick?: () => void;
}

export const SuccessScreen = ({successText, actionText, onActionClick}: SuccessScreenProps) => {

  const onSuccessActionClick = () => {
    if(onActionClick !== undefined && typeof onActionClick === 'function'){
      onActionClick();
    } else {
      sendCloseWidgetEvent();
    }
  }

  return (
    <SimpleLayout
      footer={<FooterButton actionText={actionText} onActionClick={onSuccessActionClick}/>}>
      <Box sx={SuccessScreenStyles} testId='success-box'>
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
