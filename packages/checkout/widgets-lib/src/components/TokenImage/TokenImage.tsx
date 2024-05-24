import { useMemo, useState } from 'react';
import { Environment } from '@imtbl/config';
import { getDefaultTokenImage } from 'lib/utils';
import { WidgetTheme } from '@imtbl/checkout-sdk';

export type ImageProps = {
  name: string;
  theme: WidgetTheme;
  environment: Environment;
  src?: string;
  defaultImage?: string;
} & {
  [key: string]: unknown;
};

export function TokenImage({
  src,
  name,
  environment,
  theme,
  defaultImage,
  ...forwardedProps
}: ImageProps) {
  const [error, setError] = useState<boolean>(false);
  const url = useMemo(
    () => (!src || error
      ? defaultImage || getDefaultTokenImage(environment, theme)
      : src),
    [src, error],
  );

  return (
    <img
      src={url}
      alt={name}
      onError={() => setError(true)}
      {...forwardedProps}
    />
  );
}
