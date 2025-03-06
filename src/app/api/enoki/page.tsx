"use client";

import { useAuthCallback } from "@mysten/enoki/react";
import { useEffect } from "react";

const AuthPage = () => {
    const { handled } = useAuthCallback();

    useEffect(() => {
        if (handled) {
            // Get access token, perform security checks,
            // manage user session, handle errors, and so on.
            window.location.href = "/dashboard/songs";
        }
    }, [handled]);

    return <div>Loading</div>;
};

export default AuthPage;
