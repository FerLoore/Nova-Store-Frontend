import { useState } from "react";
import { useCompras } from "../../hooks/useCompras";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { CompraCreateModal } from "./CompraCreateModal";
import { CompraDetailModal } from "./CompraDetailModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatters";

export function ComprasList() {
  const { can } = useAuth();
  const canManage = can("PRODUCTOS_GESTIONAR");

  const {
    compras,
    isLoading,
    isError,
    createCompra,
    recibirCompra,
    isRecibiendo,
  } = useCompras();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCompraDetail, setSelectedCompraDetail] = useState(null);
  const [recibiendoCompraId, setRecibiendoCompraId] = useState(null);

  const handleOpenCreate = () => {
    setCreateModalOpen(true);
  };

  const handleOpenDetail = (compra) => {
    setSelectedCompraDetail(compra);
  };

  const handleConfirmRecibir = async () => {
    if (!recibiendoCompraId) return;
    try {
      await recibirCompra({ id: recibiendoCompraId });
      setRecibiendoCompraId(null);
      if (selectedCompraDetail?.compra_id === recibiendoCompraId) {
        setSelectedCompraDetail(null);
      }
    } catch {
      // Error manejado en el hook por toast
    }
  };

  const columns = [
    {
      header: "Orden #",
      accessor: "compra_id",
      render: (c) => (
        <span style={{ fontWeight: 600, color: "#111827", fontFamily: "monospace" }}>
          #{c.compra_id}
        </span>
      ),
    },
    {
      header: "Proveedor",
      render: (c) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0c0a08", display: "block" }}>
            {c.proveedor?.proveedor_nombre || "—"}
          </span>
          {c.proveedor?.proveedor_ruc_nit && (
            <span style={{ fontSize: 11, color: "#5f5e5d", display: "block" }}>
              NIT: {c.proveedor.proveedor_ruc_nit}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Fecha",
      render: (c) => (
        <span style={{ fontSize: 13, color: "#4b5563" }}>
          {c.compra_fecha ? new Date(c.compra_fecha).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Registrado por",
      render: (c) => (
        <span style={{ fontSize: 13, color: "#4b5563" }}>
          {c.usuario?.usuario_nombre || "Usuario"}
        </span>
      ),
    },
    {
      header: "Total",
      render: (c) => (
        <span style={{ fontWeight: 600, color: "#0c0a08" }}>
          {formatCurrency(c.compra_total)}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (c) => {
        const bg =
          c.compra_estado === "RECIBIDA"
            ? "#dcfce7"
            : c.compra_estado === "CANCELADA"
            ? "#fee2e2"
            : "#fef3c7";
        const fg =
          c.compra_estado === "RECIBIDA"
            ? "#15803d"
            : c.compra_estado === "CANCELADA"
            ? "#b91c1c"
            : "#b45309";
        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              background: bg,
              color: fg,
            }}
          >
            {c.compra_estado}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      align: "right",
      render: (c) => {
        const isPendiente = c.compra_estado === "PENDIENTE";
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="compact" onClick={() => handleOpenDetail(c)}>
              Ver Detalle
            </Button>
            {canManage && isPendiente && (
              <Button
                variant="compact"
                onClick={() => setRecibiendoCompraId(c.compra_id)}
                style={{ background: "#15803d", color: "#ffffff", borderColor: "#15803d" }}
              >
                Recibir
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: "0 0 6px" }}>
            Abastecimiento y Entradas
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Órdenes de Compra
          </h1>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenCreate}>
            Nueva Orden de Compra
          </Button>
        )}
      </div>

      {/* Tabla de Compras */}
      <DataTable
        columns={columns}
        data={compras}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin órdenes de compra"
        emptyDescription="No se encontraron órdenes de compra registradas."
        emptyActionLabel={canManage ? "CREAR PRIMERA ORDEN" : undefined}
        onEmptyAction={canManage ? handleOpenCreate : undefined}
        keyExtractor={(c) => c.compra_id}
      />

      {/* Modal Crear Orden */}
      <CompraCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={createCompra}
      />

      {/* Modal Ver Detalle */}
      <CompraDetailModal
        isOpen={Boolean(selectedCompraDetail)}
        onClose={() => setSelectedCompraDetail(null)}
        compra={selectedCompraDetail}
        onRecibir={(id) => setRecibiendoCompraId(id)}
        isRecibiendo={isRecibiendo}
      />

      {/* ConfirmDialog para Recibir Compra */}
      <ConfirmDialog
        isOpen={Boolean(recibiendoCompraId)}
        onClose={() => setRecibiendoCompraId(null)}
        onConfirm={handleConfirmRecibir}
        title="Recibir Orden de Compra"
        message={`¿Confirmas que deseas recibir la orden de compra #${recibiendoCompraId}? Esto cambiará su estado a RECIBIDA y registrará los movimientos de ENTRADA en el inventario para todas las variantes del detalle.`}
        confirmLabel="Recibir y Actualizar Stock"
        cancelLabel="Cancelar"
        isLoading={isRecibiendo}
      />
    </div>
  );
}
