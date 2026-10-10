import { forwardRef } from "react";

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    id,
    options = [],
    placeholder = "Seleccionar...",
    className = "",
    containerClassName = "",
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
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
      <select
        ref={ref}
        id={selectId}
        className={`w-full bg-paper text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border border-danger focus:outline-none focus:border-danger"
            : "border border-smoke focus:outline-none focus:border-ink"
        } ${className}`}
        style={{
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 14,
          lineHeight: 1.4,
          appearance: "auto",
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled style={{ color: "#5f5e5d" }}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
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

