import {
  Box, BoxProps, CloudImage,
} from '@biom3/react';
import { imageStyles, rawImageStyles } from './RawImageStyles';

export type RawImageProps = {
  src: string;
  alt: string;
} & BoxProps;

// TODO replace to return biome FrameImage component instead
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
      <CloudImage
        sx={imageStyles}
        use={(
          <img
            src={src}
            alt={alt}
            className="CloudImage"
            loading="lazy"
          />
      )}
      />
    </Box>
  );
}
