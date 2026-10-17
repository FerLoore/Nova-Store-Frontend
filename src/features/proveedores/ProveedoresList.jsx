import { useState } from "react";
import { useProveedores } from "../../hooks/useProveedores";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { ProveedorModal } from "./ProveedorModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function ProveedoresList() {
  const { can } = useAuth();
  const canManage = can("PRODUCTOS_GESTIONAR");

  const {
    proveedores,
    isLoading,
    isError,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  } = useProveedores();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [deletingProveedor, setDeletingProveedor] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProveedor(p);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingProveedor) {
      await updateProveedor({ id: editingProveedor.proveedor_id, data: payload });
    } else {
      await createProveedor(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProveedor) return;
    setIsDeleting(true);
    try {
      await deleteProveedor(deletingProveedor.proveedor_id);
      setDeletingProveedor(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Proveedor",
      accessor: "proveedor_nombre",
      render: (p) => (
        <div>
          <span style={{ fontWeight: 600, color: "#0c0a08", display: "block" }}>
            {p.proveedor_nombre}
          </span>
          {p.proveedor_direccion && (
            <span style={{ fontSize: 12, color: "#5f5e5d", display: "block" }}>
              {p.proveedor_direccion}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "NIT",
      render: (p) => p.proveedor_ruc_nit || "—",
    },
    {
      header: "Teléfono",
      render: (p) => p.proveedor_telefono || "—",
    },
    {
      header: "Correo",
      render: (p) => p.proveedor_correo || "—",
    },
    {
      header: "Acciones",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          {canManage && (
            <>
              <Button variant="compact" onClick={() => handleOpenEdit(p)}>
                Editar
              </Button>
              <Button variant="compact-ghost" onClick={() => setDeletingProveedor(p)}>
                Eliminar
              </Button>
            </>
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
            Abastecimiento
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Proveedores
          </h1>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenCreate}>
            Nuevo Proveedor
          </Button>
        )}
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={proveedores}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin proveedores"
        emptyDescription="No se encontraron proveedores registrados."
        emptyActionLabel={canManage ? "REGISTRAR PRIMER PROVEEDOR" : undefined}
        onEmptyAction={canManage ? handleOpenCreate : undefined}
        keyExtractor={(p) => p.proveedor_id}
      />

      {/* Modal Crear / Editar */}
      <ProveedorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        proveedor={editingProveedor}
        onSave={handleSave}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(deletingProveedor)}
        onClose={() => setDeletingProveedor(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Proveedor"
        message={`¿Confirmas que deseas eliminar el proveedor "${deletingProveedor?.proveedor_nombre}"?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
