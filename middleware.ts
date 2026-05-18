import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

function isClerkConfigured(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  return !!pk && !pk.includes("replace") && !pk.includes("REPLACE") && !!sk && !sk.includes("replace") && !sk.includes("REPLACE");
}

// When Clerk is not configured, use a simple passthrough middleware
// that only blocks admin routes with a helpful message.
function simpleMiddleware(req: NextRequest) {
  if (isAdminRoute(req)) {
    return new NextResponse(
      "Clerk auth not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env",
      { status: 503 }
    );
  }
  return NextResponse.next();
}

// Only wire up Clerk middleware when keys are valid.
export default isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req)) {
        await auth.protect();
      }
    })
  : simpleMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
