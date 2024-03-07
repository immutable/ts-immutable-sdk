import { Box, useConvertSxToEmotionStyles } from '@biom3/react';
import { imageStyles, rawImageStyles } from './RawImageStyles';

export interface RawImageProps {
  src: string;
  alt: string;
  sx?: any;
}

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
