import { useState } from "react";
import { useVentas } from "../../hooks/useVentas";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LuRefreshCw, LuReceipt, LuSearch, LuCalendar, LuFilter, LuX } from "react-icons/lu";

export function VentasList() {
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [filterFecha, setFilterFecha] = useState("");

  const { ventas, isLoading, isError, refetch } = useVentas({
    estado: filterEstado || undefined,
    cliente: filterCliente || undefined,
    fecha: filterFecha || undefined,
  });

  const handleResetFilters = () => {
    setFilterEstado("");
    setFilterCliente("");
    setFilterFecha("");
  };

  const hasActiveFilters = Boolean(filterEstado || filterCliente || filterFecha);

  const columns = [
    {
      header: "Venta #",
      accessor: "venta_id",
      render: (v) => (
        <span className="font-mono text-xs font-bold text-[#0c0a08]">
          #{v.venta_id}
        </span>
      ),
    },
    {
      header: "Pedido",
      accessor: "pedido_id",
      render: (v) =>
        v.pedido_id ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Pedido #{v.pedido_id}
          </span>
        ) : (
          <span className="text-[11px] text-[#5f5e5d] italic">Venta directa</span>
        ),
    },
    {
      header: "Cliente",
      accessor: "cliente",
      render: (v) => (
        <div>
          <span className="font-medium text-xs text-[#0c0a08] block">
            {v.cliente?.cliente_nombre || "Cliente C/F"}
          </span>
          <span className="text-[10px] text-[#5f5e5d]">
            NIT/DPI: {v.cliente?.cliente_dpi_nit || "C/F"}
          </span>
        </div>
      ),
    },
    {
      header: "Fecha",
      accessor: "venta_fecha",
      render: (v) => (
        <span className="text-xs text-[#5f5e5d]">
          {formatDate(v.venta_fecha)}
        </span>
      ),
    },
    {
      header: "Método de Pago",
      key: "metodo",
      render: (v) => {
        const metodo = v.pagos?.[0]?.pago_metodo || "EFECTIVO";
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-gray-100 text-[#0c0a08]">
            {metodo}
          </span>
        );
      },
    },
    {
      header: "Vendedor",
      accessor: "usuario",
      render: (v) => (
        <span className="text-xs text-[#5f5e5d]">
          {v.usuario?.usuario_nombre || `Usuario #${v.usuario_id}`}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: "venta_total",
      align: "right",
      render: (v) => (
        <span className="font-bold text-xs text-[#0c0a08]">
          {formatCurrency(v.venta_total)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "venta_estado",
      render: (v) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <LuReceipt className="w-3 h-3 text-emerald-600" />
          {v.venta_estado}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0c0a08] flex items-center gap-2">
            <LuReceipt className="w-6 h-6 text-ink" />
            Historial de Ventas Facturadas
          </h1>
          <p className="text-sm text-[#5f5e5d] mt-1">
            Consulta y filtra todas las ventas y comprobantes emitidos en el sistema.
          </p>
        </div>
        <div>
          <Button variant="secondary" onClick={() => refetch()} className="inline-flex items-center gap-1.5">
            <LuRefreshCw className="w-3.5 h-3.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Inputs de Filtros: fecha, cliente, estado */}
      <div className="bg-paper border border-hairline rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Filtro Fecha */}
        <div className="w-full md:w-48 flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
            />
          </div>
        </div>

        {/* Filtro Cliente */}
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Filtrar por cliente..."
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
          />
          <LuSearch className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Filtro Estado */}
        <div className="w-full md:w-48">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink text-[#0c0a08]"
          >
            <option value="">Todos los Estados</option>
            <option value="COMPLETADA">COMPLETADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            className="text-xs py-1.5 px-3 inline-flex items-center gap-1 shrink-0"
          >
            <LuX className="w-3.5 h-3.5" /> Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Tabla de Ventas */}
      <DataTable
        columns={columns}
        data={ventas}
        isLoading={isLoading}
        isError={isError}
        keyExtractor={(v) => v.venta_id}
        emptyTitle="No se encontraron ventas"
        emptyDescription={
          hasActiveFilters
            ? "Ninguna venta coincide con los filtros aplicados."
            : "Aún no se han registrado ventas en el sistema."
        }
      />
    </div>
  );
}
