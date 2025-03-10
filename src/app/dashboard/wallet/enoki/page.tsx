"use client";

import { useAuthCallback, useZkLogin } from "@mysten/enoki/react";
import { useEffect } from "react";
import { updateUserWallet } from "@/actions/auth";

const AuthPage = () => {
  const { handled } = useAuthCallback();
  const { address } = useZkLogin();

  useEffect(() => {
    if (handled) {
      // If we have a wallet address, update the user's profile
      if (address) {
        // Call server action to update the user's wallet address
        updateUserWallet(address)
          .then((response) => {
            console.log("Wallet address updated:", response);
          })
          .catch((error) => {
            console.error("Failed to update wallet address:", error);
          });
      }

      // Redirect to dashboard regardless of wallet update success
      // The wallet update is a background operation
      window.location.href = "/dashboard/discover";
    }
  }, [handled]);

  return <div>Loading</div>;
};

export default AuthPage;
