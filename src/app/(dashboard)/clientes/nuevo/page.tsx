"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { clientesService } from "@/services/clientes.service";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await clientesService.create(form);
      router.push("/clientes");
    } catch (error) {
      console.error("Error al crear cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo Cliente" description="Registra un nuevo cliente" />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
          <CardDescription>
            Completa los datos para registrar un nuevo cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="Ej: 0981 123 456"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/clientes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <FloppyDisk className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
