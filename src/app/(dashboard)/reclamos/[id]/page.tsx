"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, RECLAMO_ESTADOS } from "@/components/shared/status-badge";
import { reclamosService } from "@/services/reclamos.service";
import { formatDate, formatDateTime } from "@/lib/constants";
import type { Reclamo, SeguimientoReclamo } from "@/types";

export default function DetalleReclamoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reclamo, setReclamo] = useState<Reclamo | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoReclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reclamosRes, followUpsRes] = await Promise.all([
        reclamosService.getAll(),
        reclamosService.getFollowUps(Number(id)),
      ]);
      const found = reclamosRes.data.find(
        (r: Reclamo) => r.id === Number(id)
      );
      if (found) {
        setReclamo(found);
      }
      setSeguimientos(followUpsRes.data);
    } catch {
      setError("Error al cargar los datos del reclamo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmitSeguimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!comentario.trim()) {
      setError("El comentario es requerido.");
      return;
    }
    if (!nuevoEstado) {
      setError("Seleccione el nuevo estado.");
      return;
    }

    setSubmitting(true);
    try {
      await reclamosService.createFollowUp(Number(id), {
        comentario: comentario.trim(),
        estadoAnterior: reclamo?.estado ?? "pendiente",
        estadoNuevo: nuevoEstado,
      });
      setComentario("");
      setNuevoEstado("");
      fetchData();
    } catch {
      setError("Error al agregar el seguimiento. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Reclamo"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/reclamos">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reclamo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Reclamo"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/reclamos">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              Reclamo no encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Reclamo"
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href="/reclamos">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informacion del Reclamo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Cliente
              </p>
              <p className="text-sm">{reclamo.cliente?.nombre ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm">{formatDate(reclamo.fecha)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Estado
              </p>
              <StatusBadge status={reclamo.estado} config={RECLAMO_ESTADOS} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Descripcion
            </p>
            <p className="text-sm">{reclamo.descripcion}</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Seguimiento</CardTitle>
        </CardHeader>
        <CardContent>
          {seguimientos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay registros de seguimiento.
            </p>
          ) : (
            <div className="space-y-4">
              {seguimientos.map((seg) => (
                <div
                  key={seg.id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <StatusBadge
                        status={seg.estadoAnterior}
                        config={RECLAMO_ESTADOS}
                      />
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <StatusBadge
                        status={seg.estadoNuevo}
                        config={RECLAMO_ESTADOS}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(seg.fecha)}
                    </span>
                  </div>
                  <p className="text-sm">{seg.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {reclamo.estado !== "resuelto" && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitSeguimiento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comentario">Comentario</Label>
                <Textarea
                  id="comentario"
                  placeholder="Escriba un comentario sobre el seguimiento"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nuevo Estado</Label>
                <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione el nuevo estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="resuelto">Resuelto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Agregar Seguimiento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
