"use client";

import { PassportProvider, usePassport } from "@/context/passport";
import { useEffect } from "react";

function Redirect() {
    const { passportInstance } = usePassport();
    // const router = useRouter(); // Call useRouter at the top level, without conditions

    useEffect(() => {
        if (passportInstance) {
            console.log("passportInstance available, calling loginCallback");
            try {
                passportInstance.loginCallback();
                console.log("loginCallback complete, redirecting to home");
                // router.push("/"); // Redirect to home page
            } catch (error) {
                console.error("Error during loginCallback:", error);
            }
        } else {
            console.log("passportInstance not available");
        }

    }, [passportInstance]);

    // Render the view for the login popup after the login is complete
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
