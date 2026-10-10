import { useState } from "react";
import { useMarcas } from "../../hooks/useMarcas";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { MarcaModal } from "./MarcaModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function MarcasList() {
  const { can } = useAuth();
  const canManage = can("PRODUCTOS_GESTIONAR");

  const {
    marcas,
    isLoading,
    isError,
    createMarca,
    updateMarca,
    deleteMarca,
  } = useMarcas();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState(null);
  const [deletingMarca, setDeletingMarca] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingMarca(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMarca(m);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingMarca) {
      await updateMarca({ id: editingMarca.marca_id, data: payload });
    } else {
      await createMarca(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMarca) return;
    setIsDeleting(true);
    try {
      await deleteMarca(deletingMarca.marca_id);
      setDeletingMarca(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Nombre de la Marca",
      accessor: "marca_nombre",
      render: (m) => (
        <span style={{ fontWeight: 500, color: "#0c0a08" }}>
          {m.marca_nombre}
        </span>
      ),
    },
    {
      header: "Descripción",
      accessor: "marca_descripcion",
      render: (m) => m.marca_descripcion || <span style={{ fontSize: 13, color: "#5f5e5d" }}>Sin descripción</span>,
    },
    ...(canManage
      ? [
          {
            header: "Acciones",
            align: "right",
            render: (m) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="compact"
                  onClick={() => handleOpenEdit(m)}
                >
                  Editar
                </Button>
                <Button
                  variant="compact-ghost"
                  onClick={() => setDeletingMarca(m)}
                >
                  Desactivar
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d", margin: "0 0 6px" }}>
            Catálogo general
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Marcas
          </h1>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenCreate}>
            Nueva marca
          </Button>
        )}
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={marcas}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin marcas registradas"
        emptyDescription="No se encontraron marcas registradas en el catálogo."
        emptyActionLabel={canManage ? "REGISTRAR PRIMERA MARCA" : undefined}
        onEmptyAction={canManage ? handleOpenCreate : undefined}
        keyExtractor={(m) => m.marca_id}
      />

      {/* Modal Crear / Editar Marca */}
      <MarcaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        marca={editingMarca}
        onSave={handleSave}
      />

      {/* Diálogo Confirmar Desactivar */}
      <ConfirmDialog
        isOpen={Boolean(deletingMarca)}
        onClose={() => setDeletingMarca(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Marca"
        message={`¿Confirmas que deseas desactivar la marca "${deletingMarca?.marca_nombre}"?`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
