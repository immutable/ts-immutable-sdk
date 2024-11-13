"use client";

import { PassportProvider, usePassport } from "@/context/passport";
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
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">Logged in</h1>
        </div>
    );
}

export default function WrappedRedirect() {
    return (
        <PassportProvider>
            <Redirect />
        </PassportProvider>
    );
}
