import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusConfig {
  label: string;
  className: string;
}

interface StatusBadgeProps {
  status: string;
  config: Record<string, StatusConfig>;
}

export function StatusBadge({ status, config }: StatusBadgeProps) {
  const statusConfig = config[status];

  if (!statusConfig) {
    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", statusConfig.className)}
    >
      {statusConfig.label}
    </Badge>
  );
}

// Predefined status configs for common entities

export const TURNO_ESTADOS: Record<string, StatusConfig> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  confirmado: {
    label: "Confirmado",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  atendido: {
    label: "Atendido",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  cobrado: {
    label: "Cobrado",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

export const RECLAMO_ESTADOS: Record<string, StatusConfig> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  en_proceso: {
    label: "En proceso",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  resuelto: {
    label: "Resuelto",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
};

export const PRESUPUESTO_ESTADOS: Record<string, StatusConfig> = {
  borrador: {
    label: "Borrador",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  },
  enviado: {
    label: "Enviado",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  aprobado: {
    label: "Aprobado",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  rechazado: {
    label: "Rechazado",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

export const CAJA_ESTADOS: Record<string, StatusConfig> = {
  abierta: {
    label: "Abierta",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  cerrada: {
    label: "Cerrada",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  },
};

export const PAGO_ESTADOS: Record<string, StatusConfig> = {
  completado: {
    label: "Completado",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  rechazado: {
    label: "Rechazado",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

export const NOTA_ESTADOS: Record<string, StatusConfig> = {
  emitida: {
    label: "Emitida",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  anulada: {
    label: "Anulada",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

export const ESTADO_ACTIVO: Record<string, StatusConfig> = {
  true: {
    label: "Activo",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  false: {
    label: "Inactivo",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  },
};
