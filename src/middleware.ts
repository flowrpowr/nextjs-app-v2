export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        "/dashboard/:path*", // Protect all routes under /dashboard
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
