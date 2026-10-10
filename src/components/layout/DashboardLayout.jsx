import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./TopNav";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f2f0" }}>
      {/* Sidebar desktop */}
      <div className="hidden lg:flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30 w-[248px]">
        <Sidebar />
      </div>

      {/* Backdrop móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(12,10,8,0.55)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar móvil deslizante */}
      <div
        className="fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300"
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col lg:pl-[248px] min-w-0">
        {/* Top bar móvil */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{ background: "#1a1919" }}
        >
          <div className="flex items-center gap-2">
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
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
              color: "#d3d3d3",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Menú
          </button>
        </header>

        {/* Área de página */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

