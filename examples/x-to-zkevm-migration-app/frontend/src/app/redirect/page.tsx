"use client";

import { PassportProvider, usePassport } from "@/context/passport";
import { Box, Heading } from "@biom3/react";
import { useEffect } from "react";

function Redirect() {
    const { passportInstance } = usePassport();

    useEffect(() => {
        if (passportInstance) {
            try {
                passportInstance.loginCallback();
            } catch (error) {
                console.error("Error during loginCallback:", error);
            }
        } else {
            console.log("passportInstance not available");
        }

    }, [passportInstance]);

    return (
        <Box>
            <Heading size="medium">Logged in</Heading>
        </Box>
    );
}

export default function WrappedRedirect() {
    return (
        <PassportProvider>
            <Redirect />
        </PassportProvider>
    );
}
