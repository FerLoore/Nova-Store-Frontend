import { useState } from "react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { UsuarioModal } from "./UsuarioModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatDate } from "../../utils/formatters";

export function UsuariosList() {
  const { usuario: currentUser } = useAuth();
  const {
    usuarios,
    isLoading,
    isError,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  } = useUsuarios();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [deletingUsuario, setDeletingUsuario] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setEditingUsuario(usuario);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingUsuario) {
      await updateUsuario({ id: editingUsuario.usuario_id, data: payload });
    } else {
      await createUsuario(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUsuario) return;
    setIsDeleting(true);
    try {
      await deleteUsuario(deletingUsuario.usuario_id);
      setDeletingUsuario(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Nombre",
      accessor: "usuario_nombre",
      render: (u) => (
        <span style={{ fontWeight: 500, color: "#0c0a08" }}>{u.usuario_nombre}</span>
      ),
    },
    {
      header: "Correo Electrónico",
      accessor: "usuario_email",
    },
    {
      header: "Rol",
      render: (u) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#5f5e5d",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "2px 8px",
            display: "inline-block",
          }}
        >
          {u.rol?.rol_nombre || u.rol_nombre || `Rol #${u.rol_id}`}
        </span>
      ),
    },
    {
      header: "Fecha de Creación",
      render: (u) => formatDate(u.usuario_creado),
    },
    {
      header: "Acciones",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="compact"
            onClick={() => handleOpenEdit(u)}
          >
            Editar
          </Button>
          {/* Si no es el usuario actual autenticado, permitir desactivar */}
          {currentUser?.usuario_id !== u.usuario_id && (
            <Button
              variant="compact-ghost"
              onClick={() => setDeletingUsuario(u)}
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
            Administración de accesos
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Usuarios
          </h1>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          Nuevo usuario
        </Button>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={usuarios}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin usuarios registrados"
        emptyDescription="No se encontraron cuentas de usuario activas en el sistema."
        emptyActionLabel="CREAR PRIMER USUARIO"
        onEmptyAction={handleOpenCreate}
        keyExtractor={(u) => u.usuario_id}
      />

      {/* Modal Crear / Editar */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={editingUsuario}
        onSave={handleSave}
      />

      {/* Diálogo de Confirmación para Desactivar */}
      <ConfirmDialog
        isOpen={Boolean(deletingUsuario)}
        onClose={() => setDeletingUsuario(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Usuario"
        message={`¿Confirmas que deseas desactivar al usuario "${deletingUsuario?.usuario_nombre}"? No podrá volver a iniciar sesión.`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
