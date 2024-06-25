import { useMemo, useState } from 'react';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { getDefaultTokenImage } from '../../lib/utils';

type ImageProps = {
  name?: string;
  src?: string;
  theme?: WidgetTheme;
  environment?: Environment;
  defaultImage?: string;
} & (
  | { defaultImage: string; theme?: WidgetTheme; environment?: Environment }
  | { defaultImage?: never; theme: WidgetTheme; environment: Environment }
);

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
      ? defaultImage
          || (theme && getDefaultTokenImage(environment, theme))
          || ''
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
