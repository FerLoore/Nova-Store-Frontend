import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatters";
import { HiOutlineCheck } from "react-icons/hi2";

export function CompraDetailModal({ isOpen, onClose, compra, onRecibir, isRecibiendo }) {
  if (!compra) return null;

  const isPendiente = compra.compra_estado === "PENDIENTE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Orden de Compra #${compra.compra_id}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Cabecera de Compra */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280" }}>
              Proveedor
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {compra.proveedor?.proveedor_nombre || "—"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280" }}>
              Fecha
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#111827" }}>
              {compra.compra_fecha ? new Date(compra.compra_fecha).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280" }}>
              Registrado por
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#111827" }}>
              {compra.usuario?.usuario_nombre || "Usuario"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280" }}>
              Estado
            </span>
            <div style={{ marginTop: 2 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    compra.compra_estado === "RECIBIDA"
                      ? "#dcfce7"
                      : compra.compra_estado === "CANCELADA"
                      ? "#fee2e2"
                      : "#fef3c7",
                  color:
                    compra.compra_estado === "RECIBIDA"
                      ? "#15803d"
                      : compra.compra_estado === "CANCELADA"
                      ? "#b91c1c"
                      : "#b45309",
                }}
              >
                {compra.compra_estado}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de Detalle */}
        <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563" }}>SKU</th>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563" }}>Producto / Variante</th>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Cantidad</th>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Precio Unitario</th>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#4b5563", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {compra.detalles?.map((det) => (
                <tr key={det.detalle_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#111827" }}>
                    {det.variante?.variante_sku || "—"}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                    {det.variante?.producto?.producto_nombre || "Variante"} ({det.variante?.variante_talla} / {det.variante?.variante_color})
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#111827", textAlign: "right", fontWeight: 600 }}>
                    {det.detalle_cantidad}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#4b5563", textAlign: "right" }}>
                    {formatCurrency(det.detalle_precio_unitario)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right" }}>
                    {formatCurrency(det.detalle_subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb" }}>
                <td colSpan={4} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: 13 }}>
                  TOTAL ORDEN DE COMPRA:
                </td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 15, color: "#111827" }}>
                  {formatCurrency(compra.compra_total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Recepción Física de Mercadería */}
        {isPendiente && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900 m-0">
                  Protocolo de Recepción Física e Inspección de Lote
                </p>
                <p className="text-xs text-amber-800 m-0 mt-0.5">
                  Verifica que los paquetes coincidan con las cantidades y especificaciones de la orden antes de dar ingreso al almacén.
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-950">
                Pendiente de Inspección
              </span>
            </div>

            <div className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-amber-200 divide-y divide-gray-100">
              {compra.detalles?.map((det) => (
                <div key={det.detalle_id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {det.variante?.producto?.producto_nombre} — {det.variante?.variante_talla} / {det.variante?.variante_color} ({det.variante?.variante_sku})
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Esperado: {det.detalle_cantidad} uds.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <div>
            {isPendiente && (
              <Button
                variant="primary"
                onClick={() => onRecibir(compra.compra_id)}
                disabled={isRecibiendo}
                style={{ background: "#15803d", borderColor: "#15803d" }}
              >
                {isRecibiendo ? (
                  "Procesando ingreso..."
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <HiOutlineCheck style={{ fontSize: 16 }} />
                    <span>Confirmar Recepción y Cargar a Stock</span>
                  </span>
                )}
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
