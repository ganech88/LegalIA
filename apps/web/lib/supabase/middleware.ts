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
    path === "/google5528711437cc4f25.html" || // verificación Google Search Console
    path === "/sitemap.xml" ||
    path === "/terminos" ||
    path === "/privacidad" ||
    path === "/offline" || // página offline de la PWA (el SW la precachea sin sesión)
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path.startsWith("/herramientas") || // calculadoras públicas (SEO / adquisición)
    path === "/api/indices" || // índices oficiales (datos públicos; rate limit por IP)
    path.startsWith("/portal/") || // portal del cliente (token no adivinable)

    path.startsWith("/api/webhooks") ||
    path.startsWith("/api/billing/webhook") || // webhook server-to-server (sin sesión)
    path.startsWith("/api/cron/"); // cron jobs (autorizados por CRON_SECRET)

  if (isCallback || isPublic) {
    return supabaseResponse;
  }

  if (!user && !isAuthPage) {
    // Las APIs responden 401 (un redirect 307 a /login rompe los fetch del cliente).
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Volver a donde iba después de loguearse.
    if (path !== "/dashboard") url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // El onboarding se exige una sola vez: cuando falta la jurisdicción principal
  // (el nombre ya viene del registro, así que antes nunca se forzaba). Las
  // rutas /api no se redirigen.
  if (user && !isOnboarding && !isAuthPage && !path.startsWith("/api/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, jurisdiccion_principal, created_at")
      .eq("id", user.id)
      .single();

    const cuentaNueva = profile?.created_at ? Date.now() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000 : false;
    if (!profile?.full_name || (cuentaNueva && !profile?.jurisdiccion_principal)) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
