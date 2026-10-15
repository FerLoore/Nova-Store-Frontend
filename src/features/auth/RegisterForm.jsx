import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../api/auth.service";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";
import { personNameSchema, emailSchema } from "../../utils/validators";

const registerSchema = z
  .object({
    usuario_nombre: personNameSchema("El nombre completo"),
    usuario_email: emailSchema("El correo electrónico"),
    usuario_password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirm_password: z
      .string()
      .min(1, "Confirma tu contraseña"),
    rol_id: z.string().optional(),
  })
  .refine((data) => data.usuario_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export function RegisterForm({ onToggleMode }) {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let isMounted = true;
    authService
      .getRoles()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setRoles(data);
        }
      })
      .catch((err) => {
        console.warn("No se pudieron cargar los roles para registro:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      usuario_nombre: "",
      usuario_email: "",
      usuario_password: "",
      confirm_password: "",
      rol_id: "",
    },
  });

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const payload = {
        usuario_nombre: values.usuario_nombre,
        usuario_email: values.usuario_email,
        usuario_password: values.usuario_password,
      };

      if (values.rol_id) {
        payload.rol_id = Number(values.rol_id);
      }

      await registerAuth(payload);
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || getErrorMessage(err));
    }
  };

  const roleOptions = roles.map((r) => ({
    value: String(r.rol_id),
    label: r.rol_nombre,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        label="Nombre Completo"
        placeholder="Ej. Juan Pérez"
        error={errors.usuario_nombre?.message}
        autoComplete="name"
        restrictType="letters"
        {...register("usuario_nombre")}
      />

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@novastore.com"
        error={errors.usuario_email?.message}
        autoComplete="email"
        {...register("usuario_email")}
      />

      {roleOptions.length > 1 && (
        <Select
          label="Rol del Usuario"
          options={roleOptions}
          placeholder="Selecciona un rol"
          error={errors.rol_id?.message}
          {...register("rol_id")}
        />
      )}

      <Input
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        error={errors.usuario_password?.message}
        helperText="Mínimo 8 caracteres"
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#5f5e5d",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        }
        {...register("usuario_password")}
      />

      <Input
        label="Confirmar Contraseña"
        type={showConfirmPassword ? "text" : "password"}
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        autoComplete="new-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#5f5e5d",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showConfirmPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        }
        {...register("confirm_password")}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-2.5 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-ink"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Registrando...</span>
            </>
          ) : (
            "Registrar cuenta"
          )}
        </Button>
      </div>

      {onToggleMode && (
        <div className="text-center pt-2">
          <p style={{ fontSize: 13, color: "#5f5e5d", margin: 0 }}>
            ¿Ya tienes una cuenta?{" "}
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
              Iniciar sesión
            </button>
          </p>
        </div>
      )}
    </form>
  );
}
