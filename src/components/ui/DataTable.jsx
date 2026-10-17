import { useState, useEffect } from "react";
import { EmptyState } from "./EmptyState";

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  isError = false,
  errorMessage = "Error al cargar los registros.",
  emptyTitle = "Sin registros",
  emptyDescription = "No se encontraron elementos disponibles.",
  onEmptyAction,
  emptyActionLabel,
  pageSize = 10,
  showPagination = true,
  keyExtractor = (item, idx) => item.id || idx,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const items = Array.isArray(data) ? data : [];
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (isLoading) {
    return (
      <div
        className="bg-paper border border-hairline"
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        {/* Skeleton header */}
        <div style={{ background: "#f4f2f0", borderBottom: "1px solid #e5e7eb", padding: "12px 16px" }}>
          <div style={{ height: 11, width: 120, background: "#d3d3d3", borderRadius: 4 }} />
        </div>
        {/* Skeleton rows */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid #e5e7eb",
              padding: "14px 16px",
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ height: 12, flex: 2, background: "#f4f2f0", borderRadius: 4 }} />
            <div style={{ height: 12, flex: 3, background: "#f4f2f0", borderRadius: 4 }} />
            <div style={{ height: 12, flex: 1, background: "#f4f2f0", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="p-8 text-center border border-hairline bg-paper"
        style={{ borderRadius: 16 }}
      >
        <p style={{ fontSize: 13, color: "#b42318", fontWeight: 500 }}>
          {errorMessage}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onAction={onEmptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = showPagination ? items.slice(startIndex, endIndex) : items;

  return (
    <div
      className="w-full overflow-hidden bg-paper border border-hairline"
      style={{ borderRadius: 16 }}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr style={{ background: "#f4f2f0", borderBottom: "1px solid #e5e7eb" }}>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  style={{
                    padding: "12px 16px",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#5f5e5d",
                    textAlign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
                  }}
                  className={col.headerClassName || ""}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.12s" }}
                className="hover:bg-bone"
              >
                {columns.map((col, colIdx) => {
                  const val = col.accessor
                    ? typeof col.accessor === "function"
                      ? col.accessor(item)
                      : item[col.accessor]
                    : null;
                  return (
                    <td
                      key={col.key || colIdx}
                      style={{
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#0c0a08",
                        textAlign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
                      }}
                      className={col.cellClassName || ""}
                    >
                      {col.render ? col.render(item, rowIdx) : val ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalItems > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 16px",
            background: "#fdfcfb",
            borderTop: "1px solid #e5e7eb",
            fontSize: 13,
            color: "#5f5e5d",
          }}
        >
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> a{" "}
              <strong>{endIndex}</strong> de <strong>{totalItems}</strong> registros
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span>Filas por página:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "2px 6px",
                  background: "#ffffff",
                  fontSize: 12,
                  color: "#0c0a08",
                  cursor: "pointer",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  background: currentPage === 1 ? "#f4f2f0" : "#ffffff",
                  color: currentPage === 1 ? "#9ca3af" : "#0c0a08",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                ‹ Anterior
              </button>

              <span style={{ padding: "0 6px", fontSize: 12, fontWeight: 600, color: "#0c0a08" }}>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  background: currentPage >= totalPages ? "#f4f2f0" : "#ffffff",
                  color: currentPage >= totalPages ? "#9ca3af" : "#0c0a08",
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

