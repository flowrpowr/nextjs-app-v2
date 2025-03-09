"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";

/**
 * Server action to update a user's wallet address
 *
 * @param walletAddress - The SUI wallet address from zkLogin
 * @returns Object indicating success or error
 */
export async function updateUserWallet(walletAddress: string) {
    try {
        // Get current user session
        const session = await auth();

        // Verify user is authenticated
        if (!session || !session.user || !session.user.id) {
            return {
                success: false,
                error: "Unauthorized. You must be logged in to update your wallet.",
            };
        }

        const userId = session.user.id;

        // Check if wallet address exists and is valid
        if (!walletAddress || typeof walletAddress !== "string") {
            return {
                success: false,
                error: "Invalid wallet address format.",
            };
        }

        // Update user in the database with the wallet address
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                walletAddress: walletAddress,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                walletAddress: true,
            },
        });

        return {
            success: true,
            user: updatedUser,
        };
    } catch (error) {
        console.error("Error updating wallet address:", error);
        return {
            success: false,
            error: "Failed to update wallet address. Please try again.",
        };
    }
}
