import { Button } from "./Button";

export function EmptyState({
  title = "Sin registros",
  description = "No se encontraron datos para mostrar.",
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="py-12 px-4 text-center bg-paper border border-dashed border-hairline my-2"
      style={{ borderRadius: 16 }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 500, color: "#0c0a08", margin: "0 0 6px" }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: "#5f5e5d", maxWidth: 360, margin: "0 auto" }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

