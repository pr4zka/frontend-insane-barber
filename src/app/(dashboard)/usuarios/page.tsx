"use client";

import { useState, useEffect } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, ESTADO_ACTIVO } from "@/components/shared/status-badge";
import { usuariosService } from "@/services/usuarios.service";
import { toast } from "sonner";
import type { Usuario } from "@/types";

interface FormData {
  nombre: string;
  email: string;
  password: string;
  rolId: string;
  estado: boolean;
}

const INITIAL_FORM: FormData = {
  nombre: "",
  email: "",
  password: "",
  rolId: "",
  estado: true,
};

const ROLES = [
  { id: "1", nombre: "Administrador" },
  { id: "2", nombre: "Recepcionista" },
  { id: "3", nombre: "Barbero" },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await usuariosService.getAll();
      setUsuarios(res.data);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido.");
      return;
    }
    if (!formData.password.trim()) {
      setError("La contrasena es requerida.");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }
    if (!formData.rolId) {
      setError("Seleccione un rol.");
      return;
    }

    setSubmitting(true);
    try {
      await usuariosService.create({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        password: formData.password,
        rolId: Number(formData.rolId),
        estado: formData.estado,
      });
      setDialogOpen(false);
      fetchUsuarios();
    } catch {
      setError("Error al crear el usuario. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "rol",
      header: "Rol",
      render: (usuario) => usuario.rol?.nombre ?? "-",
    },
    {
      key: "estado",
      header: "Estado",
      render: (usuario) => (
        <StatusBadge
          status={String(usuario.estado)}
          config={ESTADO_ACTIVO}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nuevo Usuario
          </Button>
        }
      />

      <DataTable<Usuario>
        columns={columns}
        data={usuarios}
        loading={loading}
        emptyMessage="No se encontraron usuarios."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos para registrar un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={formData.rolId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, rolId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
