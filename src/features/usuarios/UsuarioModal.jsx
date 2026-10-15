import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useRoles } from "../../hooks/useRoles";
import { getErrorMessage } from "../../utils/errors";
import { personNameSchema, emailSchema } from "../../utils/validators";

const createUsuarioSchema = (isEditing) =>
  z.object({
    rol_id: z.coerce.number().int().positive("Debes seleccionar un rol"),
    usuario_nombre: personNameSchema("El nombre"),
    usuario_email: emailSchema("El correo electrónico"),
    usuario_password: isEditing
      ? z
          .string()
          .refine(
            (val) => !val || (val.length >= 8 && val.length <= 72),
            "La contraseña debe tener entre 8 y 72 caracteres"
          )
      : z
          .string()
          .min(8, "La contraseña debe tener al menos 8 caracteres")
          .max(72, "Máximo 72 caracteres"),
  });

export function UsuarioModal({ isOpen, onClose, usuario, onSave }) {
  const isEditing = Boolean(usuario);
  const { roles, isLoading: loadingRoles } = useRoles();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUsuarioSchema(isEditing)),
    defaultValues: {
      rol_id: "",
      usuario_nombre: "",
      usuario_email: "",
      usuario_password: "",
    },
  });

  useEffect(() => {
    if (usuario) {
      reset({
        rol_id: usuario.rol_id,
        usuario_nombre: usuario.usuario_nombre,
        usuario_email: usuario.usuario_email,
        usuario_password: "",
      });
    } else {
      reset({
        rol_id: "",
        usuario_nombre: "",
        usuario_email: "",
        usuario_password: "",
      });
    }
    setApiError("");
  }, [usuario, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const payload = {
        rol_id: values.rol_id,
        usuario_nombre: values.usuario_nombre,
        usuario_email: values.usuario_email,
      };

      if (values.usuario_password) {
        payload.usuario_password = values.usuario_password;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const rolOptions = roles.map((r) => ({
    value: r.rol_id,
    label: r.rol_nombre,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre Completo"
          placeholder="Ej. Juan Pérez"
          error={errors.usuario_nombre?.message}
          restrictType="letters"
          {...register("usuario_nombre")}
        />

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="juan@novastore.com"
          error={errors.usuario_email?.message}
          {...register("usuario_email")}
        />

        <Select
          label="Rol del Usuario"
          options={rolOptions}
          placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"}
          error={errors.rol_id?.message}
          {...register("rol_id")}
        />

        <Input
          label={
            isEditing
              ? "Contraseña (dejar vacío para no cambiarla)"
              : "Contraseña"
          }
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.usuario_password?.message}
          helperText={
            isEditing
              ? "Ingresa un nuevo valor solo si deseas actualizar la clave (8-72 caracteres)"
              : "Mínimo 8 caracteres, máximo 72"
          }
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

        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
