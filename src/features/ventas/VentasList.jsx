import { useState, useMemo } from "react";
import { useVentas } from "../../hooks/useVentas";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { DataTable } from "../../components/ui/DataTable";
import { NuevaVentaModal } from "./NuevaVentaModal";
import { VentaDetailModal } from "./VentaDetailModal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineBuildingLibrary,
  HiOutlinePlus,
} from "react-icons/hi2";

export function VentasList() {
  const { ventas, isLoading, isError, createVenta } = useVentas();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);

  // Filtrado de ventas por cliente, ID o método de pago
  const filteredVentas = useMemo(() => {
    if (!searchTerm.trim()) return ventas;
    const term = searchTerm.trim().toLowerCase();
    return (ventas || []).filter((v) => {
      const idMatch = String(v.venta_id).includes(term);
      const clienteMatch = (v.cliente?.cliente_nombre || "").toLowerCase().includes(term);
      const userMatch = (v.usuario?.usuario_nombre || "").toLowerCase().includes(term);
      const pagoMatch = (v.pagos || []).some((p) => (p.pago_metodo || "").toLowerCase().includes(term));
      return idMatch || clienteMatch || userMatch || pagoMatch;
    });
  }, [ventas, searchTerm]);

  // Métricas
  const totalRecaudado = useMemo(() => {
    return (ventas || []).reduce((sum, v) => sum + Number(v.venta_total || 0), 0);
  }, [ventas]);

  const totalProductosVendidos = useMemo(() => {
    return (ventas || []).reduce((sum, v) => {
      const itemsCount = (v.detalles || []).reduce((s, d) => s + Number(d.detalle_cantidad || 0), 0);
      return sum + itemsCount;
    }, 0);
  }, [ventas]);

  const columns = useMemo(
    () => [
      {
        header: "# Venta",
        render: (row) => (
          <span style={{ fontWeight: 700, fontFamily: "monospace", color: "#111827" }}>
            #{row.venta_id}
          </span>
        ),
      },
      {
        header: "Fecha",
        render: (row) => <span style={{ color: "#4b5563" }}>{formatDate(row.venta_fecha)}</span>,
      },
      {
        header: "Cliente",
        render: (row) => (
          <div>
            <div style={{ fontWeight: 600, color: "#111827" }}>
              {row.cliente?.cliente_nombre || `Cliente #${row.cliente_id}`}
            </div>
            {row.cliente?.cliente_dpi_nit && (
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                NIT/DPI: {row.cliente.cliente_dpi_nit}
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Atendido por",
        render: (row) => (
          <span style={{ color: "#4b5563" }}>
            {row.usuario?.usuario_nombre || `Usuario #${row.usuario_id}`}
          </span>
        ),
      },
      {
        header: "Método Pago",
        render: (row) => {
          const pago = (row.pagos || [])[0];
          const metodo = pago?.pago_metodo || "EFECTIVO";
          const Icon =
            metodo === "TARJETA"
              ? HiOutlineCreditCard
              : metodo === "TRANSFERENCIA"
              ? HiOutlineBuildingLibrary
              : HiOutlineBanknotes;
          const iconColor =
            metodo === "TARJETA"
              ? "#2563eb"
              : metodo === "TRANSFERENCIA"
              ? "#9333ea"
              : "#16a34a";
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: "#f4f4f5",
                color: "#27272a",
              }}
            >
              <Icon style={{ fontSize: 15, color: iconColor }} />
              <span>{metodo}</span>
            </span>
          );
        },
      },
      {
        header: "Items",
        render: (row) => {
          const count = (row.detalles || []).reduce((s, d) => s + Number(d.detalle_cantidad || 0), 0);
          return (
            <span style={{ color: "#4b5563", fontWeight: 500 }}>
              {count} {count === 1 ? "ud." : "uds."}
            </span>
          );
        },
      },
      {
        header: "Total",
        render: (row) => (
          <span style={{ fontWeight: 800, color: "#111827" }}>
            {formatCurrency(row.venta_total)}
          </span>
        ),
      },
      {
        header: "Acciones",
        render: (row) => (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSelectedVenta(row)}
            style={{ fontSize: 12, padding: "5px 10px" }}
          >
            Ver Comprobante
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>
            Ventas y Salida de Mercancía
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>
            Registro de transacciones, validación de inventario y emisión de comprobantes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          style={{
            background: "#0c0a08",
            borderColor: "#0c0a08",
            color: "#ffffff",
            padding: "10px 20px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <HiOutlinePlus style={{ fontSize: 16 }} />
          <span>Nueva Venta</span>
        </Button>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.04em" }}>
            Total Ventas Realizadas
          </p>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>
            {(ventas || []).length}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>órdenes</span>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.04em" }}>
            Total Ingresos por Ventas
          </p>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#15803d" }}>
            {formatCurrency(totalRecaudado)}
          </span>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.04em" }}>
            Unidades Totales Vendidas
          </p>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>
            {totalProductosVendidos}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>unidades</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar venta por #ID, cliente, cajero o método de pago..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Ventas */}
      <DataTable
        columns={columns}
        data={filteredVentas}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin ventas registradas"
        emptyDescription="Haz clic en '+ Nueva Venta' para registrar la primera venta con salida de inventario."
        keyExtractor={(item) => item.venta_id}
      />

      {/* Modal de Nueva Venta */}
      <NuevaVentaModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={createVenta}
      />

      {/* Modal de Detalle de Venta */}
      <VentaDetailModal
        isOpen={Boolean(selectedVenta)}
        onClose={() => setSelectedVenta(null)}
        venta={selectedVenta}
      />
    </div>
  );
}
