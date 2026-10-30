import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { formatCurrency } from "../../utils/formatters";
import { LuReceiptText, LuTriangleAlert, LuBanknote, LuCreditCard, LuArrowLeftRight } from "react-icons/lu";

const METODOS_PAGO = [
  {
    value: "EFECTIVO",
    label: "Efectivo",
    description: "Pago en efectivo directo",
    icon: LuBanknote,
  },
  {
    value: "TARJETA",
    label: "Tarjeta",
    description: "Débito o crédito",
    icon: LuCreditCard,
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
    description: "Depósito o transferencia bancaria",
    icon: LuArrowLeftRight,
  },
];

/**
 * FacturarModal — Confirmar la facturación de un pedido APROBADO.
 * @param {{ isOpen, onClose, pedido, onConfirm, isFacturando, errorInventario, onClearError }} props
 */
export function FacturarModal({
  isOpen,
  onClose,
  pedido,
  onConfirm,
  isFacturando = false,
  errorInventario = null,
  onClearError,
}) {
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  if (!pedido) return null;

  const handleClose = () => {
    if (isFacturando) return;
    if (onClearError) onClearError();
    onClose();
  };

  const handleConfirm = () => {
    if (onClearError) onClearError();
    onConfirm(metodoPago, pedido.pedido_id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Facturar Pedido #${pedido.pedido_id}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">

        {/* Alerta de Error de Inventario — visible y prominente */}
        {errorInventario && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl border animate-fadeIn"
            style={{
              background: "#fef2f2",
              borderColor: "#fca5a5",
            }}
          >
            <LuTriangleAlert
              className="shrink-0 mt-0.5"
              style={{ width: 20, height: 20, color: "#dc2626" }}
            />
            <div>
              <p
                className="font-bold text-sm"
                style={{ color: "#991b1b", marginBottom: 4 }}
              >
                Intento de venta sin inventario disponible
              </p>
              <p className="text-xs" style={{ color: "#b91c1c", lineHeight: 1.5 }}>
                {errorInventario}
              </p>
            </div>
          </div>
        )}

        {/* Resumen del pedido */}
        <div
          className="rounded-xl p-4 space-y-2 text-xs"
          style={{ background: "#f9f8f6", border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <LuReceiptText style={{ width: 14, height: 14, color: "#5f5e5d" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#5f5e5d",
              }}
            >
              Resumen del Pedido
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#5f5e5d" }}>Cliente:</span>
            <span className="font-medium" style={{ color: "#0c0a08" }}>
              {pedido.cliente?.cliente_nombre || "Cliente C/F"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#5f5e5d" }}>Artículos:</span>
            <span className="font-medium" style={{ color: "#0c0a08" }}>
              {pedido.detalles?.length ?? 0} líneas
            </span>
          </div>
          {Number(pedido.pedido_descuento) > 0 && (
            <div className="flex justify-between" style={{ color: "#92400e" }}>
              <span>Descuento:</span>
              <span className="font-semibold">
                -{formatCurrency(pedido.pedido_descuento)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: "1px solid #e5e7eb" }}
          >
            <span className="font-bold text-sm" style={{ color: "#0c0a08" }}>
              Total a cobrar:
            </span>
            <span
              className="font-extrabold text-base"
              style={{ color: "#0c0a08" }}
            >
              {formatCurrency(pedido.pedido_total)}
            </span>
          </div>
        </div>

        {/* Selector de método de pago */}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#5f5e5d",
              marginBottom: 10,
            }}
          >
            Método de Pago
          </p>
          <div className="grid grid-cols-3 gap-2">
            {METODOS_PAGO.map(({ value, label, description, icon: Icon }) => {
              const selected = metodoPago === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMetodoPago(value)}
                  disabled={isFacturando}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 10,
                    border: selected ? "2px solid #0c0a08" : "1px solid #e5e7eb",
                    background: selected ? "#0c0a08" : "#ffffff",
                    cursor: isFacturando ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    opacity: isFacturando ? 0.6 : 1,
                  }}
                >
                  <Icon
                    style={{
                      width: 20,
                      height: 20,
                      color: selected ? "#e4f222" : "#5f5e5d",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: selected ? "#ffffff" : "#0c0a08",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: selected ? "#d3d3d3" : "#8b8d98",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isFacturando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isFacturando}
            className="inline-flex items-center gap-2"
          >
            {isFacturando ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Facturando...
              </>
            ) : (
              <>
                <LuReceiptText style={{ width: 15, height: 15 }} />
                Confirmar Facturación
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
