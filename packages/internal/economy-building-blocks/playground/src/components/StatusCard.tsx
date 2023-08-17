import React from 'react';
import { Banner, BannerVariant } from '@biom3/react';

function StatusCard({
  status,
  description,
  extraContent,
  variant,
}: {
  status: string;
  description: string;
  extraContent?: React.ReactNode;
  variant?: BannerVariant;
}) {
  return (
    <Banner variant={variant} sx={{ marginBottom: 'base.spacing.x4' }}>
      <Banner.Title>{status}</Banner.Title>
      <Banner.Caption>
        | {description}
        {extraContent}
      </Banner.Caption>
    </Banner>
  );
}

export default StatusCard;
