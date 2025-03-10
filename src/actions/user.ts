"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .optional(),
});

export async function updateUsername(formData: FormData) {
    try {
        // Get the current user session
        const session = await auth();

        if (!session?.user?.email) {
            return { success: false, message: "You must be logged in to update your profile" };
        }

        // Validate the form data
        const validatedFields = usernameSchema.safeParse({
            username: formData.get("username"),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                message: validatedFields.error.flatten().fieldErrors.username?.[0] || "Invalid username",
            };
        }

        const { username } = validatedFields.data;

        // Update the user in the database
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                username: username || null,
                updatedAt: new Date(),
            },
        });

        // Revalidate the profile page to show the updated data
        revalidatePath("/profile");

        return { success: true };
    } catch (error) {
        console.error("Error updating username:", error);
        return { success: false, message: "Failed to update username" };
    }
}
