import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";
import { PATTERNS } from "../../utils/validators";

const rolSchema = z.object({
  rol_nombre: z
    .string()
    .trim()
    .min(1, "Este campo no puede quedarse vacío")
    .max(50, "Máximo 50 caracteres")
    .refine(
      (val) => PATTERNS.ROLE_NAME.test(val),
      "Solo se permiten letras y espacios (sin números ni caracteres especiales)"
    ),
  rol_descripcion: z
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .optional()
    .or(z.literal("")),
});

export function RolModal({ isOpen, onClose, rol, onSave }) {
  const isEditing = Boolean(rol);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      rol_nombre: "",
      rol_descripcion: "",
    },
  });

  useEffect(() => {
    if (rol) {
      reset({
        rol_nombre: rol.rol_nombre || "",
        rol_descripcion: rol.rol_descripcion || "",
      });
    } else {
      reset({
        rol_nombre: "",
        rol_descripcion: "",
      });
    }
    setApiError("");
  }, [rol, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await onSave({
        rol_nombre: values.rol_nombre.toUpperCase(),
        rol_descripcion: values.rol_descripcion || null,
      });
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Rol" : "Nuevo Rol"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre del Rol"
          placeholder="EJ. SUPERVISOR"
          error={errors.rol_nombre?.message}
          restrictType="letters"
          {...register("rol_nombre")}
        />

        <Input
          label="Descripción"
          placeholder="Descripción de las responsabilidades del rol"
          error={errors.rol_descripcion?.message}
          {...register("rol_descripcion")}
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
