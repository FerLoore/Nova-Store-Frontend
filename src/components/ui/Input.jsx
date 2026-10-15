import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = "text",
    className = "",
    containerClassName = "",
    rightElement,
    restrictType, // "letters" | "numbers" | "phone" | "decimal"
    onKeyDown,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const handleKeyDown = (e) => {
    // Permitir teclas de control y atajos (Ctrl+A, Ctrl+C, Ctrl+V, flechas, etc.)
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.key === "Backspace" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Delete" ||
      e.key === "Escape" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      if (onKeyDown) onKeyDown(e);
      return;
    }

    // Para inputs numéricos, bloquear signos negativos '-', exponentes 'e', 'E' y '+'
    if ((type === "number" || restrictType === "numbers" || restrictType === "decimal") && 
        (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")) {
      e.preventDefault();
      return;
    }

    // Restricción: solo letras y espacios (sin números, sin símbolos, sin apóstrofes ni guiones)
    if (restrictType === "letters") {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    // Restricción: solo dígitos numéricos (para stock, enteros)
    if (restrictType === "numbers") {
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    // Restricción: NIT (solo números, letra 'k'/'K' y máximo un guión '-', límite de 10 caracteres)
    if (restrictType === "nit") {
      const currentVal = e.currentTarget.value || "";
      if (e.key === "-") {
        if (currentVal.includes("-") || currentVal.length >= 10) {
          e.preventDefault();
          return;
        }
      } else if (e.key === "k" || e.key === "K") {
        if (currentVal.toLowerCase().includes("k") || currentVal.length >= 10) {
          e.preventDefault();
          return;
        }
      } else if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      } else if (currentVal.length >= 10) {
        e.preventDefault();
        return;
      }
    }

    // Restricción: teléfono (números y espacios)
    if (restrictType === "phone") {
      if (!/^[0-9\s]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    // Restricción: decimal (números y punto decimal único, sin negativos)
    if (restrictType === "decimal") {
      if (e.key === ".") {
        if (e.currentTarget.value.includes(".")) {
          e.preventDefault();
          return;
        }
      } else if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    // Restricción alfanumérica limpia (letras, números y espacios para marcas/productos)
    if (restrictType === "alphanumeric") {
      if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#5f5e5d",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full bg-paper text-ink placeholder-ash/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border border-danger focus:outline-none focus:border-danger"
              : "border border-smoke focus:outline-none focus:border-ink"
          } ${className}`}
          style={{
            borderRadius: 10,
            padding: "10px 14px",
            paddingRight: rightElement ? 42 : 14,
            fontSize: 14,
            lineHeight: 1.4,
          }}
          min={
            type === "number" || restrictType === "numbers" || restrictType === "decimal"
              ? (props.min ?? "0")
              : props.min
          }
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            if (type === "number" || restrictType === "numbers" || restrictType === "decimal") {
              if (e.currentTarget.value && Number(e.currentTarget.value) < 0) {
                e.currentTarget.value = "0";
              }
            }
            if (props.onInput) props.onInput(e);
          }}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p style={{ marginTop: 4, fontSize: 12, color: "#b42318", lineHeight: 1.4 }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ marginTop: 4, fontSize: 11, color: "#5f5e5d", lineHeight: 1.4 }}>
          {helperText}
        </p>
      )}
    </div>
  );
});
