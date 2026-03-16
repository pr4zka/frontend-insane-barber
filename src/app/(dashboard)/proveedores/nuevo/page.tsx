"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react";
import { toast } from "sonner";
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
import { proveedoresService } from "@/services/compras.service";

export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await proveedoresService.create({ ...form, estado: true });
      toast.success("Proveedor creado exitosamente");
      router.push("/proveedores");
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      toast.error("Error al crear el proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Proveedor"
        description="Registra un nuevo proveedor"
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Proveedor</CardTitle>
          <CardDescription>
            Completa los datos para registrar un nuevo proveedor.
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
                  placeholder="Nombre del proveedor"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  name="ruc"
                  placeholder="Ej: 80012345-6"
                  value={form.ruc}
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

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="proveedor@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Direccion del proveedor"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/proveedores">Cancelar</Link>
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
