import { useState, useEffect, useRef } from "react";

export const COUNTRIES = [
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", dialCode: "+507", flag: "🇵🇦" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
];

/**
 * Función que formatea una cadena de dígitos separándolos en grupos de 4 números.
 * Ejemplo: "55555555" -> "5555 5555"
 */
export function formatEveryFourDigits(value = "") {
  // Limpiar cualquier carácter que no sea número
  const digits = value.replace(/\D/g, "");
  // Agrupar cada 4 dígitos con espacio
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

export function PhoneInput({
  label,
  error,
  value = "",
  onChange,
  id,
  className = "",
  containerClassName = "",
  placeholder = "5555 5555",
  ...props
}) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default Guatemala +502
  const [nationalNumber, setNationalNumber] = useState("");
  const isInternalUpdate = useRef(false);

  // Parsear el valor externo inicial si viene con código de país
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (!value) {
      setNationalNumber("");
      return;
    }

    // Comprobar si empieza por algún prefijo
    let matchedCountry = null;
    let remainder = value.trim();

    for (const c of COUNTRIES) {
      if (remainder.startsWith(c.dialCode)) {
        matchedCountry = c;
        remainder = remainder.slice(c.dialCode.length).trim();
        break;
      }
    }

    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
      setNationalNumber(formatEveryFourDigits(remainder));
    } else {
      setNationalNumber(formatEveryFourDigits(value));
    }
  }, [value]);

  const handleCountryChange = (e) => {
    const code = e.target.value;
    const country = COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
    setSelectedCountry(country);

    if (nationalNumber) {
      const full = `${country.dialCode} ${nationalNumber}`;
      isInternalUpdate.current = true;
      if (onChange) onChange(full);
    }
  };

  const handleNumberChange = (e) => {
    // Tomar solo los números
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 12); // Max 12 dígitos
    const formatted = formatEveryFourDigits(rawDigits);
    setNationalNumber(formatted);

    const fullVal = formatted ? `${selectedCountry.dialCode} ${formatted}` : "";
    isInternalUpdate.current = true;
    if (onChange) onChange(fullVal);
  };

  const handleKeyDown = (e) => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.key === "Backspace" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      return;
    }
    // Solo permitir números
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "phone-input");

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
      <div className="flex items-center w-full" style={{ position: "relative" }}>
        {/* Selector de País */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            style={{
              height: 42,
              padding: "0 28px 0 10px",
              border: error ? "1px solid #b42318" : "1px solid #e5e7eb",
              borderRight: "none",
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              background: "#f4f2f0",
              fontSize: 13,
              fontWeight: 500,
              color: "#0c0a08",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
            }}
            title="Seleccionar país"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.dialCode} ({c.name})
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              fontSize: 10,
              color: "#5f5e5d",
            }}
          >
            ▼
          </span>
        </div>

        {/* Input con autoformato cada 4 números */}
        <input
          id={inputId}
          type="text"
          value={nationalNumber}
          onChange={handleNumberChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-paper text-ink placeholder-ash/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border border-danger focus:outline-none focus:border-danger"
              : "border border-smoke focus:outline-none focus:border-ink"
          } ${className}`}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1.4,
            letterSpacing: "0.05em",
          }}
          {...props}
        />
      </div>

      {error && (
        <p style={{ marginTop: 4, fontSize: 12, color: "#b42318", lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
