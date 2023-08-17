import React from 'react';
import { Card, Banner, Link } from '@biom3/react';
import { NFT } from '@imtbl/generated-clients/dist/multi-rollup';

const selectedStyle = {
  border: 'base.border.size.100 solid',
  borderColor: 'base.color.accent.1',
};

function StatusCard({
  status,
  description,
  extraContent,
}: {
  status: string;
  description: string;
  extraContent?: React.ReactNode;
}) {
  return (
    <Card>
      <Card.Caption>
        <Banner variant='standard' sx={{ marginBottom: 'base.spacing.x4' }}>
          <Banner.Title>{status}</Banner.Title>
          <Banner.Caption>
            {description}
            {extraContent}
          </Banner.Caption>
        </Banner>
      </Card.Caption>
    </Card>
  );
}

export default StatusCard;
