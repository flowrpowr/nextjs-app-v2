"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { Button } from "@/components/ui/button";

export default function Wallet() {
    const router = useRouter();
    const enokiFlow = useEnokiFlow();
    const { address } = useZkLogin();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ensure we run this logic only on the client side
        const authToken = localStorage.getItem("@enoki/flow/session/enoki_public_6646caa1f30298432565ccca00c4b9a2");

        if (authToken) {
            router.replace("/dashboard/tracks"); // Redirect immediately
        } else {
            setLoading(false); // Show content if no auth token
        }
    }, []); // Empty dependency array to run only once

    // If still loading, show the loading screen
    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            <div>
                <Button onClick={handleSignIn} variant="outline">
                    Button
                </Button>
                {/* Ensure this only renders on the client */}
                <div>{address}</div>
            </div>
        </Suspense>
    );

    function handleSignIn() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const redirectUrl = `${protocol}//${host}/dashboard/wallet/enoki`;

        enokiFlow
            .createAuthorizationURL({
                provider: "google",
                network: "testnet",
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                redirectUrl,
                extraParams: {
                    scope: ["openid", "email", "profile"],
                },
            })
            .then((url) => {
                window.location.href = url;
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

function LoadingScreen() {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg font-semibold">Loading...</p>
        </div>
    );
}
