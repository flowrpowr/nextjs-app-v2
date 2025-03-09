"use client";

import { useEnokiFlow } from "@mysten/enoki/react";
import { Button } from "@/components/ui/button";

export default function Wallet() {
  const enokiFlow = useEnokiFlow();
  const handleSignIn = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const redirectUrl = `${protocol}//${host}/api/enoki`;

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
  };

  return (
    <>
      <div>
        Hey! Seems like this is your first time here. Before listening, click
        here for us to create a blockchain wallet! Just sign in with the same
        google account!
      </div>
      <Button onClick={handleSignIn} variant="outline">
        Create wallet
      </Button>
    </>
  );
}
