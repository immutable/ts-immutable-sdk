import { SimpleLayout } from "../SimpleLayout/SimpleLayout";
import { FooterNavigation } from "../Footer/FooterNavigation";
import { Body, Box, Icon, SvgIcon } from "@biom3/react";
import { SuccessScreenStyles } from "./SuccessStyles";

export interface SuccessProps {
  successText: string;
  actionText: string
}

export const SuccessScreen = (props: SuccessProps) => {

  return (
    <SimpleLayout
      footer={<FooterNavigation actionText={props.actionText}/>}>
      <Box sx={SuccessScreenStyles} testId='success-box'>
        <Box>
          <SvgIcon sx={{ width: '48px', borderRadius: '24px', background: '#ABF790' }}>
            <Icon icon="Tick" sx={{ w: 'base.icon.size.500', fill:'base.color.brand.2' }} />
          </SvgIcon>
        </Box>
        <Body size='medium' weight='bold'>
          {props.successText}
        </Body>
      </Box>
    </SimpleLayout>
  )
}
