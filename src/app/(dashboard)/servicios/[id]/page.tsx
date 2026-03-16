"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { serviciosService } from "@/services/servicios.service";
import type { Servicio } from "@/types";

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  duracionMin: string;
  estado: boolean;
}

export default function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    duracionMin: "",
    estado: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServicio = async () => {
      setLoading(true);
      try {
        const res = await serviciosService.getAll();
        const servicio = res.data.find(
          (s: Servicio) => s.id === Number(id)
        );
        if (servicio) {
          setFormData({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: String(servicio.precio),
            duracionMin: String(servicio.duracionMin),
            estado: servicio.estado,
          });
        } else {
          setError("Servicio no encontrado.");
        }
      } catch {
        setError("Error al cargar el servicio.");
      } finally {
        setLoading(false);
      }
    };

    fetchServicio();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!formData.precio || Number(formData.precio) <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }
    if (!formData.duracionMin || Number(formData.duracionMin) <= 0) {
      setError("La duracion debe ser mayor a 0.");
      return;
    }

    setSubmitting(true);
    try {
      await serviciosService.update(Number(id), {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        duracionMin: Number(formData.duracionMin),
        estado: formData.estado,
      });
      router.push("/servicios");
    } catch {
      setError("Error al actualizar el servicio. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Servicio" />
        <Card className="max-w-2xl">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Servicio" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre del servicio"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripcion del servicio"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, precio: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracionMin">Duracion (min)</Label>
                <Input
                  id="duracionMin"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.duracionMin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duracionMin: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="estado"
                checked={formData.estado}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    estado: checked === true,
                  }))
                }
              />
              <Label htmlFor="estado">
                {formData.estado ? "Activo" : "Inactivo"}
              </Label>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/servicios">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
