import { useState, useMemo } from "react";
import { useClientes } from "../../hooks/useClientes";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ClienteModal } from "./ClienteModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function ClientesList() {
  const { can } = useAuth();
  const canManage = can("CLIENTES_GESTIONAR");

  const {
    clientes,
    isLoading,
    isError,
    createCliente,
    updateCliente,
    deleteCliente,
  } = useClientes();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredClientes = useMemo(() => {
    const list = Array.isArray(clientes) ? clientes : [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter((c) => {
      const nombre = (c.cliente_nombre || "").toLowerCase();
      const dpi = (c.cliente_dpi_nit || "").toLowerCase();
      const correo = (c.cliente_correo || "").toLowerCase();
      const tel = (c.cliente_telefono || "").toLowerCase();
      return (
        nombre.includes(term) ||
        dpi.includes(term) ||
        correo.includes(term) ||
        tel.includes(term)
      );
    });
  }, [clientes, searchTerm]);

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCliente(c);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (editingCliente) {
      await updateCliente({ id: editingCliente.cliente_id, data: payload });
    } else {
      await createCliente(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCliente) return;
    setIsDeleting(true);
    try {
      await deleteCliente(deletingCliente.cliente_id);
      setDeletingCliente(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Nombre",
      accessor: "cliente_nombre",
      render: (c) => (
        <span style={{ fontWeight: 500, color: "#0c0a08" }}>{c.cliente_nombre}</span>
      ),
    },
    {
      header: "DPI / NIT",
      accessor: "cliente_dpi_nit",
      render: (c) => c.cliente_dpi_nit || <span style={{ color: "#5f5e5d", opacity: 0.6 }}>—</span>,
    },
    {
      header: "Teléfono",
      accessor: "cliente_telefono",
      render: (c) => c.cliente_telefono || <span style={{ color: "#5f5e5d", opacity: 0.6 }}>—</span>,
    },
    {
      header: "Correo Electrónico",
      accessor: "cliente_correo",
      render: (c) => c.cliente_correo || <span style={{ color: "#5f5e5d", opacity: 0.6 }}>—</span>,
    },
    {
      header: "Dirección",
      accessor: "cliente_direccion",
      render: (c) => (
        <span className="line-clamp-1 max-w-xs text-[12px]">
          {c.cliente_direccion || "—"}
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Acciones",
            align: "right",
            render: (c) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="compact"
                  onClick={() => handleOpenEdit(c)}
                >
                  Editar
                </Button>
                <Button
                  variant="compact-ghost"
                  onClick={() => setDeletingCliente(c)}
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
            Cartera de clientes
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Clientes
          </h1>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenCreate}>
            Nuevo cliente
          </Button>
        )}
      </div>

      {/* Barra de búsqueda local */}
      <div className="max-w-md">
        <Input
          placeholder="BUSCAR POR NOMBRE, DPI/NIT, CORREO O TELÉFONO..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Clientes */}
      <DataTable
        columns={columns}
        data={filteredClientes}
        isLoading={isLoading}
        isError={isError}
        emptyTitle={searchTerm ? "Sin resultados" : "Sin clientes registrados"}
        emptyDescription={
          searchTerm
            ? `No se encontraron coincidencias para "${searchTerm}".`
            : "No hay clientes registrados en la base de datos."
        }
        emptyActionLabel={canManage && !searchTerm ? "REGISTRAR PRIMER CLIENTE" : undefined}
        onEmptyAction={canManage && !searchTerm ? handleOpenCreate : undefined}
        keyExtractor={(c) => c.cliente_id}
      />

      {/* Modal Crear / Editar */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={editingCliente}
        onSave={handleSave}
      />

      {/* Diálogo Confirmación Desactivar */}
      <ConfirmDialog
        isOpen={Boolean(deletingCliente)}
        onClose={() => setDeletingCliente(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Cliente"
        message={`¿Confirmas que deseas desactivar al cliente "${deletingCliente?.cliente_nombre}"?`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
