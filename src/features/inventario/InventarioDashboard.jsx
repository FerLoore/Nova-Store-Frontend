import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useInventario } from "../../hooks/useInventario";
import { usePermiso } from "../../hooks/usePermiso";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { formatDate, formatCurrency } from "../../utils/formatters";

export function InventarioDashboard() {
  const { puedeEscribir: puedeEscribirInventario } = usePermiso("INVENTARIO");
  const { puedeEscribir: puedeEscribirCompras } = usePermiso("COMPRAS");

  const {
    inventario,
    isLoadingGeneral,
    isErrorGeneral,
    refetchGeneral,
    alertas,
    isLoadingAlertas,
    isErrorAlertas,
    refetchAlertas,
    kardex,
    isLoadingKardex,
    isErrorKardex,
    refetchKardex,
  } = useInventario();

  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'alertas' | 'movimientos'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlmacen, setSelectedAlmacen] = useState("TODOS");

  // Almacenes únicos para filtro
  const almacenesDisponibles = useMemo(() => {
    const set = new Set();
    inventario.forEach((item) => {
      if (item.almacen_nombre) set.add(item.almacen_nombre);
    });
    return Array.from(set);
  }, [inventario]);

  // Filtrado de inventario general
  const filteredInventario = useMemo(() => {
    return inventario.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variante_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variante_color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variante_talla?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAlmacen =
        selectedAlmacen === "TODOS" || item.almacen_nombre === selectedAlmacen;

      return matchSearch && matchAlmacen;
    });
  }, [inventario, searchTerm, selectedAlmacen]);

  // Total de unidades en stock
  const totalUnidades = useMemo(() => {
    return inventario.reduce((acc, it) => acc + (Number(it.inventario_cantidad) || 0), 0);
  }, [inventario]);

  // Columnas para Inventario General
  const generalColumns = [
    {
      header: "Nombre del Producto",
      accessor: "producto_nombre",
      render: (item) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0c0a08", display: "block" }}>
            {item.producto_nombre}
          </span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            Stock mínimo configurado: {item.variante_stock_minimo}
          </span>
        </div>
      ),
    },
    {
      header: "SKU",
      accessor: "variante_sku",
      render: (item) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 12,
            background: "#f3f4f6",
            padding: "2px 6px",
            borderRadius: 4,
            color: "#111827",
          }}
        >
          {item.variante_sku}
        </span>
      ),
    },
    {
      header: "Talla",
      accessor: "variante_talla",
      render: (item) => (
        <span style={{ fontWeight: 500, color: "#111827" }}>
          {item.variante_talla}
        </span>
      ),
    },
    {
      header: "Color",
      accessor: "variante_color",
      render: (item) => (
        <span style={{ color: "#374151" }}>{item.variante_color}</span>
      ),
    },
    {
      header: "Almacén",
      accessor: "almacen_nombre",
      render: (item) => (
        <span style={{ color: "#4b5563" }}>{item.almacen_nombre || "Principal"}</span>
      ),
    },
    {
      header: "Cantidad Actual (Stock)",
      accessor: "inventario_cantidad",
      align: "right",
      render: (item) => {
        const isBajo = item.inventario_cantidad <= item.variante_stock_minimo;
        return (
          <div className="flex items-center justify-end gap-2">
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: isBajo ? "#b91c1c" : "#111827",
              }}
            >
              {item.inventario_cantidad}
            </span>
            {isBajo && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 9999,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  textTransform: "uppercase",
                }}
              >
                Bajo
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // Columnas para la Tabla Destacada de Alertas
  const alertasColumns = [
    {
      header: "SKU en Alerta",
      accessor: "variante_sku",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 13,
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #fca5a5",
            }}
          >
            {item.variante_sku}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#b91c1c",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ● CRÍTICO
          </span>
        </div>
      ),
    },
    {
      header: "Producto",
      accessor: "producto_nombre",
      render: (item) => (
        <span style={{ fontWeight: 600, color: "#111827" }}>
          {item.producto_nombre}
        </span>
      ),
    },
    {
      header: "Talla / Color",
      render: (item) => (
        <span style={{ color: "#374151" }}>
          {item.variante_talla} / {item.variante_color}
        </span>
      ),
    },
    {
      header: "Almacén",
      accessor: "almacen_nombre",
      render: (item) => (
        <span style={{ color: "#4b5563" }}>{item.almacen_nombre || "Principal"}</span>
      ),
    },
    {
      header: "Cantidad Actual",
      accessor: "inventario_cantidad",
      align: "right",
      render: (item) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#b91c1c",
            background: "#fff1f2",
            padding: "2px 8px",
            borderRadius: 6,
            border: "1px solid #fecdd3",
          }}
        >
          {item.inventario_cantidad}
        </span>
      ),
    },
    {
      header: "Stock Mínimo",
      accessor: "variante_stock_minimo",
      align: "right",
      render: (item) => (
        <span style={{ fontWeight: 600, color: "#4b5563", fontSize: 13 }}>
          {item.variante_stock_minimo}
        </span>
      ),
    },
    {
      header: "Déficit Requerido",
      align: "right",
      render: (item) => (
        <span style={{ fontWeight: 700, color: "#dc2626", fontSize: 13 }}>
          +{item.diferencia > 0 ? item.diferencia : 1} unid.
        </span>
      ),
    },
    ...(puedeEscribirCompras
      ? [
          {
            header: "Acción",
            align: "right",
            render: () => (
              <Link to="/compras" style={{ textDecoration: "none" }}>
                <Button variant="compact" style={{ background: "#b91c1c", color: "#fff", borderColor: "#b91c1c" }}>
                  Reabastecer
                </Button>
              </Link>
            ),
          },
        ]
      : []),
  ];

  // Columnas para Kardex (movimientos de inventario desde /nova-inventario/kardex)
  const movimientosColumns = [
    {
      header: "Fecha / Hora",
      accessor: "fecha",
      render: (m) => (
        <span style={{ fontSize: 13, color: "#374151" }}>
          {formatDate(m.fecha)}
        </span>
      ),
    },
    {
      header: "Tipo",
      accessor: "tipo",
      render: (m) => {
        const tipo = (m.tipo || "").toUpperCase();
        let bg = "#f3f4f6";
        let color = "#374151";
        let label = tipo;

        if (tipo === "ENTRADA") {
          bg = "#ecfdf5"; color = "#047857"; label = "ENTRADA";
        } else if (tipo === "SALIDA") {
          bg = "#fef2f2"; color = "#b91c1c"; label = "SALIDA";
        } else if (tipo === "AJUSTE") {
          bg = "#eff6ff"; color = "#1d4ed8"; label = "AJUSTE";
        }

        return (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              background: bg,
              color,
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: "Documento",
      accessor: "tipo_documento",
      render: (m) => (
        <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>
          {m.tipo_documento || "—"}
        </span>
      ),
    },
    {
      header: "Producto / Variante",
      render: (m) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: 12, color: "#0c0a08", display: "block" }}>
            {m.variante?.producto?.producto_nombre || m.producto?.producto_nombre || "—"}
          </span>
          <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
            SKU: {m.variante?.variante_sku || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Almacén",
      render: (m) => (
        <span style={{ fontSize: 12, color: "#4b5563" }}>
          {m.almacen?.almacen_nombre || "—"}
        </span>
      ),
    },
    {
      header: "Cantidad",
      accessor: "cantidad",
      align: "right",
      render: (m) => {
        const cantidad = Number(m.cantidad) || 0;
        const isEntrada = (m.tipo || "").toUpperCase() === "ENTRADA";
        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: isEntrada ? "#047857" : "#b91c1c",
            }}
          >
            {isEntrada ? "+" : "-"}{Math.abs(cantidad)}
          </span>
        );
      },
    },
    {
      header: "Saldo",
      accessor: "saldo_acumulado",
      align: "right",
      render: (m) => (
        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
          {m.saldo_acumulado ?? "—"}
        </span>
      ),
    },
    {
      header: "Usuario",
      render: (m) => (
        <span style={{ fontSize: 12, color: "#374151" }}>
          {m.usuario?.usuario_nombre || "Sistema"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: "0 0 6px" }}>
            Control de existencias
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Stock y Alertas de Inventario
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              refetchGeneral();
              refetchAlertas();
            }}
          >
            Actualizar datos
          </Button>
          {puedeEscribirCompras && (
            <Link to="/compras" style={{ textDecoration: "none" }}>
              <Button variant="primary">
                + Nueva Orden de Compra
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 8px" }}>
            Variantes en Inventario
          </p>
          <span style={{ fontSize: 32, fontWeight: 600, color: "#111827" }}>
            {inventario.length}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>
            registros
          </span>
        </div>

        {/* KPI 2 */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 8px" }}>
            Unidades Totales en Stock
          </p>
          <span style={{ fontSize: 32, fontWeight: 600, color: "#111827" }}>
            {totalUnidades}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>
            unidades
          </span>
        </div>

        {/* KPI 3: Alertas Críticas */}
        <div
          onClick={() => setActiveTab("alertas")}
          style={{
            background: alertas.length > 0 ? "#fef2f2" : "#f0fdf4",
            border: alertas.length > 0 ? "1px solid #fecaca" : "1px solid #bbf7d0",
            borderRadius: 16,
            padding: "20px 24px",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          className="hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: alertas.length > 0 ? "#b91c1c" : "#15803d",
                margin: "0 0 8px",
              }}
            >
              Alertas de Stock Mínimo
            </p>
            {alertas.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#b91c1c",
                  color: "#ffffff",
                  padding: "2px 8px",
                  borderRadius: 9999,
                }}
              >
                Atención requerida
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: alertas.length > 0 ? "#b91c1c" : "#15803d",
            }}
          >
            {alertas.length}
          </span>
          <span
            style={{
              fontSize: 12,
              color: alertas.length > 0 ? "#b91c1c" : "#15803d",
              marginLeft: 8,
            }}
          >
            {alertas.length === 1 ? "SKU crítico" : "SKUs críticos"}
          </span>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: activeTab === "general" ? "#0c0a08" : "transparent",
            color: activeTab === "general" ? "#ffffff" : "#6b7280",
            transition: "all 0.15s",
          }}
        >
          Dashboard de Inventario ({inventario.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alertas")}
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: activeTab === "alertas" ? "#b91c1c" : (alertas.length > 0 ? "#fee2e2" : "transparent"),
            color: activeTab === "alertas" ? "#ffffff" : (alertas.length > 0 ? "#b91c1c" : "#6b7280"),
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Panel de Alertas</span>
          {alertas.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 9999,
                padding: "1px 6px",
                background: activeTab === "alertas" ? "#ffffff" : "#b91c1c",
                color: activeTab === "alertas" ? "#b91c1c" : "#ffffff",
              }}
            >
              {alertas.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("movimientos")}
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: activeTab === "movimientos" ? "#0c0a08" : "transparent",
            color: activeTab === "movimientos" ? "#ffffff" : "#6b7280",
            transition: "all 0.15s",
          }}
        >
          Movimientos e Historial (Kardex) ({kardex.length})
        </button>
      </div>

      {/* Contenido Pestaña 1: Dashboard de Inventario General */}
      {activeTab === "general" && (
        <div className="space-y-4">
          {/* Filtros de búsqueda y almacén */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                placeholder="Buscar por producto, SKU, color o talla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {almacenesDisponibles.length > 1 && (
              <div className="w-full sm:w-60">
                <select
                  value={selectedAlmacen}
                  onChange={(e) => setSelectedAlmacen(e.target.value)}
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    padding: "0 12px",
                    fontSize: 13,
                    background: "#ffffff",
                  }}
                >
                  <option value="TODOS">Todos los almacenes</option>
                  {almacenesDisponibles.map((alm) => (
                    <option key={alm} value={alm}>
                      {alm}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tabla de Inventario */}
          <DataTable
            columns={generalColumns}
            data={filteredInventario}
            isLoading={isLoadingGeneral}
            isError={isErrorGeneral}
            emptyTitle="Sin registros de stock"
            emptyDescription="No se encontraron registros de inventario en los almacenes."
            keyExtractor={(item) => `${item.inventario_id}_${item.variante_sku}`}
          />
        </div>
      )}

      {/* Contenido Pestaña 2: Vista / Panel de Alertas */}
      {activeTab === "alertas" && (
        <div className="space-y-4">
          {/* Banner descriptivo de alerta */}
          <div
            style={{
              padding: "16px 20px",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#991b1b" }}>
                Panel de Alertas de Reabastecimiento Crítico
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>
                Los siguientes SKUs presentan una <strong>Cantidad Actual menor o igual (≤) a su Stock Mínimo</strong>.
                Se requiere generar órdenes de compra para reponer existencias.
              </p>
            </div>
            {puedeEscribirCompras && (
              <Link to="/compras" style={{ textDecoration: "none" }}>
                <Button variant="primary" style={{ background: "#b91c1c", borderColor: "#b91c1c" }}>
                  Ir a Crear Orden de Compra
                </Button>
              </Link>
            )}
          </div>

          {/* Tabla Destacada de Alertas */}
          <DataTable
            columns={alertasColumns}
            data={alertas}
            isLoading={isLoadingAlertas}
            isError={isErrorAlertas}
            emptyTitle="¡Todo en orden!"
            emptyDescription="Ningún SKU se encuentra por debajo de su stock mínimo en este momento."
            keyExtractor={(item) => `alerta_${item.inventario_id}_${item.variante_sku}`}
          />
        </div>
      )}

      {/* Contenido Pestaña 3: Movimientos e Historial (Kardex) */}
      {activeTab === "movimientos" && (
        <div className="space-y-4">
          <div
            style={{
              padding: "16px 20px",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Historial de Movimientos de Stock (Kardex)
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
                Registro cronológico de entradas por compras, salidas por facturación de ventas y ajustes en existencias.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => refetchKardex()}
            >
              Refrescar Kardex
            </Button>
          </div>

          <DataTable
            columns={movimientosColumns}
            data={kardex}
            isLoading={isLoadingKardex}
            isError={isErrorKardex}
            emptyTitle="Sin movimientos registrados"
            emptyDescription="Aún no hay registros de movimientos o ajustes de inventario."
            keyExtractor={(item) => item.movimiento_id ?? Math.random()}
          />
        </div>
      )}
    </div>
  );
}
