import { useState, useMemo } from "react";
import { useAuditoria } from "../../hooks/useAuditoria";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatters";
import { LuRefreshCw, LuShieldCheck, LuSearch, LuFilter } from "react-icons/lu";

export function AuditoriaList() {
  const { auditorias, isLoading, isError, refetch } = useAuditoria();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAccion, setFilterAccion] = useState("");

  const filteredData = useMemo(() => {
    return auditorias.filter((item) => {
      const matchSearch =
        !searchTerm ||
        String(item.auditoria_id).includes(searchTerm) ||
        (item.auditoria_tabla || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.auditoria_campo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.usuario?.usuario_nombre || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchAccion = !filterAccion || item.auditoria_accion === filterAccion;

      return matchSearch && matchAccion;
    });
  }, [auditorias, searchTerm, filterAccion]);

  const columns = [
    {
      header: "ID",
      accessor: "auditoria_id",
      render: (a) => (
        <span className="font-mono text-xs font-semibold text-[#0c0a08]">
          #{a.auditoria_id}
        </span>
      ),
    },
    {
      header: "Fecha y Hora",
      accessor: "auditoria_fecha",
      render: (a) => (
        <div>
          <span className="text-xs font-medium text-[#0c0a08] block">
            {formatDate(a.auditoria_fecha)}
          </span>
          <span className="text-[10px] text-[#5f5e5d]">
            {a.auditoria_fecha ? new Date(a.auditoria_fecha).toLocaleTimeString("es-GT") : "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Tabla / Módulo",
      accessor: "auditoria_tabla",
      render: (a) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-gray-100 text-[#0c0a08] border border-gray-300">
          {a.auditoria_tabla}
        </span>
      ),
    },
    {
      header: "Acción",
      accessor: "auditoria_accion",
      render: (a) => {
        let badgeColor = "bg-gray-100 text-gray-800 border-gray-300";
        if (a.auditoria_accion === "APROBAR") {
          badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
        } else if (a.auditoria_accion === "DESCUENTO") {
          badgeColor = "bg-amber-100 text-amber-900 border-amber-300 font-bold";
        }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase border ${badgeColor}`}>
            {a.auditoria_accion}
          </span>
        );
      },
    },
    {
      header: "Campo",
      accessor: "auditoria_campo",
      render: (a) => (
        <span className="text-xs font-mono text-[#5f5e5d]">
          {a.auditoria_campo || "-"}
        </span>
      ),
    },
    {
      header: "Valor Antes",
      accessor: "auditoria_valor_antes",
      render: (a) => (
        <span className="text-xs font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
          {a.auditoria_valor_antes ?? "NULL"}
        </span>
      ),
    },
    {
      header: "Valor Después",
      accessor: "auditoria_valor_despues",
      render: (a) => (
        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          {a.auditoria_valor_despues ?? "NULL"}
        </span>
      ),
    },
    {
      header: "Usuario Responsable",
      accessor: "usuario",
      render: (a) => (
        <div>
          <span className="text-xs font-medium text-[#0c0a08] block">
            {a.usuario?.usuario_nombre || `Usuario #${a.usuario_id || "Sistema"}`}
          </span>
          <span className="text-[10px] text-[#5f5e5d]">
            {a.usuario?.usuario_email || ""}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#0c0a08] flex items-center gap-2">
              <LuShieldCheck className="w-6 h-6 text-emerald-600" />
              Auditoría del Sistema
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-ink text-white">
              Solo Administrador
            </span>
          </div>
          <p className="text-sm text-[#5f5e5d] mt-1">
            Registro inmutable de trazabilidad de acciones críticas (aprobaciones, descuentos y cambios).
          </p>
        </div>
        <div>
          <Button variant="secondary" onClick={() => refetch()} className="inline-flex items-center gap-1.5">
            <LuRefreshCw className="w-3.5 h-3.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-paper border border-hairline rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LuFilter className="w-4 h-4 text-[#5f5e5d]" />
          <button
            type="button"
            onClick={() => setFilterAccion("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterAccion === "" ? "bg-ink text-white" : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
            }`}
          >
            Todas ({auditorias.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAccion("APROBAR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterAccion === "APROBAR" ? "bg-ink text-white" : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
            }`}
          >
            Aprobaciones
          </button>
          <button
            type="button"
            onClick={() => setFilterAccion("DESCUENTO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterAccion === "DESCUENTO" ? "bg-ink text-white" : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
            }`}
          >
            Descuentos
          </button>
        </div>

        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por tabla, campo o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-hairline rounded-lg focus:outline-ink"
          />
          <LuSearch className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        isError={isError}
        keyExtractor={(a) => a.auditoria_id}
        emptyTitle="Sin registros de auditoría"
        emptyDescription="Aún no se han ejecutado acciones registradas en NOVA_AUDITORIA."
      />
    </div>
  );
}
