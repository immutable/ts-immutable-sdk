import { SimpleLayout } from "../SimpleLayout/SimpleLayout"
import { LoadingBox } from "./LoadingBox";
import { CenteredBoxContent } from "../CenteredBoxContent/CenteredBoxContent";

export interface LoadingViewProps {
  loadingText: string;
}
export const LoadingView = ({loadingText}: LoadingViewProps) => {
  return(
    <SimpleLayout>
      <CenteredBoxContent>
        <LoadingBox loadingText={loadingText}/>
      </CenteredBoxContent>
    </SimpleLayout>
  )
}