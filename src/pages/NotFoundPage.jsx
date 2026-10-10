import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
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
          404
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
        Página no encontrada
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#5f5e5d",
          maxWidth: 360,
          margin: "0 auto 32px",
          lineHeight: 1.6,
        }}
      >
        La ruta que intentas consultar no existe o ha sido movida.
      </p>
      <Link to="/">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  );
}

