import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePedidos } from "../../hooks/usePedidos";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PedidoDetalleModal } from "./PedidoDetalleModal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LuLock, LuCircleCheck, LuCheck, LuEye, LuRefreshCw, LuSearch } from "react-icons/lu";

export function AprobacionesView() {
  const { usuario } = useAuth();

  // Verificar si el usuario es Gerente o Admin
  const userRole = (usuario?.rol_nombre || "").trim().toUpperCase();
  const isGerenteOrAdmin =
    userRole.includes("ADMIN") ||
    userRole.includes("GERENTE") ||
    usuario?.rol_id === 1 ||
    usuario?.rol_id === 5 ||
    usuario?.rol_id === 6;

  // Filtro de estado: por defecto solo los que esperan aprobación
  const [filterEstado, setFilterEstado] = useState("ESPERANDO_APROBACION");
  const [searchTerm, setSearchTerm] = useState("");

  const { pedidos, isLoading, isError, refetch, aprobarPedido, isApproving } = usePedidos({
    estado: filterEstado || undefined,
    enabled: isGerenteOrAdmin,
  });

  const [selectedPedidoDetalle, setSelectedPedidoDetalle] = useState(null);
  const [pedidoToApprove, setPedidoToApprove] = useState(null);

  // Filtrado por buscador en el cliente
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

  // Manejo de la aprobación directa
  const handleConfirmApprove = async () => {
    if (!pedidoToApprove) return;
    try {
      await aprobarPedido(pedidoToApprove.pedido_id);
      setPedidoToApprove(null);
      refetch();
    } catch (err) {
      console.error("Error al aprobar:", err);
    }
  };

  if (!isGerenteOrAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <LuLock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0c0a08]">
          Acceso Restringido a Aprobaciones
        </h2>
        <p className="text-sm text-[#5f5e5d] max-w-md mx-auto">
          Esta vista está reservada exclusivamente para usuarios con rol de <strong>Gerente</strong> o <strong>Administrador</strong>. Tu rol actual es: <span className="font-mono text-ink uppercase font-semibold">{usuario?.rol_nombre || "Sin rol"}</span>.
        </p>
      </div>
    );
  }

  const columns = [
    {
      header: "Pedido",
      accessor: "pedido_id",
      render: (p) => (
        <span className="font-mono font-bold text-xs text-ink bg-gray-100 px-2 py-1 rounded">
          #{p.pedido_id}
        </span>
      ),
    },
    {
      header: "Fecha",
      accessor: "pedido_fecha",
      render: (p) => (
        <span className="text-xs text-[#5f5e5d]">{formatDate(p.pedido_fecha)}</span>
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
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <LuCircleCheck className="w-3 h-3 text-emerald-600" /> APROBADO
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
            className="text-[11px] py-1 px-2.5"
            onClick={() => setSelectedPedidoDetalle(p)}
           className="text-[11px] py-1 px-2.5 inline-flex items-center gap-1"><LuEye className="w-3.5 h-3.5" /> Ver Detalle</Button>
          {p.pedido_estado === "ESPERANDO_APROBACION" && (
            <Button
              variant="primary"
              className="text-[11px] py-1 px-3"
              disabled={isApproving}
              onClick={() => setPedidoToApprove(p)}
             className="text-[11px] py-1 px-3 inline-flex items-center gap-1"><LuCheck className="w-3.5 h-3.5" /> Aprobar</Button>
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

      {/* Filtros de la tabla */}
      <div className="bg-paper border border-hairline rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Estado */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterEstado("ESPERANDO_APROBACION")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterEstado === "ESPERANDO_APROBACION"
                ? "bg-ink text-white"
                : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
            }`}
          >
            Esperando Aprobación
          </button>
          <button
            type="button"
            onClick={() => setFilterEstado("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterEstado === ""
                ? "bg-ink text-white"
                : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
            }`}
          >
            Todos los Pedidos
          </button>
        </div>

        {/* Buscador de pedidos */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por ID, cliente o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
          />
        </div>
      </div>

      {/* Tabla de Aprobaciones */}
      <DataTable
        columns={columns}
        data={filteredPedidos}
        isLoading={isLoading}
        isError={isError}
        keyExtractor={(p) => p.pedido_id}
        emptyTitle="No hay pedidos pendientes de aprobación"
        emptyDescription={
          filterEstado === "ESPERANDO_APROBACION"
            ? "Todos los pedidos con descuento han sido procesados o aprobados."
            : "No se encontraron registros de pedidos."
        }
      />

      {/* Modal de Detalle */}
      <PedidoDetalleModal
        isOpen={Boolean(selectedPedidoDetalle)}
        onClose={() => setSelectedPedidoDetalle(null)}
        pedido={selectedPedidoDetalle}
        canApprove={isGerenteOrAdmin}
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
    </div>
  );
}
