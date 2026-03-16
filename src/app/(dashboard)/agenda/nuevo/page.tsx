"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { turnosService } from "@/services/turnos.service";
import { clientesService } from "@/services/clientes.service";
import { serviciosService } from "@/services/servicios.service";
import { barberosService } from "@/services/barberos.service";
import type { Cliente, Servicio, Barbero } from "@/types";

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clienteId: "",
    servicioId: "",
    barberoId: "",
    fecha: "",
    hora: "",
    observacion: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, serviciosRes, barberosRes] =
          await Promise.allSettled([
            clientesService.getAll(),
            serviciosService.getAll(),
            barberosService.getAll(),
          ]);
        if (clientesRes.status === "fulfilled") setClientes(clientesRes.value.data);
        if (serviciosRes.status === "fulfilled") setServicios(serviciosRes.value.data);
        if (barberosRes.status === "fulfilled") setBarberos(barberosRes.value.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setError("");
    try {
      await turnosService.create({
        clienteId: Number(form.clienteId),
        servicioId: Number(form.servicioId),
        barberoId: Number(form.barberoId),
        fecha: form.fecha,
        hora: form.hora,
        observacion: form.observacion,
      });
      router.push("/agenda");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Error al crear el turno. Intente nuevamente.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nuevo Turno" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Turno"
        description="Agenda un nuevo turno para un cliente"
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Turno</CardTitle>
          <CardDescription>
            Completa los datos para agendar un nuevo turno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={form.clienteId}
                  onValueChange={(value) =>
                    handleSelectChange("clienteId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select
                  value={form.servicioId}
                  onValueChange={(value) =>
                    handleSelectChange("servicioId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.id} value={String(servicio.id)}>
                        {servicio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Barbero</Label>
                <Select
                  value={form.barberoId}
                  onValueChange={(value) =>
                    handleSelectChange("barberoId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar barbero" />
                  </SelectTrigger>
                  <SelectContent>
                    {barberos.map((barbero) => (
                      <SelectItem key={barbero.id} value={String(barbero.id)}>
                        {barbero.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  name="hora"
                  type="time"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion">Observacion (opcional)</Label>
              <Textarea
                id="observacion"
                name="observacion"
                placeholder="Alguna nota adicional sobre el turno..."
                value={form.observacion}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/agenda">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  !form.clienteId ||
                  !form.servicioId ||
                  !form.barberoId ||
                  !form.fecha ||
                  !form.hora
                }
              >
                <FloppyDisk className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
