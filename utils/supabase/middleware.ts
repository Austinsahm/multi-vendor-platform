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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.redirect(new URL("/error", request.url)); // Redirect to error page if no profile found
    }

    const role = profile.role;
    const requestUrl = request.nextUrl.pathname;

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
  matcher: ["/customer/*", "/vendor/*", "/admin/*"],
};
