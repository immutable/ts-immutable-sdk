import { Body, Link } from '@biom3/react';
import { Trans, useTranslation } from 'react-i18next';

export function SquidFooter() {
  const { t } = useTranslation();

  return (
    <Body
      size="xSmall"
      sx={{
        textAlign: 'center',
        color: 'base.color.text.body.secondary',
      }}
    >
      <Trans
        i18nKey={t('views.ADD_FUNDS.footer.body')}
        components={{
          squidLink: <Link
            size="xSmall"
            rc={<a target="_blank" href=" https://app.squidrouter.com" rel="noreferrer" />}
          />,
        }}
      />
    </Body>
  );
}
