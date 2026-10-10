import { Component } from "react";
import { Button } from "./Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            maxWidth: 480,
            margin: "48px auto",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#b42318", display: "block", marginBottom: 8 }}>
            Error en la aplicación
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 400, color: "#0c0a08", marginBottom: 12, letterSpacing: "-0.01em" }}>
            Algo no salió como se esperaba
          </h1>
          <p style={{ fontSize: 13, color: "#5f5e5d", marginBottom: 24, lineHeight: 1.6 }}>
            Ocurrió un error inesperado al renderizar esta sección. Puedes recargar o regresar al inicio.
          </p>
          <Button variant="primary" onClick={this.handleReset}>
            Volver al inicio
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
