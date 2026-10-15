import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useCategorias } from "../../hooks/useCategorias";
import { getErrorMessage } from "../../utils/errors";
import { categoryNameSchema } from "../../utils/validators";

const categoriaSchema = z.object({
  categoria_nombre: categoryNameSchema,
  categoria_descripcion: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
});

export function CategoriaQuickModal({ isOpen, onClose, onCreated }) {
  const { createCategoria } = useCategorias();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      categoria_nombre: "",
      categoria_descripcion: "",
    },
  });

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const created = await createCategoria({
        categoria_nombre: values.categoria_nombre,
        categoria_descripcion: values.categoria_descripcion || null,
      });
      reset();
      onClose();
      if (onCreated) onCreated(created);
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Categoría" maxWidth="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre de la Categoría *"
          placeholder="Ej. Camisas, Pantalones, Vestidos"
          error={errors.categoria_nombre?.message}
          restrictType="letters"
          {...register("categoria_nombre")}
        />

        <Input
          label="Descripción"
          placeholder="Descripción de la categoría"
          error={errors.categoria_descripcion?.message}
          {...register("categoria_descripcion")}
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
            {isSubmitting ? "Creando..." : "Crear Categoría"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
