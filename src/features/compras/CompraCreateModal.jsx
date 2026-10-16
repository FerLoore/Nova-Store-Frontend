import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useProveedores } from "../../hooks/useProveedores";
import { useProductos } from "../../hooks/useProductos";
import { formatCurrency } from "../../utils/formatters";
import { HiOutlineTrash } from "react-icons/hi2";

export function CompraCreateModal({ isOpen, onClose, onSave }) {
  const { proveedores, isLoading: loadingProvs } = useProveedores();
  const { productos, isLoading: loadingProds } = useProductos();

  const [selectedProveedorId, setSelectedProveedorId] = useState("");
  const [selectedVarianteId, setSelectedVarianteId] = useState("");
  const [itemCantidad, setItemCantidad] = useState("1");
  const [itemPrecioUnitario, setItemPrecioUnitario] = useState("");
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aplanar todas las variantes de todos los productos para el selector de SKU
  const allVariantes = (productos || []).flatMap((p) =>
    (p.variantes || []).map((v) => ({
      ...v,
      producto_nombre: p.producto_nombre,
    }))
  );

  const handleVarianteChange = (e) => {
    const vId = e.target.value;
    setSelectedVarianteId(vId);
    if (!vId) return;

    const found = allVariantes.find((v) => String(v.variante_id) === String(vId));
    if (found) {
      // Sugerir precio de compra si está definido en la variante
      if (found.variante_precio_compra != null) {
        setItemPrecioUnitario(String(found.variante_precio_compra));
      } else {
        setItemPrecioUnitario("");
      }
    }
  };

  const handleAddItem = () => {
    setErrorMsg("");
    if (!selectedVarianteId) {
      setErrorMsg("Selecciona una variante (SKU) para agregar.");
      return;
    }

    const cant = Number(itemCantidad);
    if (isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      setErrorMsg("La cantidad debe ser un número entero mayor a 0.");
      return;
    }

    const precio = Number(itemPrecioUnitario);
    if (isNaN(precio) || precio < 0) {
      setErrorMsg("El precio unitario debe ser un número mayor o igual a 0.");
      return;
    }

    const variante = allVariantes.find((v) => String(v.variante_id) === String(selectedVarianteId));
    if (!variante) {
      setErrorMsg("Variante no encontrada.");
      return;
    }

    // Si ya existe en la lista de items, sumamos la cantidad
    const existingIndex = items.findIndex((it) => it.variante_id === Number(selectedVarianteId));
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].detalle_cantidad += cant;
      updated[existingIndex].detalle_subtotal = Math.round(updated[existingIndex].detalle_cantidad * precio * 100) / 100;
      setItems(updated);
    } else {
      const subtotal = Math.round(cant * precio * 100) / 100;
      setItems([
        ...items,
        {
          variante_id: Number(selectedVarianteId),
          variante_sku: variante.variante_sku,
          descripcion: `${variante.producto_nombre} (${variante.variante_talla} / ${variante.variante_color})`,
          detalle_cantidad: cant,
          detalle_precio_unitario: precio,
          detalle_subtotal: subtotal,
        },
      ]);
    }

    // Reset selección de item
    setSelectedVarianteId("");
    setItemCantidad("1");
    setItemPrecioUnitario("");
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalCalculado = items.reduce((acc, it) => acc + it.detalle_subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedProveedorId) {
      setErrorMsg("Selecciona un proveedor.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Debes agregar al menos 1 producto al detalle de la orden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        proveedor_id: Number(selectedProveedorId),
        detalles: items.map((it) => ({
          variante_id: it.variante_id,
          detalle_cantidad: it.detalle_cantidad,
          detalle_precio_unitario: it.detalle_precio_unitario,
        })),
      });
      // Reset y cerrar
      setItems([]);
      setSelectedProveedorId("");
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || "Error al crear la orden de compra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const proveedorOptions = (proveedores || []).map((p) => ({
    value: p.proveedor_id,
    label: `${p.proveedor_nombre} ${p.proveedor_ruc_nit ? `(${p.proveedor_ruc_nit})` : ""}`,
  }));

  const varianteOptions = allVariantes.map((v) => ({
    value: v.variante_id,
    label: `[${v.variante_sku}] ${v.producto_nombre} - Talla: ${v.variante_talla}, Color: ${v.variante_color}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Orden de Compra"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5, background: "#fef2f2" }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* 1. Selector de Proveedor */}
        <div className="p-4 rounded-xl" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <Select
            label="Proveedor *"
            options={proveedorOptions}
            placeholder={loadingProvs ? "Cargando proveedores..." : "Selecciona el proveedor"}
            value={selectedProveedorId}
            onChange={(e) => setSelectedProveedorId(e.target.value)}
          />
        </div>

        {/* 2. Selector de Variantes por SKU y campos de detalle */}
        <div className="p-4 rounded-xl space-y-3" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#4b5563" }}>
            Agregar Productos a la Orden
          </p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <Select
                label="Variante (Buscar por SKU) *"
                options={varianteOptions}
                placeholder={loadingProds ? "Cargando catálogo..." : "Selecciona la variante por SKU"}
                value={selectedVarianteId}
                onChange={handleVarianteChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Cantidad *"
                type="number"
                min="1"
                placeholder="1"
                restrictType="numbers"
                value={itemCantidad}
                onChange={(e) => setItemCantidad(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="P. Unitario *"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                restrictType="decimal"
                value={itemPrecioUnitario}
                onChange={(e) => setItemPrecioUnitario(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="button" variant="compact" onClick={handleAddItem} className="w-full">
                + Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Columnas de detalle: SKU, Cantidad, Precio Unitario, Subtotal */}
        <div className="space-y-2">
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#4b5563" }}>
            Detalle de la Orden ({items.length} items)
          </p>

          {items.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: 12, color: "#6b7280", fontSize: 13 }}>
              No has agregado productos a la orden aún. Selecciona una variante arriba para empezar.
            </div>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563" }}>SKU</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563" }}>Producto</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Cantidad</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Precio Unitario</th>
                    <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Subtotal</th>
                    <th style={{ padding: "10px 14px", width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.variante_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#111827" }}>
                        {it.variante_sku}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                        {it.descripcion}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right" }}>
                        {it.detalle_cantidad}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#4b5563", textAlign: "right" }}>
                        {formatCurrency(it.detalle_precio_unitario)}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right" }}>
                        {formatCurrency(it.detalle_subtotal)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#b91c1c",
                            cursor: "pointer",
                            padding: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 4,
                          }}
                          title="Eliminar item"
                        >
                          <HiOutlineTrash style={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f9fafb" }}>
                    <td colSpan={4} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: 13 }}>
                      TOTAL COMPRA:
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 16, color: "#111827" }}>
                      {formatCurrency(totalCalculado)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? "Creando orden..." : "Guardar Orden de Compra"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
