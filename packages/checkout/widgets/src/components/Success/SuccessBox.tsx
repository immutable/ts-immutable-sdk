import { Body, Box, Icon } from "@biom3/react"
import { SuccessBoxStyles, SuccessLogoStyles } from "./SuccessViewStyles"
export interface SuccessProps {
  successText: string;
}
export const SuccessBox = ({successText}: SuccessProps) => {
  return (
    <Box sx={SuccessBoxStyles} testId="success-box">
      <Box sx={SuccessLogoStyles}>
        <Icon
          icon="Tick"
          testId="success-icon"
          variant="bold"
          sx={{ width: 'base.icon.size.400', fill: 'base.color.brand.2' }}
        />
      </Box>
      <Body size="medium" weight="bold" testId="success-text">
        {successText}
      </Body>
    </Box>
  )
}