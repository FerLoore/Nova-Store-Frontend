import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";
import { phoneSchema, emailSchema } from "../../utils/validators";

const proveedorSchema = z.object({
  proveedor_nombre: z
    .string()
    .trim()
    .min(1, "El nombre del proveedor es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  proveedor_ruc_nit: z.string().trim().max(30, "Máximo 30 caracteres").optional().or(z.literal("")),
  proveedor_telefono: phoneSchema,
  proveedor_correo: z.string().trim().email("Formato de correo inválido").max(120, "Máximo 120 caracteres").optional().or(z.literal("")),
  proveedor_direccion: z.string().trim().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
});

export function ProveedorModal({ isOpen, onClose, proveedor, onSave }) {
  const isEditing = Boolean(proveedor);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      proveedor_nombre: "",
      proveedor_ruc_nit: "",
      proveedor_telefono: "",
      proveedor_correo: "",
      proveedor_direccion: "",
    },
  });

  useEffect(() => {
    if (proveedor) {
      reset({
        proveedor_nombre: proveedor.proveedor_nombre || "",
        proveedor_ruc_nit: proveedor.proveedor_ruc_nit || "",
        proveedor_telefono: proveedor.proveedor_telefono || "",
        proveedor_correo: proveedor.proveedor_correo || "",
        proveedor_direccion: proveedor.proveedor_direccion || "",
      });
    } else {
      reset({
        proveedor_nombre: "",
        proveedor_ruc_nit: "",
        proveedor_telefono: "",
        proveedor_correo: "",
        proveedor_direccion: "",
      });
    }
    setApiError("");
  }, [proveedor, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await onSave({
        proveedor_nombre: values.proveedor_nombre,
        proveedor_ruc_nit: values.proveedor_ruc_nit || null,
        proveedor_telefono: values.proveedor_telefono || null,
        proveedor_correo: values.proveedor_correo || null,
        proveedor_direccion: values.proveedor_direccion || null,
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
      title={isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre o Razón Social *"
          placeholder="Ej: Distribuidora Textil S.A."
          error={errors.proveedor_nombre?.message}
          {...register("proveedor_nombre")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="RUC / NIT"
            placeholder="Ej: 12345678-9"
            error={errors.proveedor_ruc_nit?.message}
            {...register("proveedor_ruc_nit")}
          />
          <Input
            label="Teléfono"
            placeholder="Ej: 555-1234"
            error={errors.proveedor_telefono?.message}
            restrictType="phone"
            {...register("proveedor_telefono")}
          />
        </div>

        <Input
          label="Correo Electrónico"
          placeholder="contacto@proveedor.com"
          type="email"
          error={errors.proveedor_correo?.message}
          {...register("proveedor_correo")}
        />

        <Input
          label="Dirección"
          placeholder="Zona industrial, Calle 5 #10-20"
          error={errors.proveedor_direccion?.message}
          {...register("proveedor_direccion")}
        />

        <div className="flex items-center justify-end gap-2 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Proveedor" : "Guardar Proveedor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
