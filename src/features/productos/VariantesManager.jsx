import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/errors";
import { colorSchema, priceSchema, stockSchema } from "../../utils/validators";
import { useProductoVariantes } from "../../hooks/useProductos";

const varianteFormSchema = z.object({
  variante_talla: z
    .string()
    .trim()
    .min(1, "La talla es obligatoria")
    .max(10, "Máximo 10 caracteres"),
  variante_color: colorSchema,
  variante_sku: z
    .string()
    .trim()
    .min(1, "El SKU es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  variante_precio_compra: priceSchema("Precio de compra", false),
  variante_precio_venta: priceSchema("Precio de venta", true),
  variante_stock_minimo: stockSchema("Stock mínimo"),
});

export function VariantesManager({ producto, canManage = true, onClose }) {
  const productoId = producto?.producto_id;

  const {
    variantes: fetchedVariantes,
    isLoading,
    addVariante,
    updateVariante,
    deleteVariante,
  } = useProductoVariantes(productoId);

  // Usa las variantes devueltas por el endpoint filtrado por PRODU_PRODUCTO, con fallback a producto.variantes
  const variantes = fetchedVariantes.length > 0 ? fetchedVariantes : (producto?.variantes || []);

  const [formMode, setFormMode] = useState(null); // 'create' | 'edit' | null
  const [editingVariante, setEditingVariante] = useState(null);
  const [deletingVariante, setDeletingVariante] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(varianteFormSchema),
    defaultValues: {
      variante_talla: "",
      variante_color: "",
      variante_sku: "",
      variante_precio_compra: "",
      variante_precio_venta: "",
      variante_stock_minimo: "0",
    },
  });

  const handleStartCreate = () => {
    setApiError("");
    setEditingVariante(null);
    reset({
      variante_talla: "",
      variante_color: "",
      variante_sku: "",
      variante_precio_compra: "",
      variante_precio_venta: "",
      variante_stock_minimo: "0",
    });
    setFormMode("create");
  };

  const handleStartEdit = (v) => {
    setApiError("");
    setEditingVariante(v);
    reset({
      variante_talla: v.variante_talla || "",
      variante_color: v.variante_color || "",
      variante_sku: v.variante_sku || "",
      variante_precio_compra: v.variante_precio_compra != null ? String(v.variante_precio_compra) : "",
      variante_precio_venta: v.variante_precio_venta != null ? String(v.variante_precio_venta) : "",
      variante_stock_minimo: v.variante_stock_minimo != null ? String(v.variante_stock_minimo) : "0",
    });
    setFormMode("edit");
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingVariante(null);
    setApiError("");
    reset();
  };

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const payload = {
        variante_talla: values.variante_talla.toUpperCase(),
        variante_color: values.variante_color.trim(),
        variante_sku: values.variante_sku.trim().toUpperCase(),
        variante_precio_compra:
          values.variante_precio_compra === "" || values.variante_precio_compra === null
            ? null
            : Number(values.variante_precio_compra),
        variante_precio_venta: Number(values.variante_precio_venta),
        variante_stock_minimo:
          values.variante_stock_minimo === "" || values.variante_stock_minimo === null
            ? 0
            : Number(values.variante_stock_minimo),
      };

      if (formMode === "edit" && editingVariante) {
        await updateVariante({
          varianteId: editingVariante.variante_id,
          data: payload,
        });
      } else if (formMode === "create") {
        await addVariante(payload);
      }
      handleCancelForm();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVariante) return;
    setIsDeleting(true);
    try {
      await deleteVariante(deletingVariante.variante_id);
      setDeletingVariante(null);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra superior de estado y acción */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
            Variantes del Producto
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 9999,
              background: "#e5e7eb",
              color: "#0c0a08",
            }}
          >
            {variantes.length} {variantes.length === 1 ? "activa" : "activas"}
          </span>
        </div>

        {canManage && !formMode && (
          <Button variant="compact" onClick={handleStartCreate}>
            + Agregar variante
          </Button>
        )}
      </div>

      {/* Formulario para Crear / Editar Variante */}
      {formMode && (
        <div
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 12,
            padding: 18,
            background: "#f9fafb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", color: "#111827", margin: 0 }}>
              {formMode === "edit" ? "Editar variante" : "Nueva variante para este producto"}
            </p>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              Campos marcados con (*) son obligatorios
            </span>
          </div>

          {apiError && (
            <div
              style={{
                padding: "10px 14px",
                border: "1px solid #f87171",
                background: "#fef2f2",
                borderRadius: 8,
                fontSize: 13,
                color: "#b91c1c",
                lineHeight: 1.5,
              }}
            >
              <strong>Error:</strong> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Input
                label="Talla *"
                placeholder="Ej: S, M, L, 32"
                error={errors.variante_talla?.message}
                {...register("variante_talla")}
              />
              <Input
                label="Color *"
                placeholder="Ej: Negro, Azul"
                error={errors.variante_color?.message}
                restrictType="letters"
                {...register("variante_color")}
              />
              <Input
                label="SKU (Único) *"
                placeholder="Ej: POLO-NEG-M"
                error={errors.variante_sku?.message}
                {...register("variante_sku")}
              />
              <Input
                label="Precio Compra"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                restrictType="decimal"
                error={errors.variante_precio_compra?.message}
                {...register("variante_precio_compra")}
              />
              <Input
                label="Precio Venta *"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                restrictType="decimal"
                error={errors.variante_precio_venta?.message}
                {...register("variante_precio_venta")}
              />
              <Input
                label="Stock Mínimo"
                type="number"
                min="0"
                placeholder="0"
                restrictType="numbers"
                error={errors.variante_stock_minimo?.message}
                {...register("variante_stock_minimo")}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
              <Button
                type="button"
                variant="compact-ghost"
                onClick={handleCancelForm}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="compact"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : (formMode === "edit" ? "Actualizar variante" : "Guardar variante")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla para Listar Variantes */}
      {isLoading ? (
        <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", padding: "20px 0" }}>
          Cargando variantes...
        </p>
      ) : variantes.length === 0 ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 12,
            padding: "32px 16px",
            textAlign: "center",
            background: "#fafafa",
          }}
        >
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>
            Este producto no cuenta con variantes activas registradas.
          </p>
          {canManage && !formMode && (
            <Button variant="compact" onClick={handleStartCreate}>
              + Crear primera variante
            </Button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Talla", "Color", "SKU", "Precio Compra", "Precio Venta", "Stock Mínimo"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#4b5563",
                    }}
                  >
                    {h}
                  </th>
                ))}
                {canManage && (
                  <th
                    style={{
                      padding: "10px 14px",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#4b5563",
                      textAlign: "right",
                    }}
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {variantes.map((v) => (
                <tr
                  key={v.variante_id}
                  style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    {v.variante_talla}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#111827" }}>
                    {v.variante_color}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#4b5563", fontFamily: "monospace", fontWeight: 500 }}>
                    {v.variante_sku}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#4b5563" }}>
                    {v.variante_precio_compra != null ? formatCurrency(v.variante_precio_compra) : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    {formatCurrency(v.variante_precio_venta)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#4b5563" }}>
                    {v.variante_stock_minimo ?? 0}
                  </td>
                  {canManage && (
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="compact"
                          onClick={() => handleStartEdit(v)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="compact-ghost"
                          onClick={() => setDeletingVariante(v)}
                        >
                          Desactivar
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para desactivar variante */}
      <ConfirmDialog
        isOpen={Boolean(deletingVariante)}
        onClose={() => setDeletingVariante(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Variante"
        message={`¿Confirmas que deseas desactivar la variante SKU "${deletingVariante?.variante_sku}" (${deletingVariante?.variante_talla} / ${deletingVariante?.variante_color})?`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
