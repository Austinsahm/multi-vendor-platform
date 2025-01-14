import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Fetch the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const publicRoutes = ["/sign-in", "/sign-up", "/forgot-password"];

    if (!user) {
      // Allow unauthenticated access to public routes
      if (
        publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
      ) {
        return response;
      }
      // Redirect unauthenticated users to the sign-in page for protected routes
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Fetch the user profile to get the role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      // Redirect to error page if no profile or error occurs
      return NextResponse.redirect(new URL("/error", request.url));
    }

    const role = profile.role;
    const requestUrl = request.nextUrl.pathname;

    // Role-based redirection logic
    if (role === "customer" && !requestUrl.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/customer", request.url));
    }

    if (role === "vendor" && !requestUrl.startsWith("/vendor")) {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }

    if (role === "admin" && !requestUrl.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  } catch (e) {
    console.error("Error in Supabase middleware:", e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

export const config = {
  matcher: [
    "/customer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/error",
  ],
};
