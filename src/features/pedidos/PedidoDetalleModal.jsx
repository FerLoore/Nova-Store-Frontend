import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { LuCircleCheck, LuCheck } from "react-icons/lu";
import { formatCurrency, formatDate } from "../../utils/formatters";

export function PedidoDetalleModal({ isOpen, onClose, pedido, onAprobar, isApproving, canApprove }) {
  if (!pedido) return null;

  const isEsperando = pedido.pedido_estado === "ESPERANDO_APROBACION";
  const subtotalBruto = (pedido.detalles || []).reduce(
    (acc, d) => acc + Number(d.detalle_subtotal || 0),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Pedido #${pedido.pedido_id}`}
      description={`Registrado el ${formatDate(pedido.pedido_fecha)} por ${pedido.usuario?.usuario_nombre || "Usuario"}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isEsperando && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Esperando Aprobación
              </span>
            )}
            {!isEsperando && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                <LuCircleCheck className="w-3.5 h-3.5 text-emerald-600" /> Aprobado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            {isEsperando && canApprove && (
              <Button
                variant="primary"
                disabled={isApproving}
                onClick={async () => {
                  if (onAprobar) {
                    await onAprobar(pedido.pedido_id);
                    onClose();
                  }
                }}
              >
                {isApproving ? "Aprobando..." : (<span className="inline-flex items-center gap-1.5"><LuCheck className="w-4 h-4" /> Aprobar Pedido</span>)}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info del Cliente */}
        <div className="bg-[#f9f8f6] p-4 rounded-xl border border-hairline">
          <span className="text-[10px] font-semibold tracking-wider text-[#5f5e5d] uppercase block mb-2">
            Información del Cliente
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-[#8b8d98] block">Nombre completo:</span>
              <span className="font-medium text-[#0c0a08]">{pedido.cliente?.cliente_nombre || "Consumidor Final"}</span>
            </div>
            <div>
              <span className="text-xs text-[#8b8d98] block">DPI / NIT:</span>
              <span className="font-medium text-[#0c0a08]">{pedido.cliente?.cliente_dpi_nit || "C/F"}</span>
            </div>
            <div>
              <span className="text-xs text-[#8b8d98] block">Teléfono:</span>
              <span className="text-[#0c0a08]">{pedido.cliente?.cliente_telefono || "No registrado"}</span>
            </div>
            <div>
              <span className="text-xs text-[#8b8d98] block">Correo:</span>
              <span className="text-[#0c0a08]">{pedido.cliente?.cliente_correo || "No registrado"}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#5f5e5d] uppercase block mb-2">
            Artículos del Pedido ({pedido.detalles?.length || 0})
          </span>
          <div className="border border-hairline rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4f2f0] border-b border-hairline text-[#5f5e5d] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Producto / SKU</th>
                  <th className="py-2.5 px-3">Talla / Color</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {(pedido.detalles || []).map((det, idx) => (
                  <tr key={det.detalle_id || idx} className="hover:bg-[#faf9f8]">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#0c0a08]">
                        {det.variante?.producto?.producto_nombre || "Producto"}
                      </div>
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#5f5e5d] font-mono">
                        {det.variante?.variante_sku || "SKU"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#5f5e5d]">
                      {det.variante?.variante_talla || "-"} / {det.variante?.variante_color || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-[#0c0a08]">
                      {det.detalle_cantidad}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#5f5e5d]">
                      {formatCurrency(det.detalle_precio_unitario)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-[#0c0a08]">
                      {formatCurrency(det.detalle_subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-[#fcfbf9] border border-hairline rounded-xl p-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#5f5e5d]">
              <span>Subtotal Productos:</span>
              <span className="font-medium text-[#0c0a08]">{formatCurrency(subtotalBruto)}</span>
            </div>
            {Number(pedido.pedido_descuento) > 0 && (
              <div className="flex justify-between text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded">
                <span>Descuento aplicado:</span>
                <span>-{formatCurrency(pedido.pedido_descuento)}</span>
              </div>
            )}
            <div className="border-t border-hairline pt-2 mt-2 flex justify-between text-sm font-semibold text-[#0c0a08]">
              <span>Total del Pedido:</span>
              <span className="text-base text-ink">{formatCurrency(pedido.pedido_total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
