import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";

const marcaSchema = z.object({
  marca_nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la marca es obligatorio")
    .max(80, "Máximo 80 caracteres"),
  marca_descripcion: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
});

export function MarcaModal({ isOpen, onClose, marca, onSave }) {
  const isEditing = Boolean(marca);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(marcaSchema),
    defaultValues: {
      marca_nombre: "",
      marca_descripcion: "",
    },
  });

  useEffect(() => {
    if (marca) {
      reset({
        marca_nombre: marca.marca_nombre || "",
        marca_descripcion: marca.marca_descripcion || "",
      });
    } else {
      reset({
        marca_nombre: "",
        marca_descripcion: "",
      });
    }
    setApiError("");
  }, [marca, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await onSave({
        marca_nombre: values.marca_nombre,
        marca_descripcion: values.marca_descripcion || null,
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
      title={isEditing ? "Editar Marca" : "Nueva Marca"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre de la Marca *"
          placeholder="Ej. Zara, Nike, Adanola"
          error={errors.marca_nombre?.message}
          {...register("marca_nombre")}
        />

        <Input
          label="Descripción"
          placeholder="Descripción de la marca o estilo"
          error={errors.marca_descripcion?.message}
          {...register("marca_descripcion")}
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
