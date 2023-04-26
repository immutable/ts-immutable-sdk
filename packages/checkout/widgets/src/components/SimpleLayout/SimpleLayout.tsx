import { Box } from "@biom3/react";
import { SimpleLayoutStyle, HeaderStyle , FooterStyle, BodyStyle, HeroImageStyle, ContentStyle } from "./SimpleLayoutStyles";

export interface SimpleLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  heroImage?: string;
  floatHeader?: boolean;
}

export const SimpleLayout = ({
  header,
  footer,
  children,
  heroImage,
  floatHeader = false
}: SimpleLayoutProps) => {
  return (
    <Box sx={SimpleLayoutStyle}>
      {header && 
        <Box id="header" sx={(HeaderStyle(floatHeader))} >
          {header}
        </Box>
      }
      <Box id="content" sx={ContentStyle}>
        {heroImage && 
          <Box id="hero-image" sx={HeroImageStyle}>
            <img alt='hero' src={heroImage} style={{height: '100%', objectFit: 'contain'}} />
          </Box>
        }
        {children && <Box id="body" sx={BodyStyle}>{children}</Box>}
      </Box>
      {footer && 
        <Box id="footer" sx={FooterStyle}>
          {footer}
        </Box>
      }
    </Box>
  )
}
