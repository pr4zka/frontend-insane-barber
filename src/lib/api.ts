import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

console.log("[API Config] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("[API Config] Using API_URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.",
      });
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401 && typeof window !== "undefined") {
      useAuth.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("Acceso denegado", {
        description: "No tiene permisos para realizar esta acción.",
      });
    } else if (status === 404) {
      toast.error("No encontrado", {
        description: message || "El recurso solicitado no existe.",
      });
    } else if (status && status >= 500) {
      toast.error("Error del servidor", {
        description: "Ocurrió un error interno. Intente nuevamente más tarde.",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
