"use client";

import { useRouter } from "next/navigation";
import { useEnokiFlow } from "@mysten/enoki/react";
import { Button } from "@/components/ui/button";

export default function Wallet() {
  const enokiFlow = useEnokiFlow();

  return (
    <>
      <div className="items-center">
        <h3>
          Before listening, click here to create a Sui wallet! Use the same
          google sign-in
        </h3>
        <Button onClick={handleSignIn} variant="outline">
          Create Wallet!
        </Button>
      </div>
    </>
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
