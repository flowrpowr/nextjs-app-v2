import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import { EnokiClient } from "@mysten/enoki/";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
        jwt({ token, user }) {
            if (user) {
                // User is available during sign-in
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            // @ts-ignore
            session.user.id = token.id;
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Redirect to dashboard after sign in
            if (url.startsWith(baseUrl)) {
                return `${baseUrl}/dashboard/songs`;
            }
            // Prevents open redirects
            else if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }
            return baseUrl;
        },
    },
});
