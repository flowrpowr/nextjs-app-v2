import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="container max-w-2xl py-12">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">Update your profile information</p>
                </div>
                <ProfileForm user={session.user} />
            </div>
        </div>
    );
}
