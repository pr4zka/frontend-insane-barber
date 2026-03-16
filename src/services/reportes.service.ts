import api from "@/lib/api";
import type { ReporteIngreso, ReporteTurno, ReporteServicio } from "@/types";

interface DateRangeParams {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const reportesService = {
  dailyIncome: (params?: DateRangeParams) =>
    api.get<ReporteIngreso[]>("/reports/daily-income", { params }),
  monthlyIncome: (params?: DateRangeParams) =>
    api.get<ReporteIngreso[]>("/reports/monthly-income", { params }),
  appointments: (params?: DateRangeParams & { barberoId?: number }) =>
    api.get<ReporteTurno[]>("/reports/appointments", { params }),
  services: (params?: DateRangeParams) =>
    api.get<ReporteServicio[]>("/reports/services", { params }),
  complaints: (params?: DateRangeParams) =>
    api.get("/reports/complaints", { params }),
  salesBook: (params?: DateRangeParams) =>
    api.get("/reports/sales-book", { params }),
  supplies: (params?: DateRangeParams) =>
    api.get("/reports/supplies", { params }),
};
