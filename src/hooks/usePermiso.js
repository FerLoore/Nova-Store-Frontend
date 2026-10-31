import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ORDEN = { NINGUNO: 0, LECTURA: 1, ESCRITURA: 2 };

/**
 * Hook de permisos por módulo.
 *
 * @param {string} modulo - Uno de: USUARIOS, ROLES, CLIENTES, PRODUCTOS, INVENTARIO,
 *   COMPRAS, PEDIDOS, APROBACIONES, VENTAS, REPORTES, AUDITORIA
 * @returns {{ nivel: string, puedeVer: boolean, puedeEscribir: boolean }}
 */
export function usePermiso(modulo) {
  const ctx = useContext(AuthContext);

  if (!ctx || !ctx.usuario) {
    return { nivel: "NINGUNO", puedeVer: false, puedeEscribir: false };
  }

  // ADMINISTRADOR: bypass total
  if (ctx.usuario.rol_id === 1) {
    return { nivel: "ESCRITURA", puedeVer: true, puedeEscribir: true };
  }

  const nivel = ctx.permisosModulo?.[modulo] ?? "NINGUNO";
  const nivelNum = ORDEN[nivel] ?? 0;

  return {
    nivel,
    puedeVer: nivelNum >= ORDEN.LECTURA,
    puedeEscribir: nivelNum >= ORDEN.ESCRITURA,
  };
}

