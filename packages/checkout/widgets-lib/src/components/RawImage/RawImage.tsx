import { Box, BoxProps, useConvertSxToEmotionStyles } from '@biom3/react';
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
        style={useConvertSxToEmotionStyles(imageStyles)}
        loading="lazy"
      />
    </Box>
  );
}
