import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images / public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
