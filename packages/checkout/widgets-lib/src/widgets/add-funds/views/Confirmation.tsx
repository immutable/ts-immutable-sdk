import { Link } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { AddFundsConfirmationData } from '../../../context/view-context/AddFundsViewContextTypes';
import { RocketHero } from '../../../components/Hero/RocketHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';

interface ConfirmationProps {
  data: AddFundsConfirmationData;
  onCloseClick: () => void;
}

export function Confirmation({ data, onCloseClick }: ConfirmationProps) {
  return (
    <SimpleLayout
      header={(<HeaderNavigation transparent onCloseButtonClick={onCloseClick} />)}
      heroContent={<RocketHero environment={Environment.PRODUCTION} />}
      floatHeader
    >
      <SimpleTextBody heading="Confirmation">
        <Link
          size="small"
          rc={
            <a href={`https://axelarscan.io/gmp/${data.transactionHash}`} />
          }
        >
          <Link.Icon icon="ArrowForward" />
          Go to Axelarscan for details
        </Link>
      </SimpleTextBody>
    </SimpleLayout>
  );
}
