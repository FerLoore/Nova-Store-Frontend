import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/errors";
import { colorSchema, priceSchema, stockSchema } from "../../utils/validators";

const varianteFormSchema = z.object({
  variante_talla: z.string().trim().min(1, "Requerido"),
  variante_color: colorSchema,
  variante_sku: z.string().trim().min(1, "SKU Requerido"),
  variante_precio_compra: priceSchema("Precio de compra", false),
  variante_precio_venta: priceSchema("Precio de venta", true),
  variante_stock_minimo: stockSchema("Stock mínimo"),
});

export function VariantesModal({
  isOpen,
  onClose,
  producto,
  canManage,
  onAddVariante,
  onUpdateVariante,
  onDeleteVariante,
}) {
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
  });

  const variantes = producto?.variantes || [];

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
      variante_precio_compra: v.variante_precio_compra ?? "",
      variante_precio_venta: v.variante_precio_venta ?? "",
      variante_stock_minimo: v.variante_stock_minimo ?? "",
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
        variante_color: values.variante_color,
        variante_sku: values.variante_sku.toUpperCase(),
        variante_precio_compra:
          values.variante_precio_compra === "" || values.variante_precio_compra === null
            ? null
            : Number(values.variante_precio_compra),
        variante_precio_venta: Number(values.variante_precio_venta),
        variante_stock_minimo:
          values.variante_stock_minimo === "" || values.variante_stock_minimo === null
            ? null
            : Number(values.variante_stock_minimo),
      };

      if (formMode === "edit" && editingVariante) {
        await onUpdateVariante({
          varianteId: editingVariante.variante_id,
          data: payload,
        });
      } else if (formMode === "create") {
        await onAddVariante({
          productoId: producto.producto_id,
          data: payload,
        });
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
      await onDeleteVariante(deletingVariante.variante_id);
      setDeletingVariante(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Variantes — ${producto?.producto_nombre || ""}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
              Total activas: {variantes.length}
            </span>
            {canManage && !formMode && (
              <Button variant="compact" onClick={handleStartCreate}>
                + Agregar variante
              </Button>
            )}
          </div>

          {/* Formulario Inline Agregar / Editar Variante */}
          {formMode && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#f4f2f0" }} className="space-y-4">
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: 0 }}>
                {formMode === "edit" ? "Editar variante" : "Nueva variante"}
              </p>

              {apiError && (
                <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Input
                    label="Talla *"
                    placeholder="S, M..."
                    error={errors.variante_talla?.message}
                    {...register("variante_talla")}
                  />
                  <Input
                    label="Color *"
                    placeholder="Azul, Rojo..."
                    error={errors.variante_color?.message}
                    restrictType="letters"
                    {...register("variante_color")}
                  />
                  <Input
                    label="SKU *"
                    placeholder="SKU-123"
                    error={errors.variante_sku?.message}
                    {...register("variante_sku")}
                  />
                  <Input
                    label="P. Compra"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    restrictType="decimal"
                    error={errors.variante_precio_compra?.message}
                    {...register("variante_precio_compra")}
                  />
                  <Input
                    label="P. Venta *"
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

                <div className="flex items-center justify-end gap-2 pt-2">
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
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de Variantes */}
          {variantes.length === 0 ? (
            <p style={{ fontSize: 13, color: "#5f5e5d", textAlign: "center", padding: "24px 0" }}>
              Este producto no tiene variantes activas.
            </p>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f4f2f0", borderBottom: "1px solid #e5e7eb" }}>
                    {["Talla", "Color", "SKU", "P. Compra", "P. Venta", "Stock Mín."].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
                        {h}
                      </th>
                    ))}
                    {canManage && <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", textAlign: "right" }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v) => (
                    <tr
                      key={v.variante_id}
                      style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.12s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f4f2f0"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 500, color: "#0c0a08" }}>{v.variante_talla}</td>
                      <td style={{ padding: "12px 12px", fontSize: 13, color: "#0c0a08" }}>{v.variante_color}</td>
                      <td style={{ padding: "12px 12px", fontSize: 12, color: "#5f5e5d", fontFamily: "monospace" }}>
                        {v.variante_sku}
                      </td>
                      <td style={{ padding: "12px 12px", fontSize: 13, color: "#5f5e5d" }}>
                        {v.variante_precio_compra != null
                          ? formatCurrency(v.variante_precio_compra)
                          : "—"}
                      </td>
                      <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 500, color: "#0c0a08" }}>
                        {formatCurrency(v.variante_precio_venta)}
                      </td>
                      <td style={{ padding: "12px 12px", fontSize: 13, color: "#5f5e5d" }}>{v.variante_stock_minimo ?? "0"}</td>
                      {canManage && (
                        <td style={{ padding: "12px 12px", textAlign: "right" }}>
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

          <div className="flex justify-end pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmar Desactivación de Variante */}
      <ConfirmDialog
        isOpen={Boolean(deletingVariante)}
        onClose={() => setDeletingVariante(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Variante"
        message={`¿Confirmas desactivar la variante SKU "${deletingVariante?.variante_sku}" (${deletingVariante?.variante_talla} / ${deletingVariante?.variante_color})?`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </>
  );
}
