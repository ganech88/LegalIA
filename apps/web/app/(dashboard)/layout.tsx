import { createClient } from "@/lib/supabase/server";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userName = "";
  let plan = "free";
  let escritosUsados = 0;
  let escritosLimit = 3;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, plan, escritos_generados_mes")
      .eq("id", user.id)
      .single();

    if (profile) {
      userName = profile.full_name ?? "";
      plan = profile.plan ?? "free";
      escritosUsados = profile.escritos_generados_mes ?? 0;
      const limits = PLAN_LIMITS[plan as Plan];
      escritosLimit = limits.escritos_mes;
    }
  }

  return (
    <div className="relative min-h-screen flex">
      <SidebarWrapper
        userName={userName}
        plan={plan}
        escritosUsados={escritosUsados}
        escritosLimit={escritosLimit}
      />
      <main className="relative flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
