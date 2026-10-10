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
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

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
