/**
 * Extrae el mensaje de error de una respuesta de Axios o devuelve mensaje genérico.
 * @param {any} err
 * @returns {string}
 */
export function getErrorMessage(err) {
  if (!err) return "Ocurrió un error inesperado";
  if (!err.response) {
    return "No se pudo conectar con el servidor";
  }
  const data = err.response.data;
  if (data && typeof data === "object" && data.message) {
    return data.message;
  }
  if (typeof data === "string") {
    if (data.trim().startsWith("<") || data.includes("<!DOCTYPE") || data.includes("<pre>")) {
      const match = data.match(/<pre>(.*?)<\/pre>/s);
      if (match) {
        return match[1].replace(/<br\s*\/?>/gi, " ").trim();
      }
      return `Error del servidor (${err.response.status}): ${err.response.statusText || "Respuesta no esperada"}`;
    }
    return data;
  }
  return err.message || "Error al procesar la solicitud";
}
