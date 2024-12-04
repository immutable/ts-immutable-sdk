import {
  BiomeTheme, Box, BoxProps, useConvertSxToEmotionStyles,
} from '@biom3/react';
import { Interpolation } from '@emotion/react';
import { imageStyles, rawImageStyles } from './RawImageStyles';

export type RawImageProps = {
  src: string;
  alt: string;
} & BoxProps;

export function RawImage({
  src,
  alt,
  sx = {},
  ...props
}: RawImageProps) {
  return (
    <Box
      className="FramedImage AspectRatioImage"
      sx={{
        ...rawImageStyles,
        ...sx,
      }}
      rc={<span />}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className="CloudImage"
        style={imageStyles}
        loading="lazy"
      />
    </Box>
  );
}
