import { Box } from "@biom3/react"
import { SimpleLayout } from "../SimpleLayout/SimpleLayout"
import { LoadingViewStyles } from "./LoadingStyles"
import { LoadingBox } from "./LoadingBox";

export interface LoadingViewProps {
  loadingText: string;
}
export const LoadingView = ({loadingText}: LoadingViewProps) => {
  return(
    <SimpleLayout>
      <Box sx={LoadingViewStyles}>
        <LoadingBox loadingText={loadingText}/>
      </Box>
    </SimpleLayout>
  )
}