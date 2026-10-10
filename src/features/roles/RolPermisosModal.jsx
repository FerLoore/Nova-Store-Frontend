import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { usePermisos } from "../../hooks/usePermisos";

export function RolPermisosModal({ isOpen, onClose, rol }) {
  const {
    permisos,
    isLoadingPermisos,
    rolPermisos,
    isLoadingRolPermisos,
    updateRolPermisos,
    isUpdatingRolPermisos,
  } = usePermisos(rol?.rol_id);

  const [selectedIds, setSelectedIds] = useState([]);

  // Sincronizar checkboxes cuando se abre el modal o cuando llegan los permisos del rol
  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(
      Array.isArray(rolPermisos) && rolPermisos.length > 0
        ? rolPermisos.map((p) => p.permiso_id)
        : []
    );
  }, [isOpen, rolPermisos]);

  const togglePermiso = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!rol) return;
    await updateRolPermisos({
      rolId: rol.rol_id,
      permiso_ids: selectedIds,
    });
    onClose();
  };

  const isLoading = isLoadingPermisos || isLoadingRolPermisos;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos — ${rol?.rol_nombre || ""}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <p style={{ fontSize: 13, color: "#5f5e5d", lineHeight: 1.6 }}>
          Selecciona las casillas correspondientes a las acciones permitidas para este rol.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="md" />
            <span className="mt-2 text-[12px] uppercase tracking-wider text-[#333]">
              Cargando permisos...
            </span>
          </div>
        ) : (
          <div className="border border-hairline divide-y divide-hairline" style={{ borderRadius: 10 }}>
            {permisos.map((permiso) => {
              const isChecked = selectedIds.includes(permiso.permiso_id);
              return (
                <label
                  key={permiso.permiso_id}
                  className="flex items-start gap-3 p-3 cursor-pointer transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f4f2f0"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePermiso(permiso.permiso_id)}
                    className="mt-1 h-4 w-4 cursor-pointer"
                    style={{ borderRadius: 4, accentColor: "#e4f222" }}
                  />
                  <div className="flex-1">
                    <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#0c0a08", display: "block" }}>
                      {permiso.permiso_codigo}
                    </span>
                    <span style={{ fontSize: 12, color: "#5f5e5d", display: "block", marginTop: 2 }}>
                      {permiso.permiso_descripcion}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isUpdatingRolPermisos}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isUpdatingRolPermisos || isLoading}
          >
            {isUpdatingRolPermisos ? "Guardando..." : "Guardar Permisos"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
