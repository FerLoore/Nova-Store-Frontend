import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";

const loginSchema = z.object({
  usuario_email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  usuario_password: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export function LoginForm({ onToggleMode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario_email: "",
      usuario_password: "",
    },
  });

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await login(values);
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div
          style={{
            padding: "10px 14px",
            border: "1px solid #b42318",
            borderRadius: 10,
            fontSize: 13,
            color: "#b42318",
            background: "#fff5f5",
          }}
        >
          {apiError}
        </div>
      )}

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@novastore.com"
        error={errors.usuario_email?.message}
        autoComplete="email"
        {...register("usuario_email")}
      />

      <Input
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        error={errors.usuario_password?.message}
        autoComplete="current-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#5f5e5d",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0c0a08")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5f5e5d")}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        }
        {...register("usuario_password")}
      />

            <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-2.5"
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </div>

      {onToggleMode && (
        <div className="text-center pt-2">
          <p style={{ fontSize: 13, color: "#5f5e5d", margin: 0 }}>
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#0c0a08",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Registrarse
            </button>
          </p>
        </div>
      )}
    </form>
  );
}
