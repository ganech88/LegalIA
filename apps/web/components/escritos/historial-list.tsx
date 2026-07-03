"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

export interface EscritoRow {
  id: string;
  titulo: string;
  tipo: string;
  fuero: string;
  jurisdiccion: string;
  created_at: string;
}

export function HistorialList({ escritos }: { escritos: EscritoRow[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [fuero, setFuero] = useState("todos");

  const fueros = useMemo(
    () => Array.from(new Set(escritos.map((e) => e.fuero))).sort(),
    [escritos],
  );

  const filtrados = escritos.filter((e) => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || e.titulo.toLowerCase().includes(q) || e.tipo.toLowerCase().includes(q);
    const matchF = fuero === "todos" || e.fuero === fuero;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por título o tipo de escrito…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FiltroChip active={fuero === "todos"} onClick={() => setFuero("todos")}>
            Todos ({escritos.length})
          </FiltroChip>
          {fueros.map((f) => (
            <FiltroChip key={f} active={fuero === f} onClick={() => setFuero(f)}>
              {f} ({escritos.filter((e) => e.fuero === f).length})
            </FiltroChip>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          Ningún escrito coincide con la búsqueda.
        </p>
      ) : (
        <div className="space-y-3">
          {filtrados.map((escrito) => (
            <Link key={escrito.id} href={`/escritos/${escrito.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{escrito.titulo}</CardTitle>
                    <span className="text-sm text-slate-500">{formatDate(escrito.created_at)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{escrito.fuero}</Badge>
                    <Badge variant="outline">{escrito.jurisdiccion}</Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltroChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}
