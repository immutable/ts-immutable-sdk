import React from 'react';
import { Body, Box } from '@biom3/react'
import { BuyFees } from './BuyWidget'

interface FeesProps {
  fees: BuyFees
}

export default function Fees({ fees }: FeesProps) {
  return (
    <Box>
      <Body testId='fees_heading' size="small">Fees</Body>
      {fees.map((fee, idx) => (
        <Box sx={{ display: "flex", mt: "base.spacing.x1", alignItems: "center" }}>
          <Body testId={`fee_description_${idx}`} size="xSmall" sx={{mr: "base.spacing.x2"}}>{`Royalty to ${fee.recipient}:`}</Body>
          <img src={fee.token.icon} alt="icon" height="8px" />
          <Body testId={`fee_amount_${idx}`} size="xSmall" sx={{ml: "base.spacing.x1"}}>{fee.amount.formatted}</Body>
        </Box>
      ))}
    </Box>
  )
}