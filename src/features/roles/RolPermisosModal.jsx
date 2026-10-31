import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { permisoService } from "../../api/permiso.service";
import { getErrorMessage } from "../../utils/errors";
import toast from "react-hot-toast";

const MODULOS = [
  { key: "USUARIOS",     label: "Usuarios",     desc: "Gestión de cuentas de usuario" },
  { key: "ROLES",        label: "Roles",         desc: "Configuración de roles y permisos" },
  { key: "CLIENTES",     label: "Clientes",      desc: "Directorio de clientes" },
  { key: "PRODUCTOS",    label: "Productos",     desc: "Catálogo, variantes y marcas" },
  { key: "INVENTARIO",   label: "Inventario",    desc: "Stock y alertas de inventario" },
  { key: "COMPRAS",      label: "Compras",       desc: "Órdenes de compra y proveedores" },
  { key: "PEDIDOS",      label: "Pedidos",       desc: "Creación de pedidos de venta" },
  { key: "APROBACIONES", label: "Aprobaciones",  desc: "Aprobar o rechazar pedidos" },
  { key: "VENTAS",       label: "Ventas",        desc: "Facturación y ventas directas" },
  { key: "REPORTES",     label: "Reportes",      desc: "KPIs y reportes ejecutivos" },
  { key: "AUDITORIA",    label: "Auditoría",     desc: "Log de cambios del sistema" },
];

const NIVELES = [
  { value: "NINGUNO",   label: "Sin acceso" },
  { value: "LECTURA",   label: "Lectura" },
  { value: "ESCRITURA", label: "Escritura" },
];

const COLORES = {
  NINGUNO:   { bg: "#f4f2f0", text: "#9a9590", dot: "#c8c3be" },
  LECTURA:   { bg: "#e8f4fd", text: "#1a6fa8", dot: "#3498db" },
  ESCRITURA: { bg: "#eafbea", text: "#1a6b1a", dot: "#27ae60" },
};

function NivelSelector({ value, onChange, disabled }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {NIVELES.map((n) => {
        const selected = value === n.value;
        const col = COLORES[n.value];
        return (
          <button
            key={n.value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(n.value)}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              border: selected ? `1.5px solid ${col.dot}` : "1.5px solid #e0dbd5",
              background: selected ? col.bg : "#fff",
              color: selected ? col.text : "#9a9590",
              fontSize: 11,
              fontWeight: selected ? 600 : 400,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: selected ? col.dot : "#c8c3be",
                display: "inline-block",
              }}
            />
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

export function RolPermisosModal({ isOpen, onClose, rol }) {
  const queryClient = useQueryClient();
  const rolId = rol?.rol_id;
  const esAdministrador = rol?.rol_nombre === "ADMINISTRADOR" || rolId === 1;

  // Estado local del mapa módulo→nivel
  const [mapa, setMapa] = useState(() => {
    const m = {};
    for (const mod of MODULOS) m[mod.key] = "NINGUNO";
    return m;
  });

  // Cargar permisos por módulo del rol
  const { data: modulosData, isLoading } = useQuery({
    queryKey: ["permisos-modulo", rolId],
    queryFn: () => permisoService.getPermisosModulo(rolId),
    enabled: isOpen && Boolean(rolId),
  });

  // Sincronizar mapa cuando llegan los datos
  useEffect(() => {
    if (!isOpen) return;
    if (modulosData) {
      setMapa((prev) => {
        const next = { ...prev };
        for (const mod of MODULOS) {
          next[mod.key] = modulosData[mod.key] ?? "NINGUNO";
        }
        return next;
      });
    }
  }, [isOpen, modulosData]);

  // Mutación para guardar
  const saveMutation = useMutation({
    mutationFn: () => permisoService.setPermisosModulo(rolId, mapa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permisos-modulo", rolId] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Permisos del rol actualizados");
      onClose();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleNivelChange = (modulo, nivel) => {
    setMapa((prev) => ({ ...prev, [modulo]: nivel }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos — ${rol?.rol_nombre || ""}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {esAdministrador && (
          <div
            style={{
              background: "#fff8e1",
              border: "1px solid #f0c040",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "#7a5800",
            }}
          >
            ⚠️ El rol <strong>ADMINISTRADOR</strong> tiene acceso total a todos los módulos y no puede modificarse.
          </div>
        )}

        {!esAdministrador && (
          <p style={{ fontSize: 13, color: "#5f5e5d", lineHeight: 1.6 }}>
            Define el nivel de acceso por módulo. <strong>Escritura</strong> implica también <strong>Lectura</strong>.
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="md" />
            <span className="mt-2 text-[12px] uppercase tracking-wider text-[#333]">
              Cargando permisos...
            </span>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #e5e0da",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Cabecera */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                padding: "8px 16px",
                background: "#f4f2f0",
                borderBottom: "1px solid #e5e0da",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5f5e5d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Módulo
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5f5e5d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Nivel de acceso
              </span>
            </div>

            {/* Filas */}
            {MODULOS.map((mod, idx) => (
              <div
                key={mod.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: "10px 16px",
                  alignItems: "center",
                  borderBottom: idx < MODULOS.length - 1 ? "1px solid #f0ebe5" : "none",
                  background: idx % 2 === 0 ? "#fff" : "#faf9f7",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0c0a08", display: "block" }}>
                    {mod.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#9a9590", display: "block", marginTop: 1 }}>
                    {mod.desc}
                  </span>
                </div>
                <NivelSelector
                  value={esAdministrador ? "ESCRITURA" : (mapa[mod.key] ?? "NINGUNO")}
                  onChange={(nivel) => handleNivelChange(mod.key, nivel)}
                  disabled={esAdministrador || saveMutation.isPending}
                />
              </div>
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-end gap-3 pt-4"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => saveMutation.mutate()}
            disabled={esAdministrador || saveMutation.isPending || isLoading}
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar permisos"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
