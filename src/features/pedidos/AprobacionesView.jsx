import { useState, useMemo } from "react";
import { usePermiso } from "../../hooks/usePermiso";
import { usePedidos } from "../../hooks/usePedidos";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PedidoDetalleModal } from "./PedidoDetalleModal";
import { FacturarModal } from "./FacturarModal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LuLock, LuCircleCheck, LuCheck, LuEye, LuRefreshCw, LuSearch, LuReceipt, LuFilter, LuCalendar, LuX } from "react-icons/lu";

export function AprobacionesView() {
  const { puedeVer, puedeEscribir } = usePermiso("APROBACIONES");

  // Filtros: fecha, cliente, estado
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { pedidos, isLoading, isError, refetch, aprobarPedido, isApproving, facturarPedido, isFacturando } = usePedidos({
    estado: filterEstado || undefined,
    cliente: filterCliente || undefined,
    fecha: filterFecha || undefined,
    enabled: puedeVer,
  });

  const [selectedPedidoDetalle, setSelectedPedidoDetalle] = useState(null);
  const [pedidoToApprove, setPedidoToApprove] = useState(null);
  const [pedidoToFacturar, setPedidoToFacturar] = useState(null);
  const [errorInventario, setErrorInventario] = useState(null);

  // Filtrado adicional local por texto (ID, cliente o vendedor)
  const filteredPedidos = useMemo(() => {
    const list = Array.isArray(pedidos) ? pedidos : [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter((p) => {
      const idStr = String(p.pedido_id);
      const clienteNom = (p.cliente?.cliente_nombre || "").toLowerCase();
      const usuarioNom = (p.usuario?.usuario_nombre || "").toLowerCase();
      return idStr.includes(term) || clienteNom.includes(term) || usuarioNom.includes(term);
    });
  }, [pedidos, searchTerm]);

  const handleConfirmApprove = async () => {
    if (!pedidoToApprove) return;
    try {
      await aprobarPedido(pedidoToApprove.pedido_id);
      setPedidoToApprove(null);
      refetch();
    } catch {
      // toast manejado por el hook
    }
  };

  const handleConfirmFacturar = async (arg1, arg2) => {
    const pagoMetodo = typeof arg1 === "string" ? arg1 : (typeof arg2 === "string" ? arg2 : "EFECTIVO");
    if (!pedidoToFacturar) return;
    try {
      await facturarPedido({
        idPedido: pedidoToFacturar.pedido_id,
        pagoMetodo,
      });
      setPedidoToFacturar(null);
      setErrorInventario(null);
      refetch();
    } catch (err) {
      if (err?.response?.status === 400) {
        const errorData = err.response.data;
        const msg = errorData?.message || errorData?.error || "Inventario insuficiente o no disponible para facturar este pedido.";
        setErrorInventario(msg);
      }
    }
  };

  const handleClearFilters = () => {
    setFilterEstado("");
    setFilterCliente("");
    setFilterFecha("");
    setSearchTerm("");
  };

  const hasActiveFilters = Boolean(filterEstado || filterCliente || filterFecha || searchTerm);

  // Sin acceso a APROBACIONES
  if (!puedeVer) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <LuLock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0c0a08]">Acceso Restringido</h2>
        <p className="text-sm text-[#5f5e5d]">
          No tienes permiso para ver las aprobaciones de pedidos.
        </p>
      </div>
    );
  }

  const columns = [
    {
      header: "Pedido",
      accessor: "pedido_id",
      render: (p) => (
        <span className="font-mono text-xs font-bold text-[#0c0a08]">
          #{p.pedido_id}
        </span>
      ),
    },
    {
      header: "Fecha",
      accessor: "pedido_fecha",
      render: (p) => (
        <span className="text-xs text-[#5f5e5d]">
          {formatDate(p.pedido_fecha)}
        </span>
      ),
    },
    {
      header: "Cliente",
      accessor: "cliente",
      render: (p) => (
        <div>
          <span className="font-medium text-xs text-[#0c0a08] block">
            {p.cliente?.cliente_nombre || "Cliente C/F"}
          </span>
          <span className="text-[10px] text-[#5f5e5d]">
            NIT/DPI: {p.cliente?.cliente_dpi_nit || "C/F"}
          </span>
        </div>
      ),
    },
    {
      header: "Vendedor",
      accessor: "usuario",
      render: (p) => (
        <span className="text-xs text-[#5f5e5d]">
          {p.usuario?.usuario_nombre || `Usuario #${p.usuario_id}`}
        </span>
      ),
    },
    {
      header: "Descuento",
      accessor: "pedido_descuento",
      render: (p) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300">
          -{formatCurrency(p.pedido_descuento)}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: "pedido_total",
      render: (p) => (
        <span className="font-bold text-xs text-[#0c0a08]">
          {formatCurrency(p.pedido_total)}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "pedido_estado",
      render: (p) => {
        if (p.pedido_estado === "ESPERANDO_APROBACION") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              ESPERANDO_APROBACION
            </span>
          );
        }
        if (p.pedido_estado === "APROBADO") {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <LuCircleCheck className="w-3 h-3 text-emerald-600" /> APROBADO
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <LuReceipt className="w-3 h-3 text-blue-600" /> FACTURADO
          </span>
        );
      },
    },
    {
      header: "Acciones",
      accessor: "acciones",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
            onClick={() => setSelectedPedidoDetalle(p)}
          ><LuEye className="w-3.5 h-3.5" /> Ver Detalle</Button>
          {puedeEscribir && p.pedido_estado === "ESPERANDO_APROBACION" && (
            <Button
              variant="primary"
              className="text-[11px] py-1 px-3 inline-flex items-center gap-1"
              disabled={isApproving}
              onClick={() => setPedidoToApprove(p)}
            ><LuCheck className="w-3.5 h-3.5" /> Aprobar</Button>
          )}
          {puedeEscribir && p.pedido_estado === "APROBADO" && (
            <Button
              variant="primary"
              className="text-[11px] py-1 px-3 inline-flex items-center gap-1"
              disabled={isFacturando}
              onClick={() => { setErrorInventario(null); setPedidoToFacturar(p); }}
            ><LuReceipt className="w-3.5 h-3.5" /> Facturar</Button>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = pedidos.filter((p) => p.pedido_estado === "ESPERANDO_APROBACION").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#0c0a08]">
              Aprobaciones de Pedidos
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-400">
                {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-[#5f5e5d] mt-1">
            Revisión y aprobación de pedidos con descuentos comerciales asignados por vendedores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} className="inline-flex items-center gap-1.5"><LuRefreshCw className="w-3.5 h-3.5" /> Actualizar</Button>
        </div>
      </div>

      {/* Inputs de Filtros: fecha, cliente, estado */}
      <div className="bg-paper border border-hairline rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Filtro Fecha */}
        <div className="w-full md:w-44">
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
          />
        </div>

        {/* Filtro Cliente */}
        <div className="w-full md:w-60 relative">
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
        <div className="w-full md:w-56">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink text-[#0c0a08]"
          >
            <option value="">Todos los Estados</option>
            <option value="ESPERANDO_APROBACION">Esperando Aprobación</option>
            <option value="APROBADO">Aprobado</option>
            <option value="FACTURADO">Facturado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {/* Búsqueda rápida general */}
        <div className="w-full md:w-56">
          <input
            type="text"
            placeholder="Buscar ID o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
          />
        </div>

        {/* Limpiar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            onClick={handleClearFilters}
            className="text-xs py-1.5 px-3 inline-flex items-center gap-1 shrink-0"
          >
            <LuX className="w-3.5 h-3.5" /> Limpiar
          </Button>
        )}
      </div>

      {/* Tabla de Aprobaciones */}
      <DataTable
        columns={columns}
        data={filteredPedidos}
        isLoading={isLoading}
        isError={isError}
        keyExtractor={(p) => p.pedido_id}
        emptyTitle="No hay pedidos con los filtros seleccionados"
        emptyDescription={
          hasActiveFilters
            ? "No se encontraron pedidos con los criterios especificados."
            : "No se encontraron registros de pedidos."
        }
      />

      {/* Modal de Detalle */}
      <PedidoDetalleModal
        isOpen={Boolean(selectedPedidoDetalle)}
        onClose={() => setSelectedPedidoDetalle(null)}
        pedido={selectedPedidoDetalle}
        canApprove={puedeEscribir}
        isApproving={isApproving}
        onAprobar={async (id) => {
          await aprobarPedido(id);
          refetch();
        }}
      />

      {/* Diálogo de Confirmación para Aprobar */}
      <ConfirmDialog
        isOpen={Boolean(pedidoToApprove)}
        onClose={() => setPedidoToApprove(null)}
        onConfirm={handleConfirmApprove}
        title={`¿Aprobar Pedido #${pedidoToApprove?.pedido_id}?`}
        description={`Estás a punto de autorizar un descuento de ${formatCurrency(pedidoToApprove?.pedido_descuento)} para el cliente "${pedidoToApprove?.cliente?.cliente_nombre || "Cliente"}". El pedido cambiará su estado a APROBADO.`}
        confirmText="Aprobar Pedido"
        cancelText="Cancelar"
        confirmVariant="primary"
        isLoading={isApproving}
      />

      {/* Modal de Facturación */}
      <FacturarModal
        isOpen={Boolean(pedidoToFacturar)}
        onClose={() => { setPedidoToFacturar(null); setErrorInventario(null); }}
        pedido={pedidoToFacturar}
        onConfirm={handleConfirmFacturar}
        isFacturando={isFacturando}
        errorInventario={errorInventario}
        onClearError={() => setErrorInventario(null)}
      />
    </div>
  );
}
