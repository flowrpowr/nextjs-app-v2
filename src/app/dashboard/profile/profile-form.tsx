"use client";

import { useState } from "react";
import { updateUsername } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "next-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);

    try {
      const result = await updateUsername(formData);

      if (result.success) {
        toast("Profile updated", {
          description: "Your username has been updated successfully.",
        });
        // Redirect to the wallet dashboard on success
        router.push("/dashboard/discover");
      } else {
        toast.info("Error", {
          description:
            result.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email || ""} disabled />
        <p className="text-sm text-muted-foreground">
          Your email address cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="Enter your username"
        />
        <p className="text-sm text-muted-foreground">
          This is your public display name
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update profile"}
      </Button>
    </form>
  );
}
