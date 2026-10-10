export function Spinner({ size = "md", className = "" }) {
  const sizeClass =
    size === "sm" ? "w-4 h-4 border-[2px]" : size === "lg" ? "w-8 h-8 border-[3px]" : "w-6 h-6 border-[2px]";

  return (
    <div
      className={`inline-block animate-spin rounded-full border-ink border-t-transparent ${sizeClass} ${className}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

