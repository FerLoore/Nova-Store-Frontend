import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { usePermiso } from "../../hooks/usePermiso";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useClientes } from "../../hooks/useClientes";
import { useProductos } from "../../hooks/useProductos";
import { useMarcas } from "../../hooks/useMarcas";
import { useRoles } from "../../hooks/useRoles";

export function DashboardOverview() {
  const { usuario } = useAuth();

  const { puedeVer: hasUsuarios } = usePermiso("USUARIOS");
  const { puedeVer: hasRoles } = usePermiso("ROLES");
  const { puedeVer: hasClientes } = usePermiso("CLIENTES");
  const { puedeVer: hasProductos } = usePermiso("PRODUCTOS");

  const { usuarios, isLoading: loadingUsuarios } = useUsuarios({ enabled: hasUsuarios });
  const { roles, isLoading: loadingRoles } = useRoles({ enabled: hasRoles });
  const { clientes, isLoading: loadingClientes } = useClientes({ enabled: hasClientes });
  const { productos, isLoading: loadingProductos } = useProductos({ enabled: hasProductos });
  const { marcas, isLoading: loadingMarcas } = useMarcas({ enabled: hasProductos });

  const primerNombre = usuario?.usuario_nombre?.split(" ")[0] || "Usuario";

  // Construir lista de tarjetas
  const cards = [];
  if (hasUsuarios) {
    cards.push({
      label: "Usuarios activos",
      count: loadingUsuarios ? "—" : Array.isArray(usuarios) ? usuarios.length : 0,
      to: "/usuarios",
    });
  }
  if (hasRoles) {
    cards.push({
      label: "Roles definidos",
      count: loadingRoles ? "—" : Array.isArray(roles) ? roles.length : 0,
      to: "/roles",
    });
  }
  if (hasClientes) {
    cards.push({
      label: "Clientes registrados",
      count: loadingClientes ? "—" : Array.isArray(clientes) ? clientes.length : 0,
      to: "/clientes",
    });
  }
  if (hasProductos) {
    cards.push({
      label: "Productos activos",
      count: loadingProductos ? "—" : Array.isArray(productos) ? productos.length : 0,
      to: "/productos",
    });
    cards.push({
      label: "Marcas registradas",
      count: loadingMarcas ? "—" : Array.isArray(marcas) ? marcas.length : 0,
      to: "/marcas",
    });
  }

  return (
    <div className="space-y-10">
      {/* Saludo */}
      <div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "#0c0a08",
            margin: "0 0 10px",
          }}
        >
          Hola, {primerNombre}
        </h1>
        {/* Etiqueta de rol */}
        <span
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#5f5e5d",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          {usuario?.rol_nombre}
        </span>
      </div>

      {/* Tarjetas de conteo */}
      {cards.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#5f5e5d",
              marginBottom: 16,
            }}
          >
            Resumen general
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
              gap: 16,
            }}
          >
            {cards.map((card, idx) => {
              const isFocal = idx === 0;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  style={{
                    display: "block",
                    padding: "24px",
                    borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    background: isFocal ? "#1a1919" : "#ffffff",
                    transition: "border-color 0.15s, transform 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isFocal ? "#e4f222" : "#d3d3d3";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: isFocal ? "#8b8d98" : "#5f5e5d",
                      marginBottom: 12,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 400,
                      lineHeight: 1,
                      color: isFocal ? "#e4f222" : "#0c0a08",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.count}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
