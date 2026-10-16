import { useState, useMemo } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useClientes } from "../../hooks/useClientes";
import { useProductos } from "../../hooks/useProductos";
import { useInventario } from "../../hooks/useInventario";
import { formatCurrency } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/errors";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineBuildingLibrary,
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
} from "react-icons/hi2";

const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo", icon: HiOutlineBanknotes },
  { value: "TARJETA", label: "Tarjeta de Crédito / Débito", icon: HiOutlineCreditCard },
  { value: "TRANSFERENCIA", label: "Transferencia Bancaria", icon: HiOutlineBuildingLibrary },
];

export function NuevaVentaModal({ isOpen, onClose, onSave }) {
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { productos, isLoading: loadingProds } = useProductos();
  const { inventario } = useInventario();

  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [selectedVarianteId, setSelectedVarianteId] = useState("");
  const [itemCantidad, setItemCantidad] = useState("1");
  const [itemPrecioUnitario, setItemPrecioUnitario] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [items, setItems] = useState([]);

  // Estado para alertas y errores
  const [stockAlert, setStockAlert] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mapa de stock disponible por variante_sku
  const stockMap = useMemo(() => {
    const map = new Map();
    (inventario || []).forEach((inv) => {
      const sku = (inv.variante_sku || "").toUpperCase();
      const current = map.get(sku) || 0;
      map.set(sku, current + Number(inv.inventario_cantidad || 0));
    });
    return map;
  }, [inventario]);

  // Aplanar todas las variantes con su información y stock cruzado
  const allVariantes = useMemo(() => {
    return (productos || []).flatMap((p) =>
      (p.variantes || []).map((v) => {
        const skuUpper = (v.variante_sku || "").toUpperCase();
        const stockActual = stockMap.get(skuUpper) ?? 0;
        return {
          ...v,
          producto_nombre: p.producto_nombre,
          stock_actual: stockActual,
        };
      })
    );
  }, [productos, stockMap]);

  // Variantes filtradas por el buscador de SKU / nombre
  const filteredVariantes = useMemo(() => {
    if (!skuSearch.trim()) return allVariantes;
    const term = skuSearch.trim().toUpperCase();
    return allVariantes.filter(
      (v) =>
        (v.variante_sku || "").toUpperCase().includes(term) ||
        (v.producto_nombre || "").toUpperCase().includes(term) ||
        (v.variante_color || "").toUpperCase().includes(term) ||
        (v.variante_talla || "").toUpperCase().includes(term)
    );
  }, [allVariantes, skuSearch]);

  const varianteSeleccionada = useMemo(() => {
    return allVariantes.find((v) => String(v.variante_id) === String(selectedVarianteId)) || null;
  }, [allVariantes, selectedVarianteId]);

  // Al seleccionar una variante en el buscador
  const handleSelectVariante = (v) => {
    setSelectedVarianteId(String(v.variante_id));
    setSkuSearch(v.variante_sku);
    setItemPrecioUnitario(v.variante_precio_venta != null ? String(v.variante_precio_venta) : "0");
    setItemCantidad("1");
    setFormError("");
    setStockAlert(null);
  };

  // Agregar variante al detalle de la venta
  const handleAddItem = () => {
    setFormError("");
    setStockAlert(null);

    if (!selectedVarianteId || !varianteSeleccionada) {
      setFormError("Por favor busca y selecciona una variante (SKU).");
      return;
    }

    const cant = Number(itemCantidad);
    if (isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      setFormError("La cantidad debe ser un número entero mayor a 0.");
      return;
    }

    const precio = Number(itemPrecioUnitario);
    if (isNaN(precio) || precio < 0) {
      setFormError("El precio unitario debe ser un número mayor o igual a 0.");
      return;
    }

    // Validación preventiva de stock en frontend
    const stockDisp = varianteSeleccionada.stock_actual ?? 0;
    const yaEnCarrito = items
      .filter((it) => it.variante_id === varianteSeleccionada.variante_id)
      .reduce((acc, it) => acc + it.detalle_cantidad, 0);

    const totalSolicitado = yaEnCarrito + cant;
    if (totalSolicitado > stockDisp) {
      setStockAlert(
        `¡Atención! Stock insuficiente para el SKU "${varianteSeleccionada.variante_sku}". Stock disponible en inventario: ${stockDisp}, cantidad total intentando vender: ${totalSolicitado}.`
      );
      return;
    }

    const subtotal = Math.round(cant * precio * 100) / 100;

    const existingIndex = items.findIndex((it) => it.variante_id === varianteSeleccionada.variante_id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].detalle_cantidad += cant;
      updated[existingIndex].detalle_subtotal =
        Math.round(updated[existingIndex].detalle_cantidad * precio * 100) / 100;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          variante_id: Number(varianteSeleccionada.variante_id),
          variante_sku: varianteSeleccionada.variante_sku,
          descripcion: `${varianteSeleccionada.producto_nombre} (Talla: ${varianteSeleccionada.variante_talla} / Color: ${varianteSeleccionada.variante_color})`,
          detalle_cantidad: cant,
          detalle_precio_unitario: precio,
          detalle_subtotal: subtotal,
          stock_actual: stockDisp,
        },
      ]);
    }

    // Reset selección parcial
    setSelectedVarianteId("");
    setSkuSearch("");
    setItemCantidad("1");
    setItemPrecioUnitario("");
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
    setStockAlert(null);
  };

  const handleUpdateCantidad = (index, nuevaCantidad) => {
    const cant = Number(nuevaCantidad);
    if (isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) return;

    const item = items[index];
    if (cant > item.stock_actual) {
      setStockAlert(
        `Stock insuficiente para el SKU "${item.variante_sku}". Stock disponible: ${item.stock_actual}, solicitado: ${cant}.`
      );
      return;
    }
    setStockAlert(null);

    const updated = [...items];
    updated[index].detalle_cantidad = cant;
    updated[index].detalle_subtotal = Math.round(cant * updated[index].detalle_precio_unitario * 100) / 100;
    setItems(updated);
  };

  const totalVenta = useMemo(() => {
    return items.reduce((sum, item) => sum + item.detalle_subtotal, 0);
  }, [items]);

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setStockAlert(null);

    if (!selectedClienteId) {
      setFormError("Debes seleccionar un cliente para registrar la venta.");
      return;
    }

    if (items.length === 0) {
      setFormError("Debes agregar al menos un producto al detalle de la venta.");
      return;
    }

    const payload = {
      cliente_id: Number(selectedClienteId),
      pago_metodo: metodoPago,
      detalles: items.map((it) => ({
        variante_id: it.variante_id,
        detalle_cantidad: it.detalle_cantidad,
        detalle_precio_unitario: it.detalle_precio_unitario,
        detalle_subtotal: it.detalle_subtotal,
      })),
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      // Reset y cerrar
      setSelectedClienteId("");
      setSelectedVarianteId("");
      setSkuSearch("");
      setItems([]);
      setFormError("");
      setStockAlert(null);
      onClose();
    } catch (err) {
      console.error("Error guardando venta:", err);
      // Requerimiento 4: Si el backend devuelve error de stock insuficiente, muestra una alerta al usuario y detén la venta
      const msg = err?.response?.data?.message || getErrorMessage(err);
      setStockAlert(msg || "Error al procesar la venta. Verifique las existencias en inventario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedClienteId("");
      setSelectedVarianteId("");
      setSkuSearch("");
      setItems([]);
      setFormError("");
      setStockAlert(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Nueva Venta"
      description="Selecciona el cliente, agrega las variantes por SKU y especifica el método de pago."
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerta de Stock Insuficiente destacada */}
        {stockAlert && (
          <div
            style={{
              padding: "16px 20px",
              background: "#fef2f2",
              border: "2px solid #ef4444",
              borderRadius: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <HiOutlineExclamationTriangle style={{ fontSize: 24, color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#991b1b" }}>
                Venta Detenida: Stock Insuficiente
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#b91c1c", lineHeight: 1.4 }}>
                {stockAlert}
              </p>
            </div>
          </div>
        )}

        {/* Error general de formulario */}
        {formError && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: 8,
              fontSize: 13,
              color: "#be123c",
            }}
          >
            {formError}
          </div>
        )}

        {/* 1. Selector de Cliente */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Cliente <span style={{ color: "#e11d48" }}>*</span>
          </label>
          <select
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            disabled={isSubmitting || loadingClientes}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              padding: "0 12px",
              fontSize: 14,
              background: "#ffffff",
              color: selectedClienteId ? "#111827" : "#9ca3af",
            }}
          >
            <option value="">-- Seleccionar Cliente --</option>
            {(clientes || []).map((c) => (
              <option key={c.cliente_id} value={c.cliente_id} style={{ color: "#111827" }}>
                {c.cliente_nombre} {c.cliente_dpi_nit ? `(NIT/DPI: ${c.cliente_dpi_nit})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Buscador de Variantes por SKU para agregar al detalle */}
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#4b5563" }}>
            Buscador de Variantes por SKU
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Input de Búsqueda con selector reactivo */}
            <div className="md:col-span-5 relative">
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                Buscar SKU / Producto
              </label>
              <input
                type="text"
                placeholder="Escribe SKU (ej. CAM), polo..."
                value={skuSearch}
                onChange={(e) => {
                  setSkuSearch(e.target.value);
                  setSelectedVarianteId("");
                }}
                disabled={isSubmitting || loadingProds}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  padding: "0 12px",
                  fontSize: 13,
                  background: "#ffffff",
                }}
              />

              {/* Lista desplegable de coincidencias */}
              {skuSearch.trim().length > 0 && !selectedVarianteId && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    marginTop: 4,
                  }}
                >
                  {filteredVariantes.length === 0 ? (
                    <div style={{ padding: "10px 14px", fontSize: 12, color: "#9ca3af" }}>
                      No se encontraron variantes con ese SKU
                    </div>
                  ) : (
                    filteredVariantes.map((v) => (
                      <div
                        key={v.variante_id}
                        onClick={() => handleSelectVariante(v)}
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid #f3f4f6",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                        }}
                        className="hover:bg-gray-50"
                      >
                        <div>
                          <strong style={{ color: "#111827", marginRight: 6 }}>{v.variante_sku}</strong>
                          <span style={{ color: "#4b5563" }}>{v.producto_nombre}</span>
                          <span style={{ color: "#6b7280", marginLeft: 4 }}>
                            ({v.variante_talla} / {v.variante_color})
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 600, color: "#111827", marginRight: 8 }}>
                            {formatCurrency(v.variante_precio_venta)}
                          </span>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: v.stock_actual > 0 ? "#ecfdf5" : "#fef2f2",
                              color: v.stock_actual > 0 ? "#059669" : "#dc2626",
                            }}
                          >
                            Stock: {v.stock_actual}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Variante Seleccionada Badge / Indicador */}
            <div className="md:col-span-3">
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                SKU Seleccionado
              </label>
              <div
                style={{
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: varianteSeleccionada ? "#f0fdf4" : "#f3f4f6",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                {varianteSeleccionada ? (
                  <>
                    <span style={{ fontWeight: 600, color: "#166534" }}>{varianteSeleccionada.variante_sku}</span>
                    <span style={{ fontSize: 11, color: "#15803d" }}>Stock: {varianteSeleccionada.stock_actual}</span>
                  </>
                ) : (
                  <span style={{ color: "#9ca3af" }}>Ninguno</span>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="md:col-span-2">
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={itemCantidad}
                onChange={(e) => setItemCantidad(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  padding: "0 10px",
                  fontSize: 13,
                  textAlign: "center",
                }}
              />
            </div>

            {/* Precio Unitario */}
            <div className="md:col-span-2">
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                Precio Venta (Q)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemPrecioUnitario}
                onChange={(e) => setItemPrecioUnitario(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  padding: "0 10px",
                  fontSize: 13,
                  textAlign: "right",
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddItem}
              disabled={isSubmitting || !selectedVarianteId}
              style={{ fontSize: 12, padding: "7px 14px" }}
            >
              + Agregar al Detalle
            </Button>
          </div>
        </div>

        {/* 3. Tabla del Detalle de la Venta */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Detalle de Venta ({items.length} {items.length === 1 ? "producto" : "productos"})
          </label>

          {items.length === 0 ? (
            <div
              style={{
                border: "2px dashed #e5e7eb",
                borderRadius: 12,
                padding: "24px 16px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              No has agregado productos al detalle de la venta. Busca por SKU arriba y presiona &quot;Agregar&quot;.
            </div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#6b7280", fontSize: 11, textTransform: "uppercase" }}>
                    <th style={{ padding: "10px 14px" }}>SKU</th>
                    <th style={{ padding: "10px 14px" }}>Descripción</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", width: 110 }}>Cantidad</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>P. Unitario</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Subtotal</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={`${item.variante_id}_${idx}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#111827" }}>
                        {item.variante_sku}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#4b5563" }}>
                        {item.descripcion}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          value={item.detalle_cantidad}
                          onChange={(e) => handleUpdateCantidad(idx, e.target.value)}
                          disabled={isSubmitting}
                          style={{
                            width: 60,
                            height: 30,
                            borderRadius: 6,
                            border: "1px solid #d1d5db",
                            textAlign: "center",
                            fontSize: 12,
                          }}
                        />
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "#4b5563" }}>
                        {formatCurrency(item.detalle_precio_unitario)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#111827" }}>
                        {formatCurrency(item.detalle_subtotal)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={isSubmitting}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: "4px 6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 4,
                          }}
                          title="Quitar"
                        >
                          <HiOutlineTrash style={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Selector de Método de Pago y Total de la Venta */}
        <div
          style={{
            background: "#18181b",
            color: "#ffffff",
            borderRadius: 14,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Método de Pago */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a1a1aa", marginBottom: 8 }}>
                Método de Pago <span style={{ color: "#f43f5e" }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {METODOS_PAGO.map((m) => {
                  const Icon = m.icon;
                  const isSelected = metodoPago === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMetodoPago(m.value)}
                      disabled={isSubmitting}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: isSelected ? "2px solid #e4f222" : "1px solid #3f3f46",
                        background: isSelected ? "#27272a" : "transparent",
                        color: isSelected ? "#e4f222" : "#d4d4d8",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon style={{ fontSize: 16 }} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gran Total */}
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a1a1aa", display: "block" }}>
                Total a Cobrar
              </span>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#e4f222", lineHeight: 1.1 }}>
                {formatCurrency(totalVenta)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || items.length === 0 || !selectedClienteId}
            style={{
              background: "#0c0a08",
              borderColor: "#0c0a08",
              color: "#ffffff",
              padding: "10px 24px",
              fontWeight: 600,
            }}
          >
            {isSubmitting ? "Procesando Venta..." : "Completar Venta y Salida"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
