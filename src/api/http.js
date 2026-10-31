import axios from "axios";
import toast from "react-hot-toast";
import { tokenStorage } from "./tokenStorage";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback = null;
let onForbiddenCallback = null;

/**
 * Registra el callback de cierre de sesión para cuando ocurra un 401.
 * @param {Function} cb
 */
export function registerUnauthorizedHandler(cb) {
  onUnauthorizedCallback = cb;
}

/**
 * Registra el callback para cuando ocurra un 403 (refrescar permisos desde /me).
 * @param {Function} cb
 */
export function registerForbiddenHandler(cb) {
  onForbiddenCallback = cb;
}

// Interceptor de Request: agrega token JWT si existe
http.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: maneja 401 y 403
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config ? error.config.url : "";

    // 401 fuera de login: cerrar sesión y redirigir
    const isLoginRequest = url && (url.includes("/auth/login") || url.endsWith("/auth/login"));
    if (status === 401 && !isLoginRequest) {
      tokenStorage.removeToken();
      if (typeof onUnauthorizedCallback === "function") {
        onUnauthorizedCallback();
      }
    }

    // 403: mensaje genérico amigable y refresco de permisos (nunca mensaje técnico)
    if (status === 403) {
      toast.error("No tienes permiso para realizar esta acción", {
        id: "forbidden-error",
      });
      if (typeof onForbiddenCallback === "function") {
        onForbiddenCallback();
      }
    }

    return Promise.reject(error);
  }
);
