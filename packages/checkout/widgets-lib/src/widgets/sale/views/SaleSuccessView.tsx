import { useTranslation } from 'react-i18next';
import { StatusView } from '../../../components/Status/StatusView';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { StatusType } from '../../../components/Status/StatusType';

export type SaleSuccessViewProps = {
  data: Record<string, any>;
};
export function SaleSuccessView({ data }: SaleSuccessViewProps) {
  const { t } = useTranslation();
  const { sendCloseEvent, sendSuccessEvent } = useSaleEvent();

  const closeWidget = () => {
    sendCloseEvent(SaleWidgetViews.SALE_SUCCESS);
  };

  return (
    <StatusView
      statusText={t('views.SALE_SUCCESS.text')}
      actionText={t('views.SALE_SUCCESS.actionText')}
      onRenderEvent={() => {
        const { transactions, tokenIds, ...details } = data;
        sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, transactions, tokenIds, details);
      }}
      onActionClick={() => closeWidget()}
      statusType={StatusType.SUCCESS}
      testId="success-view"
    />
  );
}
