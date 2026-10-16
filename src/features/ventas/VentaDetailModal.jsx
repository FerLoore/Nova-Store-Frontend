import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineBuildingLibrary,
} from "react-icons/hi2";

export function VentaDetailModal({ isOpen, onClose, venta }) {
  if (!venta) return null;

  const cliente = venta.cliente;
  const usuario = venta.usuario;
  const detalles = venta.detalles || [];
  const pagos = venta.pagos || [];
  const primerPago = pagos[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta #${venta.venta_id}`}
      description="Comprobante y desglose de productos y pago de la venta."
      size="xl"
    >
      <div className="space-y-6">
        {/* Cabecera de la Venta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 m-0">Fecha</p>
            <p className="text-sm font-bold text-gray-900 m-0">{formatDate(venta.venta_fecha)}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 m-0">Estado</p>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                background: "#dcfce7",
                color: "#15803d",
              }}
            >
              {venta.venta_estado}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 m-0">Cliente</p>
            <p className="text-sm font-bold text-gray-900 m-0">
              {cliente?.cliente_nombre || `Cliente #${venta.cliente_id}`}
            </p>
            {cliente?.cliente_dpi_nit && (
              <p className="text-xs text-gray-500 m-0">NIT/DPI: {cliente.cliente_dpi_nit}</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 m-0">Atendido por</p>
            <p className="text-sm font-bold text-gray-900 m-0">
              {usuario?.usuario_nombre || `Usuario #${venta.usuario_id}`}
            </p>
          </div>
        </div>

        {/* Información de Pago */}
        {primerPago && (
          <div
            style={{
              padding: "12px 18px",
              background: "#fafafa",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280" }}>
                Método de Pago Registrado:
              </span>
              <strong style={{ marginLeft: 8, fontSize: 13, color: "#111827", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {primerPago.pago_metodo === "TARJETA" ? (
                  <HiOutlineCreditCard style={{ fontSize: 16, color: "#2563eb" }} />
                ) : primerPago.pago_metodo === "TRANSFERENCIA" ? (
                  <HiOutlineBuildingLibrary style={{ fontSize: 16, color: "#9333ea" }} />
                ) : (
                  <HiOutlineBanknotes style={{ fontSize: 16, color: "#16a34a" }} />
                )}
                <span>{primerPago.pago_metodo}</span>
              </strong>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280" }}>
                Monto Pagado:
              </span>
              <strong style={{ marginLeft: 8, fontSize: 14, color: "#166534" }}>
                {formatCurrency(primerPago.pago_monto)}
              </strong>
            </div>
          </div>
        )}

        {/* Tabla de Productos / Items Vendidos */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Productos Vendidos ({detalles.length})
          </p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">Producto</th>
                  <th className="px-4 py-2.5 text-center">Talla / Color</th>
                  <th className="px-4 py-2.5 text-center">Cantidad</th>
                  <th className="px-4 py-2.5 text-right">P. Unitario</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detalles.map((det) => (
                  <tr key={det.detalle_id}>
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {det.variante?.variante_sku || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {det.variante?.producto?.producto_nombre || "Producto"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">
                      {det.variante?.variante_talla || "-"} / {det.variante?.variante_color || "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
                      {det.detalle_cantidad}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(det.detalle_precio_unitario)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatCurrency(det.detalle_subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total General */}
        <div className="flex justify-end pt-2">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-xl flex items-center gap-6">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Total Venta:</span>
            <span className="text-2xl font-black text-lime-400">
              {formatCurrency(venta.venta_total)}
            </span>
          </div>
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
