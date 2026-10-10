import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function UnauthorizedPage({ requiredPermisos = [] }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      style={{ minHeight: "70vh" }}
    >
      {/* Número gigante */}
      <div className="relative inline-block mb-6">
        <span
          style={{
            fontSize: "clamp(120px, 18vw, 200px)",
            fontWeight: 400,
            lineHeight: 0.85,
            color: "#0c0a08",
            letterSpacing: "-0.03em",
            display: "block",
          }}
        >
          403
        </span>
        {/* Subrayado volt */}
        <div
          style={{
            height: 6,
            background: "#e4f222",
            borderRadius: 3,
            marginTop: 8,
          }}
        />
      </div>

      <h1
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: "#0c0a08",
          margin: "0 0 12px",
        }}
      >
        Acceso no autorizado
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#5f5e5d",
          maxWidth: 400,
          margin: "0 auto 8px",
          lineHeight: 1.6,
        }}
      >
        Tu cuenta no tiene los permisos necesarios para acceder a esta sección.
      </p>
      {requiredPermisos.length > 0 && (
        <p
          style={{
            fontSize: 12,
            color: "#b42318",
            marginBottom: 24,
            fontFamily: "monospace",
          }}
        >
          Permisos requeridos: {requiredPermisos.join(", ")}
        </p>
      )}
      <div style={{ marginTop: requiredPermisos.length > 0 ? 0 : 24 }}>
        <Link to="/">
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}

