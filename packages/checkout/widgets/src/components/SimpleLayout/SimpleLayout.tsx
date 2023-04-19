import { Box } from "@biom3/react";
import { RelativeHeader, FloatingHeader, SimpleLayoutStyle } from "./SimpleLayoutStyles";


export interface SimpleLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  heroImage?: string;
  floatHeader?: boolean;
}

export const SimpleLayout = ({ header, footer, children, heroImage, floatHeader = false }: SimpleLayoutProps) => {
  return (
    <Box sx={SimpleLayoutStyle}>
      {header && 
        <Box sx={(floatHeader ? FloatingHeader : RelativeHeader)}>
          {header}
        </Box>
      }
      <Box sx={{flex: 'auto'}}>
        {heroImage && 
          <Box sx={{height: '50%'}}>
            <img alt="hello" src={heroImage} height={'100%'} />
          </Box>
        }
        {children && <Box sx={{flex: 1}}>{children}</Box>}
      </Box>
      {footer && <Box>{footer}</Box>}
    </Box>
  )
}


