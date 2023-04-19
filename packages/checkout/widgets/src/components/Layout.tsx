import { Box } from "@biom3/react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export interface LayoutProps {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}

export const Layout = ({ header, footer, children }) => {
    return (
        <Box>
            {header && <Header>{header}</Header>}
            {children}
            {footer && <Footer>{footer}</Footer>}
        </Box>
    )
}
