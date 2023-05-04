import { Box } from "@biom3/react"
import { CenteredBoxContentStyles } from "./CenteredBoxStyles";

export interface CenteredBoxContentProps {
  testId?: string;
  children?:React.ReactNode;
}
export const CenteredBoxContent = ({children, testId}: CenteredBoxContentProps) => {
  return (
    <Box testId={testId} sx={CenteredBoxContentStyles}>
    {children}
    </Box>
  )
}