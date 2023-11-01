import { text } from '../../../resources/text/textConfig';
import { StatusView } from '../../../components/Status/StatusView';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { StatusType } from '../../../components/Status/StatusType';

export type SaleSuccessViewProps = {
  data: Record<string, any>;
};
export function SaleSuccessView({ data }: SaleSuccessViewProps) {
  const { sendCloseEvent, sendSuccessEvent } = useSaleEvent();

  const closeWidget = () => {
    sendCloseEvent(SaleWidgetViews.SALE_SUCCESS);
  };

  return (
    <StatusView
      statusText={text.views[SaleWidgetViews.SALE_SUCCESS].text}
      actionText={text.views[SaleWidgetViews.SALE_SUCCESS].actionText}
      onRenderEvent={() => {
        const {
          reason, transactions, paymentMethod, ...rest
        } = data;
        sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, transactions, rest);
      }}
      onActionClick={() => closeWidget()}
      statusType={StatusType.SUCCESS}
      testId="success-view"
    />
  );
}
