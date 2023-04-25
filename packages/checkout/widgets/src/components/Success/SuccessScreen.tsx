import { SimpleLayout } from "../SimpleLayout/SimpleLayout";
import { FooterNavigation } from "../Footer/FooterNavigation";
import { Body, Box, Icon, SvgIcon } from "@biom3/react";
import { SuccessScreenStyles } from "./SuccessStyles";
import { sendCloseWidgetEvent } from "../../widgets/connect/ConnectWidgetEvents";

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
      footer={<FooterNavigation actionText={actionText} onActionClick={onSuccessActionClick}/>}>
      <Box sx={SuccessScreenStyles} testId='success-box'>
        <SvgIcon sx={{ width: 'base.icon.size.500', borderRadius: '24px', background: '#ABF790' }}>
          <Icon icon="Tick" sx={{ width: 'base.icon.size.500', fill:'base.color.brand.2' }} />
        </SvgIcon>
        <Body size='medium' weight='bold'>
          {successText}
        </Body>
      </Box>
    </SimpleLayout>
  )
}
