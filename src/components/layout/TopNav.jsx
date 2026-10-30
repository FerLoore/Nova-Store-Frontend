import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LuMenu, LuX, LuLogOut } from "react-icons/lu";

export function Sidebar({ onClose }) {
  const { usuario, menu, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (onClose) onClose();
  };

  const rolNombre = usuario?.rol_nombre || "";

  return (
    <aside
      style={{ background: "#1a1919" }}
      className="flex flex-col h-full w-[248px] min-h-screen"
    >
      {/* Wordmark */}
      <div className="px-6 pt-7 pb-5 border-b border-white/10">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 no-underline"
          aria-label="Ir al inicio"
        >
          <span
            style={{
              background: "#e4f222",
              width: 10,
              height: 10,
              display: "inline-block",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            NOVA
          </span>
        </Link>
        <p
          style={{
            fontSize: 10,
            color: "#8b8d98",
            letterSpacing: "0.04em",
            marginTop: 6,
            textTransform: "uppercase",
          }}
        >
          Panel Administrativo
        </p>
      </div>

      {/* Menú */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <li>
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "sidebar-item-active" : "sidebar-item"
              }
              style={({ isActive }) => ({
                display: "block",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.15s",
                background: isActive ? "#e4f222" : "transparent",
                color: isActive ? "#0c0a08" : "#d3d3d3",
              })}
            >
              Inicio
            </NavLink>
          </li>
          {menu.map((item) => (
            <li key={item.clave}>
              <NavLink
                to={item.ruta}
                end
                onClick={onClose}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  background: isActive ? "#e4f222" : "transparent",
                  color: isActive ? "#0c0a08" : "#d3d3d3",
                })}
              >
                {item.etiqueta}
              </NavLink>
            </li>
          ))}
          {menu.some((m) => m.ruta === "/productos") && (
            <li>
              <NavLink
                to="/marcas"
                onClick={onClose}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  background: isActive ? "#e4f222" : "transparent",
                  color: isActive ? "#0c0a08" : "#d3d3d3",
                })}
              >
                Marcas
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      {usuario && (
        <div className="px-4 py-5 border-t border-white/10">
          <div className="mb-3">
            <p style={{ fontSize: 13, color: "#ffffff", fontWeight: 500, margin: 0 }}>
              {usuario.usuario_nombre}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5f5e5d",
                border: "1px solid #3a3a3a",
                borderRadius: 6,
                padding: "1px 7px",
              }}
            >
              {rolNombre}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "block",
              width: "100%",
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              color: "#d3d3d3",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "#d3d3d3";
            }}
          >
            Salir
          </button>
        </div>
      )}
    </aside>
  );
}


export function TopNav() {
  const { usuario, menu, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#1a1919",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
      className="w-full relative z-40"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Izquierda: Wordmark + Menú (desktop) */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 no-underline"
            aria-label="Ir al inicio"
          >
            <span
              style={{
                background: "#e4f222",
                width: 8,
                height: 8,
                display: "inline-block",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              NOVA
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 6,
                textDecoration: "none",
                background: isActive ? "#e4f222" : "transparent",
                color: isActive ? "#0c0a08" : "#d3d3d3",
                transition: "background 0.15s, color 0.15s",
              })}
            >
              Inicio
            </NavLink>
            {menu.map((item) => (
              <NavLink
                key={item.clave}
                to={item.ruta}
                style={({ isActive }) => ({
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: isActive ? "#e4f222" : "transparent",
                  color: isActive ? "#0c0a08" : "#d3d3d3",
                  transition: "background 0.15s, color 0.15s",
                })}
              >
                {item.etiqueta}
              </NavLink>
            ))}
            {menu.some((m) => m.ruta === "/productos") && (
              <NavLink
                to="/marcas"
                style={({ isActive }) => ({
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: isActive ? "#e4f222" : "transparent",
                  color: isActive ? "#0c0a08" : "#d3d3d3",
                  transition: "background 0.15s, color 0.15s",
                })}
              >
                Marcas
              </NavLink>
            )}
          </div>
        </div>

        {/* Botón hamburguesa en móvil */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#d3d3d3",
              padding: "5px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (<span className="inline-flex items-center gap-1"><LuX className="w-3.5 h-3.5" /> CERRAR</span>) : (<span className="inline-flex items-center gap-1"><LuMenu className="w-3.5 h-3.5" /> MENÚ</span>)}
          </button>
        </div>

        {/* Derecha: Usuario y Salir */}
        <div className="hidden lg:flex items-center gap-4">
          {usuario && (
            <div className="flex flex-col items-end text-right">
              <span style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>
                {usuario.usuario_nombre}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#8b8d98",
                }}
              >
                {usuario.rol_nombre}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#d3d3d3",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Menú desplegable en móvil */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            background: "#1a1919",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
          className="lg:hidden"
        >
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            style={({ isActive }) => ({
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "8px 12px",
              borderRadius: 6,
              textDecoration: "none",
              background: isActive ? "#e4f222" : "transparent",
              color: isActive ? "#0c0a08" : "#d3d3d3",
            })}
          >
            Inicio
          </NavLink>
          {menu.map((item) => (
            <NavLink
              key={item.clave}
              to={item.ruta}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "8px 12px",
                borderRadius: 6,
                textDecoration: "none",
                background: isActive ? "#e4f222" : "transparent",
                color: isActive ? "#0c0a08" : "#d3d3d3",
              })}
            >
              {item.etiqueta}
            </NavLink>
          ))}
          {menu.some((m) => m.ruta === "/productos") && (
            <NavLink
              to="/marcas"
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "8px 12px",
                borderRadius: 6,
                textDecoration: "none",
                background: isActive ? "#e4f222" : "transparent",
                color: isActive ? "#0c0a08" : "#d3d3d3",
              })}
            >
              Marcas
            </NavLink>
          )}
          {usuario && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#ffffff", display: "block" }}>
                  {usuario.usuario_nombre}
                </span>
                <span style={{ fontSize: 10, color: "#8b8d98", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {usuario.rol_nombre}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: "block",
                  width: "100%",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#d3d3d3",
                  padding: "6px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
