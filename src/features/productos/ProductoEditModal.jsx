import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useCategorias } from "../../hooks/useCategorias";
import { useMarcas } from "../../hooks/useMarcas";
import { getErrorMessage } from "../../utils/errors";
import { productNameSchema } from "../../utils/validators";

const productoEditSchema = z.object({
  categoria_id: z.coerce.number().int().positive("Selecciona una categoría"),
  marca_id: z.coerce.number().int().positive("Selecciona una marca"),
  producto_nombre: productNameSchema,
  producto_genero: z.enum(["HOMBRE", "MUJER", "UNISEX"], {
    errorMap: () => ({ message: "Selecciona un género válido" }),
  }),
  producto_temporada: z.string().trim().optional().or(z.literal("")),
  producto_descripcion: z.string().trim().optional().or(z.literal("")),
});

export function ProductoEditModal({ isOpen, onClose, producto, onSave }) {
  const { categorias, isLoading: loadingCats } = useCategorias();
  const { marcas, isLoading: loadingMarcas } = useMarcas();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productoEditSchema),
    defaultValues: {
      categoria_id: "",
      marca_id: "",
      producto_nombre: "",
      producto_genero: "UNISEX",
      producto_temporada: "",
      producto_descripcion: "",
    },
  });

  useEffect(() => {
    if (producto) {
      reset({
        categoria_id: producto.categoria_id || "",
        marca_id: producto.marca_id || "",
        producto_nombre: producto.producto_nombre || "",
        producto_genero: producto.producto_genero || "UNISEX",
        producto_temporada: producto.producto_temporada || "",
        producto_descripcion: producto.producto_descripcion || "",
      });
    }
    setApiError("");
  }, [producto, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await onSave({
        categoria_id: values.categoria_id,
        marca_id: values.marca_id,
        producto_nombre: values.producto_nombre,
        producto_genero: values.producto_genero,
        producto_temporada: values.producto_temporada || null,
        producto_descripcion: values.producto_descripcion || null,
      });
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const categoriaOptions = categorias.map((c) => ({
    value: c.categoria_id,
    label: c.categoria_nombre,
  }));

  const marcaOptions = marcas.map((m) => ({
    value: m.marca_id,
    label: m.marca_nombre,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Datos del Producto"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre del Producto *"
          placeholder="Ej. Sudadera Oversize Fleece"
          error={errors.producto_nombre?.message}
          restrictType="letters"
          {...register("producto_nombre")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Categoría *"
            options={categoriaOptions}
            placeholder={loadingCats ? "Cargando..." : "Seleccionar categoría"}
            error={errors.categoria_id?.message}
            {...register("categoria_id")}
          />

          <Select
            label="Marca *"
            options={marcaOptions}
            placeholder={loadingMarcas ? "Cargando..." : "Seleccionar marca"}
            error={errors.marca_id?.message}
            {...register("marca_id")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Género *"
            error={errors.producto_genero?.message}
            {...register("producto_genero")}
          >
            <option value="UNISEX">UNISEX</option>
            <option value="HOMBRE">HOMBRE</option>
            <option value="MUJER">MUJER</option>
          </Select>

          <Input
            label="Temporada"
            placeholder="Ej. Otoño / Invierno"
            error={errors.producto_temporada?.message}
            {...register("producto_temporada")}
          />
        </div>

        <Input
          label="Descripción"
          placeholder="Detalles del producto"
          error={errors.producto_descripcion?.message}
          {...register("producto_descripcion")}
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
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
