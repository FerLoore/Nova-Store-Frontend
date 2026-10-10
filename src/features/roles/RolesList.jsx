import { useState } from "react";
import { useRoles } from "../../hooks/useRoles";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { RolModal } from "./RolModal";
import { RolPermisosModal } from "./RolPermisosModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function RolesList() {
  const {
    roles,
    isLoading,
    isError,
    createRol,
    updateRol,
    deleteRol,
  } = useRoles();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [permisosRol, setPermisosRol] = useState(null);
  const [deletingRol, setDeletingRol] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingRol(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rol) => {
    setEditingRol(rol);
    setModalOpen(true);
  };

  const handleOpenPermisos = (rol) => {
    setPermisosRol(rol);
  };

  const handleSave = async (payload) => {
    if (editingRol) {
      await updateRol({ id: editingRol.rol_id, data: payload });
    } else {
      await createRol(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRol) return;
    setIsDeleting(true);
    try {
      await deleteRol(deletingRol.rol_id);
      setDeletingRol(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Nombre del Rol",
      accessor: "rol_nombre",
      render: (r) => (
        <span style={{ fontWeight: 500, color: "#0c0a08", fontSize: 14 }}>
          {r.rol_nombre}
        </span>
      ),
    },
    {
      header: "Descripción",
      accessor: "rol_descripcion",
      render: (r) => r.rol_descripcion || <span style={{ color: "#5f5e5d", fontStyle: "italic" }}>Sin descripción</span>,
    },
    {
      header: "Acciones",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="compact"
            onClick={() => handleOpenPermisos(r)}
          >
            Permisos
          </Button>
          <Button
            variant="compact"
            onClick={() => handleOpenEdit(r)}
          >
            Editar
          </Button>
          {r.rol_nombre !== "ADMINISTRADOR" && (
            <Button
              variant="compact-ghost"
              onClick={() => setDeletingRol(r)}
            >
              Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: "0 0 6px" }}>
            Control de acceso
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Roles y permisos
          </h1>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          Nuevo rol
        </Button>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin roles registrados"
        emptyDescription="No se encontraron roles activos en el sistema."
        emptyActionLabel="CREAR PRIMER ROL"
        onEmptyAction={handleOpenCreate}
        keyExtractor={(r) => r.rol_id}
      />

      {/* Modal Crear / Editar Rol */}
      <RolModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rol={editingRol}
        onSave={handleSave}
      />

      {/* Modal Editor de Permisos */}
      <RolPermisosModal
        isOpen={Boolean(permisosRol)}
        onClose={() => setPermisosRol(null)}
        rol={permisosRol}
      />

      {/* Diálogo de Confirmación para Desactivar Rol */}
      <ConfirmDialog
        isOpen={Boolean(deletingRol)}
        onClose={() => setDeletingRol(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Rol"
        message={`¿Confirmas que deseas desactivar el rol "${deletingRol?.rol_nombre}"? Esta acción fallará si aún existen usuarios asignados a él.`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
