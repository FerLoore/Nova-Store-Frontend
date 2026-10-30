import { useReportes } from "../../hooks/useReportes";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LuRefreshCw, LuTrendingUp, LuAward, LuCalendar, LuDollarSign, LuPackage, LuDownload, LuPrinter } from "react-icons/lu";

export function ReportesView() {
  const {
    ventasPorDia,
    loadingVentas,
    errorVentas,
    topProductos,
    loadingTop,
    errorTop,
    refetchAll,
  } = useReportes();

  // Exportar Ventas a CSV
  const handleExportCSV = () => {
    if (!ventasPorDia || ventasPorDia.length === 0) return;
    const headers = ["Fecha", "Transacciones", "Total_Facturado_GTQ"];
    const rows = ventasPorDia.map((v) => [
      `"${v.fecha || ""}"`,
      v.cantidad_ventas || 0,
      v.total_ventas || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calcular métricas resumen
  const granTotalVentas = ventasPorDia.reduce((acc, v) => acc + (v.total_ventas || 0), 0);
  const totalTransacciones = ventasPorDia.reduce((acc, v) => acc + (v.cantidad_ventas || 0), 0);
  const maxVentaDia = Math.max(...ventasPorDia.map((v) => v.total_ventas || 0), 1);

  // Columnas para tabla de Ventas por Día
  const columnsVentas = [
    {
      header: "Fecha",
      accessor: "fecha",
      render: (v) => (
        <span className="font-medium text-xs text-[#0c0a08] flex items-center gap-1.5">
          <LuCalendar className="w-3.5 h-3.5 text-gray-400" />
          {formatDate(v.fecha)}
        </span>
      ),
    },
    {
      header: "Transacciones",
      accessor: "cantidad_ventas",
      render: (v) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-[#0c0a08]">
          {v.cantidad_ventas} venta{v.cantidad_ventas !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      header: "Total Facturado",
      accessor: "total_ventas",
      align: "right",
      render: (v) => (
        <span className="font-bold text-xs text-emerald-800">
          {formatCurrency(v.total_ventas)}
        </span>
      ),
    },
  ];

  // Columnas para tabla de Top 10 Productos
  const columnsTop = [
    {
      header: "#",
      key: "rank",
      align: "center",
      render: (_, idx) => {
        let badge = "bg-gray-100 text-gray-700";
        if (idx === 0) badge = "bg-amber-100 text-amber-900 border border-amber-400 font-extrabold";
        else if (idx === 1) badge = "bg-slate-200 text-slate-800 border border-slate-400 font-bold";
        else if (idx === 2) badge = "bg-orange-100 text-orange-900 border border-orange-400 font-bold";

        return (
          <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${badge}`}>
            {idx + 1}
          </span>
        );
      },
    },
    {
      header: "Producto",
      accessor: "producto_nombre",
      render: (p) => (
        <div>
          <span className="font-bold text-xs text-[#0c0a08] block">
            {p.producto_nombre}
          </span>
          <span className="text-[10px] text-[#5f5e5d]">
            ID Producto #{p.producto_id}
          </span>
        </div>
      ),
    },
    {
      header: "Unidades Vendidas",
      accessor: "total_cantidad",
      render: (p) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
          <LuPackage className="w-3 h-3 text-blue-700" />
          {p.total_cantidad} uds.
        </span>
      ),
    },
    {
      header: "Ingresos Generados",
      accessor: "total_recaudado",
      align: "right",
      render: (p) => (
        <span className="font-bold text-xs text-emerald-700">
          {formatCurrency(p.total_recaudado)}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0c0a08] flex items-center gap-2">
            <LuTrendingUp className="w-6 h-6 text-ink" />
            Reportes Financieros y de Ventas
          </h1>
          <p className="text-sm text-[#5f5e5d] mt-1">
            Métricas consolidadas de facturación diaria y ranking de productos con mayor rotación.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={!ventasPorDia || ventasPorDia.length === 0}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <LuDownload className="w-3.5 h-3.5" /> Exportar CSV
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <LuPrinter className="w-3.5 h-3.5" /> Imprimir / PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => refetchAll()}
            className="inline-flex items-center gap-1.5 text-xs"
          >
            <LuRefreshCw className="w-3.5 h-3.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-paper border border-hairline rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <LuDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5d]">
              Facturación Total Acumulada
            </span>
            <div className="text-2xl font-extrabold text-[#0c0a08] mt-0.5">
              {formatCurrency(granTotalVentas)}
            </div>
          </div>
        </div>

        <div className="bg-paper border border-hairline rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <LuPackage className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5d]">
              Total Ventas Completadas
            </span>
            <div className="text-2xl font-extrabold text-[#0c0a08] mt-0.5">
              {totalTransacciones} órdenes
            </div>
          </div>
        </div>
      </div>

      {/* Sección 1: Gráfico y Tabla de Ventas por Día */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0c0a08] flex items-center gap-2">
            <LuCalendar className="w-5 h-5 text-[#5f5e5d]" />
            Ventas Facturadas por Día
          </h2>
          <span className="text-xs text-[#5f5e5d]">
            {ventasPorDia.length} días registrados
          </span>
        </div>

        {/* Gráfico de barras visual */}
        {ventasPorDia.length > 0 && (
          <div className="bg-paper border border-hairline rounded-2xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f5e5d] mb-4">
              Gráfico de Tendencia Diaria
            </h3>
            <div className="flex items-end gap-3 h-48 pt-4 pb-2 px-2 overflow-x-auto border-b border-hairline">
              {ventasPorDia.map((item) => {
                const heightPercent = Math.max(8, Math.round(((item.total_ventas || 0) / maxVentaDia) * 100));
                return (
                  <div key={item.fecha} className="flex flex-col items-center flex-1 min-w-[48px] h-full justify-end group">
                    <div className="text-[10px] font-bold text-[#0c0a08] mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(item.total_ventas)}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#1a1919] group-hover:bg-[#e4f222] transition-colors rounded-t-md relative cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-[#5f5e5d] mt-2 whitespace-nowrap">
                      {item.fecha.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabla de Ventas por Día */}
        <DataTable
          columns={columnsVentas}
          data={ventasPorDia}
          isLoading={loadingVentas}
          isError={errorVentas}
          keyExtractor={(v) => v.fecha}
          emptyTitle="Sin ventas registradas"
          emptyDescription="Aún no hay ventas facturadas en el sistema para agrupar."
        />
      </div>

      {/* Sección 2: Top 10 Productos Más Vendidos */}
      <div className="space-y-4 pt-4 border-t border-hairline">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0c0a08] flex items-center gap-2">
            <LuAward className="w-5 h-5 text-amber-500" />
            Top 10 Productos Más Vendidos
          </h2>
          <span className="text-xs text-[#5f5e5d]">
            Ordenado por cantidad de unidades vendidas
          </span>
        </div>

        <DataTable
          columns={columnsTop}
          data={topProductos}
          isLoading={loadingTop}
          isError={errorTop}
          keyExtractor={(p) => p.producto_id}
          emptyTitle="Sin productos vendidos"
          emptyDescription="Aún no se registran salidas por venta de productos."
        />
      </div>
    </div>
  );
}
