"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Caso, Fuero, Jurisdiccion, EstadoCaso } from "@/types";
import { FUEROS, JURISDICCIONES, ESTADOS_CASO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FolderOpen, Search } from "lucide-react";

const FUERO_COLORS: Record<string, string> = {
  laboral: "bg-blue-50 text-blue-700",
  civil: "bg-green-50 text-green-700",
  comercial: "bg-purple-50 text-purple-700",
  penal: "bg-red-50 text-red-700",
  familia: "bg-amber-50 text-amber-700",
};

interface CasosClientProps {
  initialCasos: Caso[];
}

export function CasosClient({ initialCasos }: CasosClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [casos, setCasos] = useState<Caso[]>(initialCasos);
  const [filtroEstado, setFiltroEstado] = useState<EstadoCaso | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetCaso, setSheetCaso] = useState<Caso | null>(null);
  const [saving, setSaving] = useState(false);

  const casosFiltrados = casos.filter((c) => {
    const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
    const matchBusqueda =
      !busqueda ||
      c.caratula.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.expediente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  async function handleCreate(form: FormData) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const newCaso = {
      user_id: user.id,
      caratula: form.get("caratula") as string,
      expediente: (form.get("expediente") as string) || null,
      fuero: form.get("fuero") as Fuero,
      jurisdiccion: form.get("jurisdiccion") as Jurisdiccion,
      juzgado: (form.get("juzgado") as string) || null,
      estado: (form.get("estado") as EstadoCaso) || "activo",
      cliente_nombre: (form.get("cliente_nombre") as string) || null,
      contraparte_nombre: (form.get("contraparte_nombre") as string) || null,
      notas: (form.get("notas") as string) || null,
    };

    const { data, error } = await supabase
      .from("casos")
      .insert(newCaso)
      .select()
      .single();

    if (!error && data) {
      setCasos((prev) => [data as Caso, ...prev]);
      setDialogOpen(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleUpdate(form: FormData) {
    if (!sheetCaso) return;
    setSaving(true);
    const updated = {
      caratula: form.get("caratula") as string,
      expediente: (form.get("expediente") as string) || null,
      fuero: form.get("fuero") as Fuero,
      jurisdiccion: form.get("jurisdiccion") as Jurisdiccion,
      juzgado: (form.get("juzgado") as string) || null,
      estado: (form.get("estado") as EstadoCaso) || "activo",
      cliente_nombre: (form.get("cliente_nombre") as string) || null,
      contraparte_nombre: (form.get("contraparte_nombre") as string) || null,
      notas: (form.get("notas") as string) || null,
    };

    const { error } = await supabase
      .from("casos")
      .update(updated)
      .eq("id", sheetCaso.id);

    if (!error) {
      setCasos((prev) =>
        prev.map((c) =>
          c.id === sheetCaso.id ? { ...c, ...updated, updated_at: new Date().toISOString() } : c
        )
      );
      setSheetCaso(null);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="heading-serif text-3xl text-slate-900">Casos</h1>
          <p className="mt-1 text-slate-500">
            Gestioná tus expedientes y casos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4" />
            Nuevo caso
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo caso</DialogTitle>
              <DialogDescription>
                Completá los datos del caso. Los campos con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <CasoForm onSubmit={handleCreate} saving={saving} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por carátula, expediente o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filtroEstado === "todos" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("todos")}
          >
            Todos ({casos.length})
          </Button>
          {ESTADOS_CASO.map((e) => (
            <Button
              key={e.value}
              variant={filtroEstado === e.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroEstado(e.value)}
            >
              {e.label} ({casos.filter((c) => c.estado === e.value).length})
            </Button>
          ))}
        </div>
      </div>

      {casosFiltrados.length === 0 ? (
        <EmptyState hasAnyCasos={casos.length > 0} onNew={() => setDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {casosFiltrados.map((caso) => (
            <CasoCard key={caso.id} caso={caso} onClick={() => setSheetCaso(caso)} />
          ))}
        </div>
      )}

      <Sheet open={!!sheetCaso} onOpenChange={(open) => !open && setSheetCaso(null)}>
        <SheetContent side="right" className="sm:max-w-lg w-full">
          <SheetHeader>
            <SheetTitle>Editar caso</SheetTitle>
          </SheetHeader>
          {sheetCaso && (
            <ScrollArea className="flex-1 px-4">
              <CasoForm caso={sheetCaso} onSubmit={handleUpdate} saving={saving} />
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CasoCard({ caso, onClick }: { caso: Caso; onClick: () => void }) {
  const estadoConfig = ESTADOS_CASO.find((e) => e.value === caso.estado);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{caso.caratula}</CardTitle>
          <Badge
            variant="secondary"
            className={estadoConfig?.color ?? ""}
          >
            {estadoConfig?.label ?? caso.estado}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {caso.expediente && (
          <p className="text-sm text-slate-500">
            Exp. {caso.expediente}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className={FUERO_COLORS[caso.fuero] || ""}>
            {caso.fuero}
          </Badge>
          <Badge variant="outline">{caso.jurisdiccion}</Badge>
          {caso.juzgado && (
            <Badge variant="outline" className="text-xs">
              {caso.juzgado}
            </Badge>
          )}
        </div>
        {(caso.cliente_nombre || caso.contraparte_nombre) && (
          <p className="text-sm text-slate-600">
            {caso.cliente_nombre ?? "—"} vs. {caso.contraparte_nombre ?? "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasAnyCasos, onNew }: { hasAnyCasos: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
      <FolderOpen className="h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-slate-700">
        {hasAnyCasos ? "No se encontraron casos" : "No tenés casos todavía"}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {hasAnyCasos
          ? "Probá ajustando los filtros de búsqueda."
          : "Creá tu primer caso para empezar a organizar tus expedientes."}
      </p>
      {!hasAnyCasos && (
        <Button className="mt-4" onClick={onNew}>
          <Plus className="h-4 w-4" />
          Crear primer caso
        </Button>
      )}
    </div>
  );
}

interface CasoFormProps {
  caso?: Caso;
  onSubmit: (form: FormData) => Promise<void>;
  saving: boolean;
}

function CasoForm({ caso, onSubmit, saving }: CasoFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="caratula">Carátula *</Label>
        <Input
          id="caratula"
          name="caratula"
          required
          defaultValue={caso?.caratula ?? ""}
          placeholder="García, Juan c/ ACME SA s/ despido"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="expediente">Expediente</Label>
          <Input
            id="expediente"
            name="expediente"
            defaultValue={caso?.expediente ?? ""}
            placeholder="CNT 12345/2026"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="juzgado">Juzgado</Label>
          <Input
            id="juzgado"
            name="juzgado"
            defaultValue={caso?.juzgado ?? ""}
            placeholder="Juzgado N° 5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Fuero *</Label>
          <Select name="fuero" defaultValue={caso?.fuero ?? "laboral"} required>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUEROS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Jurisdicción *</Label>
          <Select name="jurisdiccion" defaultValue={caso?.jurisdiccion ?? "CABA"} required>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JURISDICCIONES.map((j) => (
                <SelectItem key={j.value} value={j.value}>
                  {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <Select name="estado" defaultValue={caso?.estado ?? "activo"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_CASO.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cliente_nombre">Cliente</Label>
          <Input
            id="cliente_nombre"
            name="cliente_nombre"
            defaultValue={caso?.cliente_nombre ?? ""}
            placeholder="Nombre del cliente"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contraparte_nombre">Contraparte</Label>
          <Input
            id="contraparte_nombre"
            name="contraparte_nombre"
            defaultValue={caso?.contraparte_nombre ?? ""}
            placeholder="Nombre de la contraparte"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          name="notas"
          defaultValue={caso?.notas ?? ""}
          placeholder="Notas adicionales sobre el caso..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : caso ? "Guardar cambios" : "Crear caso"}
        </Button>
      </DialogFooter>
    </form>
  );
}
