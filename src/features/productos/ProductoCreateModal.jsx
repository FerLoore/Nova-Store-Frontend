import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { CategoriaQuickModal } from "./CategoriaQuickModal";
import { useCategorias } from "../../hooks/useCategorias";
import { useMarcas } from "../../hooks/useMarcas";
import { getErrorMessage } from "../../utils/errors";
import { colorSchema, priceSchema, stockSchema, productNameSchema } from "../../utils/validators";
import { HiOutlineTrash } from "react-icons/hi2";
import { TALLAS_DISPONIBLES } from "./VariantesManager";

const varianteItemSchema = z
  .object({
    variante_talla: z.string().trim().min(1, "Selecciona una talla"),
    variante_color: colorSchema,
    variante_sku: z.string().trim().min(1, "SKU Requerido"),
    variante_precio_compra: priceSchema("Precio de compra", false),
    variante_precio_venta: priceSchema("Precio de venta", true),
    variante_stock_minimo: stockSchema("Stock mínimo"),
  })
  .refine(
    (v) => {
      const compra = Number(v.variante_precio_compra);
      const venta = Number(v.variante_precio_venta);
      if (!isNaN(compra) && !isNaN(venta) && compra > 0) {
        return venta >= compra;
      }
      return true;
    },
    {
      message: "El precio de venta no puede ser menor al de compra",
      path: ["variante_precio_venta"],
    }
  );

const productoCreateSchema = z
  .object({
    categoria_id: z.coerce.number().int().positive("Selecciona una categoría"),
    marca_id: z.coerce.number().int().positive("Selecciona una marca"),
    producto_nombre: productNameSchema,
    producto_genero: z.enum(["HOMBRE", "MUJER", "UNISEX"], {
      errorMap: () => ({ message: "Selecciona un género válido" }),
    }),
    producto_temporada: z.string().trim().optional().or(z.literal("")),
    producto_descripcion: z.string().trim().optional().or(z.literal("")),
    variantes: z
      .array(varianteItemSchema)
      .min(1, "Debe incluir al menos una variante"),
  })
  .superRefine((data, ctx) => {
    const skus = new Set();
    const combos = new Set();

    data.variantes.forEach((v, index) => {
      const sku = (v.variante_sku || "").toUpperCase();
      if (sku) {
        if (skus.has(sku)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El SKU "${sku}" está repetido`,
            path: ["variantes", index, "variante_sku"],
          });
        }
        skus.add(sku);
      }

      const combo = `${(v.variante_talla || "").toUpperCase()}|${(
        v.variante_color || ""
      ).toUpperCase()}`;
      if (v.variante_talla && v.variante_color) {
        if (combos.has(combo)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Combinación de talla y color repetida",
            path: ["variantes", index, "variante_talla"],
          });
        }
        combos.add(combo);
      }
    });
  });

export function ProductoCreateModal({ isOpen, onClose, onSave }) {
  const { categorias, isLoading: loadingCats } = useCategorias();
  const { marcas, isLoading: loadingMarcas } = useMarcas();
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productoCreateSchema),
    defaultValues: {
      categoria_id: "",
      marca_id: "",
      producto_nombre: "",
      producto_genero: "UNISEX",
      producto_temporada: "",
      producto_descripcion: "",
      variantes: [
        {
          variante_talla: "M",
          variante_color: "Negro",
          variante_sku: "",
          variante_precio_compra: "",
          variante_precio_venta: "",
          variante_stock_minimo: "0",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });

  const handleClose = () => {
    reset();
    setApiError("");
    onClose();
  };

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const payload = {
        categoria_id: values.categoria_id,
        marca_id: values.marca_id,
        producto_nombre: values.producto_nombre,
        producto_genero: values.producto_genero,
        producto_temporada: values.producto_temporada || null,
        producto_descripcion: values.producto_descripcion || null,
        variantes: values.variantes.map((v) => ({
          variante_talla: v.variante_talla.toUpperCase(),
          variante_color: v.variante_color,
          variante_sku: v.variante_sku.toUpperCase(),
          variante_precio_compra:
            v.variante_precio_compra === "" || v.variante_precio_compra === null
              ? null
              : Number(v.variante_precio_compra),
          variante_precio_venta: Number(v.variante_precio_venta),
          variante_stock_minimo:
            v.variante_stock_minimo === "" || v.variante_stock_minimo === null
              ? null
              : Number(v.variante_stock_minimo),
        })),
      };

      await onSave(payload);
      handleClose();
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Crear Nuevo Producto"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {apiError && (
            <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
              {apiError}
            </div>
          )}

          {/* Información General */}
          <div>
            <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: 0 }}>
                1. Información general
              </p>
            </div>
            <div className="space-y-4">
              <Input
                label="Nombre del Producto *"
                placeholder="Ej. Sudadera Oversize Fleece"
                error={errors.producto_nombre?.message}
                restrictType="letters"
                {...register("producto_nombre")}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
                      Categoría *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(true)}
                      style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#0c0a08", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      + Nueva categoría
                    </button>
                  </div>
                  <Select
                    options={categoriaOptions}
                    placeholder={loadingCats ? "Cargando..." : "Seleccionar categoría"}
                    error={errors.categoria_id?.message}
                    {...register("categoria_id")}
                  />
                </div>

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
                  <option value="UNISEX">Unisex</option>
                  <option value="HOMBRE">Hombre</option>
                  <option value="MUJER">Mujer</option>
                </Select>

                <Input
                  label="Temporada"
                  placeholder="Ej. Primavera / Verano 2026"
                  error={errors.producto_temporada?.message}
                  {...register("producto_temporada")}
                />
              </div>

              <Input
                label="Descripción"
                placeholder="Detalles sobre tela, corte y composición"
                error={errors.producto_descripcion?.message}
                {...register("producto_descripcion")}
              />
            </div>
          </div>

          {/* Variantes Dinámicas */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: 0 }}>
                2. Variantes del producto ({fields.length})
              </p>
              <Button
                type="button"
                variant="compact"
                onClick={() =>
                  append({
                    variante_talla: "M",
                    variante_color: "",
                    variante_sku: "",
                    variante_precio_compra: "",
                    variante_precio_venta: "",
                    variante_stock_minimo: "0",
                  })
                }
              >
                + Agregar variante
              </Button>
            </div>

            {errors.variantes?.root && (
              <p style={{ fontSize: 12, color: "#b42318", marginBottom: 12 }}>
                {errors.variantes.root.message}
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#ffffff", position: "relative" }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
                      Variante #{idx + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#b42318",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <HiOutlineTrash style={{ fontSize: 14 }} />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#5f5e5d",
                          marginBottom: 5,
                        }}
                      >
                        Talla *
                      </label>
                      <select
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontSize: 14,
                          lineHeight: 1.4,
                          border: errors.variantes?.[idx]?.variante_talla ? "1px solid #b42318" : "1px solid #e5e7eb",
                          background: "#ffffff",
                          color: "#0c0a08",
                          outline: "none",
                        }}
                        {...register(`variantes.${idx}.variante_talla`)}
                      >
                        <option value="">-- Talla --</option>
                        {TALLAS_DISPONIBLES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.variantes?.[idx]?.variante_talla && (
                        <p style={{ marginTop: 4, fontSize: 12, color: "#b42318", lineHeight: 1.4 }}>
                          {errors.variantes[idx].variante_talla.message}
                        </p>
                      )}
                    </div>

                    <Input
                      label="Color *"
                      placeholder="Negro, Gris..."
                      error={errors.variantes?.[idx]?.variante_color?.message}
                      restrictType="letters"
                      {...register(`variantes.${idx}.variante_color`)}
                    />

                    <Input
                      label="SKU *"
                      placeholder="SUD-OVR-M-NEG"
                      error={errors.variantes?.[idx]?.variante_sku?.message}
                      {...register(`variantes.${idx}.variante_sku`)}
                    />

                    <Input
                      label="P. Compra"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      restrictType="decimal"
                      error={
                        errors.variantes?.[idx]?.variante_precio_compra?.message
                      }
                      {...register(`variantes.${idx}.variante_precio_compra`)}
                    />

                    <Input
                      label="P. Venta *"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      restrictType="decimal"
                      error={
                        errors.variantes?.[idx]?.variante_precio_venta?.message
                      }
                      {...register(`variantes.${idx}.variante_precio_venta`)}
                    />

                    <Input
                      label="Stock Mínimo"
                      type="number"
                      min="0"
                      placeholder="0"
                      restrictType="numbers"
                      error={
                        errors.variantes?.[idx]?.variante_stock_minimo?.message
                      }
                      {...register(`variantes.${idx}.variante_stock_minimo`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando Producto..." : "Guardar Producto"}
            </Button>
          </div>
        </form>
      </Modal>

      <CategoriaQuickModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onCreated={(newCat) => {
          if (newCat?.categoria_id) {
            setValue("categoria_id", newCat.categoria_id);
          }
        }}
      />
    </>
  );
}
