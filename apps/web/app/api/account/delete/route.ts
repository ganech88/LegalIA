import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Eliminación de cuenta y de todos los datos del usuario (derecho de supresión,
 * Ley 25.326). Requiere SUPABASE_SERVICE_ROLE_KEY para borrar el usuario de auth.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "La eliminación de cuenta no está habilitada (falta configuración del servidor)." },
      { status: 503 },
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  try {
    // Borrar datos del usuario (algunas tablas cascadean, pero somos explícitos).
    await admin.from("escritos").delete().eq("user_id", user.id);
    await admin.from("consultas_ia").delete().eq("user_id", user.id);
    await admin.from("casos").delete().eq("user_id", user.id);
    await admin.from("billing_events").delete().eq("user_id", user.id);
    await admin.from("rate_limit_hits").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // Borrar el usuario de auth.
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw new Error(delErr.message);

    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: `No se pudo eliminar la cuenta: ${msg}` }, { status: 500 });
  }
}
