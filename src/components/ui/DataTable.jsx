import { Spinner } from "./Spinner";
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
  keyExtractor = (item, idx) => item.id || idx,
}) {
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

  const items = Array.isArray(data) ? data : [];

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

  return (
    <div
      className="w-full overflow-x-auto bg-paper border border-hairline"
      style={{ borderRadius: 16 }}
    >
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
          {items.map((item, rowIdx) => (
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
  );
}

