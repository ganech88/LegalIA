import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");
  const isCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path === "/recuperar" ||
    path === "/restablecer" || // llega con code del email; el callback crea la sesión
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/terminos" ||
    path === "/privacidad" ||
    path.startsWith("/herramientas") || // calculadoras públicas (SEO / adquisición)

    path.startsWith("/api/webhooks") ||
    path.startsWith("/api/billing/webhook") || // webhook server-to-server (sin sesión)
    path.startsWith("/api/cron/"); // cron jobs (autorizados por CRON_SECRET)

  if (isCallback || isPublic) {
    return supabaseResponse;
  }

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && !isOnboarding && !isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.full_name) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
