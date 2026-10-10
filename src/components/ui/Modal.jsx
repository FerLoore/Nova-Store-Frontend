import { useEffect, useRef } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}) {
  // Contador global de modales abiertos para evitar limpiar overflow si hay otro modal abierto
  const didSetOverflow = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      didSetOverflow.current = true;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      // Solo restaurar si fuimos nosotros quienes lo pusimos en hidden
      if (didSetOverflow.current) {
        didSetOverflow.current = false;
        document.body.style.overflow = "";
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Al hacer clic en el fondo oscuro (backdrop), se cierra el modal
  const handleBackdropClick = (e) => {
    // Solo cerrar si se hizo clic directamente en el fondo, no en el contenido
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(12,10,8,0.55)" }}
      onClick={handleBackdropClick}
    >
      {/* Caja modal: paper, hairline border, 16px radius, sin sombra */}
      <div
        className={`bg-paper border border-hairline shadow-none w-full ${maxWidth} max-h-[92vh] flex flex-col`}
        style={{ borderRadius: 16 }}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-hairline"
          style={{ borderRadius: "16px 16px 0 0" }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "#0c0a08",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              lineHeight: 1,
              color: "#5f5e5d",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 6,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0c0a08")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5f5e5d")}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

