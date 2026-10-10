/**
 * Formatea un número como moneda (Quetzales / USD estándar).
 * @param {number|string|null|undefined} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "Q0.00";
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Formatea una fecha ISO a formato local legible.
 * @param {string|Date|null|undefined} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? String(dateStr)
      : new Intl.DateTimeFormat("es-GT", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(d);
  } catch {
    return String(dateStr);
  }
}
