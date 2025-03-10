import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Welcome to flowr, the music platform that values your work.
          </CardTitle>
          <CardDescription className="text-lg">
            Sign in to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
            >
              <Button type="submit" size="lg" className="w-full gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-google"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
}
