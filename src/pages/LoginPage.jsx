import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "../features/auth/LoginForm";
import { RegisterForm } from "../features/auth/RegisterForm";

export function LoginPage({ initialMode = "login" }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // "login" | "register"

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f2f0" }}>
      {/* Panel izquierdo — solo escritorio */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 min-h-screen p-12 relative overflow-hidden flex-shrink-0"
        style={{ background: "#1a1919" }}
      >
        {/* Forma geométrica volt decorativa */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 80,
            right: -60,
            width: 280,
            height: 280,
            background: "#e4f222",
            borderRadius: "50% 0 50% 0",
            opacity: 0.9,
            transform: "rotate(15deg)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 120,
            right: 80,
            width: 60,
            height: 60,
            background: "#e4f222",
            borderRadius: 4,
            opacity: 0.6,
          }}
        />

        {/* Wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span
              style={{
                background: "#e4f222",
                width: 12,
                height: 12,
                display: "inline-block",
                borderRadius: 3,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#8b8d98",
              }}
            >
              Panel Administrativo
            </span>
          </div>
        </div>

        {/* Centro — NOVA gigante + tagline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1
            style={{
              fontSize: "clamp(72px, 10vw, 160px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
              color: "#ffffff",
              margin: "0 0 32px",
            }}
          >
            NOVA
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#8b8d98",
              lineHeight: 1.5,
              maxWidth: 320,
            }}
          >
            Gestión de pedidos, inventario y ventas
          </p>
        </div>

        {/* Footer izquierdo */}
        <div className="relative z-10">
          <p style={{ fontSize: 11, color: "#3a3a3a", letterSpacing: "0.04em" }}>
            © {new Date().getFullYear()} Nova Store
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        {/* Wordmark móvil */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <span
            style={{
              background: "#e4f222",
              width: 10,
              height: 10,
              display: "inline-block",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#0c0a08",
            }}
          >
            NOVA
          </span>
        </div>

        {/* Tarjeta de formulario */}
        <div
          className="w-full max-w-sm bg-paper border border-hairline"
          style={{ borderRadius: 16, padding: "40px 36px" }}
        >
          <div className="mb-8">
            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "#0c0a08",
                margin: "0 0 6px",
                lineHeight: 1.2,
              }}
            >
              {mode === "login" ? "Iniciar sesión" : "Registrar usuario"}
            </h2>
            <p style={{ fontSize: 13, color: "#5f5e5d", margin: 0 }}>
              {mode === "login"
                ? "Accede al panel de administración"
                : "Crea tu cuenta para acceder al sistema"}
            </p>
          </div>

          {mode === "login" ? (
            <LoginForm onToggleMode={() => setMode("register")} />
          ) : (
            <RegisterForm onToggleMode={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
