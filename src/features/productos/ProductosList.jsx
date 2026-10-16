import { useState } from "react";
import { useProductos } from "../../hooks/useProductos";
import { useAuth } from "../../hooks/useAuth";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { ProductoCreateModal } from "./ProductoCreateModal";
import { ProductoEditModal } from "./ProductoEditModal";
import { VariantesModal } from "./VariantesModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../utils/formatters";

export function ProductosList() {
  const { can } = useAuth();
  const canManage = can("PRODUCTOS_GESTIONAR");

  const {
    productos,
    isLoading,
    isError,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useProductos();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [variantesProducto, setVariantesProducto] = useState(null);
  const [deletingProducto, setDeletingProducto] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mantener variantesProducto sincronizado con el query cache
  const activeVariantesProducto = variantesProducto
    ? productos.find((p) => p.producto_id === variantesProducto.producto_id) ||
      variantesProducto
    : null;

  const handleOpenCreate = () => {
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProducto(p);
  };

  const handleOpenVariantes = (p) => {
    setVariantesProducto(p);
  };

  const handleSaveEdit = async (payload) => {
    if (!editingProducto) return;
    await updateProducto({ id: editingProducto.producto_id, data: payload });
  };

  const handleConfirmDelete = async () => {
    if (!deletingProducto) return;
    setIsDeleting(true);
    try {
      await deleteProducto(deletingProducto.producto_id);
      setDeletingProducto(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calcula rango de precios de venta
  const getPrecioRango = (variantes = []) => {
    if (!variantes || variantes.length === 0) return "—";
    const precios = variantes.map((v) => Number(v.variante_precio_venta)).filter((p) => !isNaN(p));
    if (precios.length === 0) return "—";
    const min = Math.min(...precios);
    const max = Math.max(...precios);
    if (min === max) {
      return formatCurrency(min);
    }
    return `${formatCurrency(min)} — ${formatCurrency(max)}`;
  };

  const columns = [
    {
      header: "Nombre del Producto",
      accessor: "producto_nombre",
      render: (p) => (
        <div>
          <span style={{ fontWeight: 500, color: "#0c0a08", display: "block" }}>
            {p.producto_nombre}
          </span>
          {p.producto_temporada && (
            <span style={{ fontSize: 11, color: "#5f5e5d", letterSpacing: "0.04em", textTransform: "uppercase", display: "block" }}>
              {p.producto_temporada}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Categoría",
      render: (p) => p.categoria?.categoria_nombre || "—",
    },
    {
      header: "Marca",
      render: (p) => p.marca?.marca_nombre || "—",
    },
    {
      header: "Género",
      render: (p) => (
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5f5e5d" }}>
          {p.producto_genero}
        </span>
      ),
    },
    {
      header: "Nº Variantes",
      align: "center",
      render: (p) => (
        <span style={{ fontWeight: 500, color: "#0c0a08" }}>
          {p.variantes ? p.variantes.length : 0}
        </span>
      ),
    },
    {
      header: "Rango P. Venta",
      render: (p) => (
        <span style={{ fontWeight: 500, color: "#0c0a08" }}>
          {getPrecioRango(p.variantes)}
        </span>
      ),
    },
    {
      header: "Acciones",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="compact"
            onClick={() => handleOpenVariantes(p)}
          >
            {canManage ? "Variantes" : "Ver Variantes"}
          </Button>
          {canManage && (
            <>
              <Button
                variant="compact"
                onClick={() => handleOpenEdit(p)}
              >
                Editar
              </Button>
              <Button
                variant="compact-ghost"
                onClick={() => setDeletingProducto(p)}
              >
                Desactivar
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
            Catálogo y stock
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#0c0a08", margin: 0 }}>
            Productos
          </h1>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenCreate}>
            Nuevo producto
          </Button>
        )}
      </div>

      {/* Tabla de Productos */}
      <DataTable
        columns={columns}
        data={productos}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Sin productos activos"
        emptyDescription="No se encontraron productos registrados en el catálogo."
        emptyActionLabel={canManage ? "REGISTRAR PRIMER PRODUCTO" : undefined}
        onEmptyAction={canManage ? handleOpenCreate : undefined}
        keyExtractor={(p) => p.producto_id}
      />

      {/* Modal Crear Producto con Variantes */}
      <ProductoCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={createProducto}
      />

      {/* Modal Editar Producto con Pestaña de Variantes Integrada */}
      <ProductoEditModal
        isOpen={Boolean(editingProducto)}
        onClose={() => setEditingProducto(null)}
        producto={editingProducto}
        onSave={handleSaveEdit}
      />

      {/* Modal Directo de Variantes del Producto */}
      <VariantesModal
        isOpen={Boolean(activeVariantesProducto)}
        onClose={() => setVariantesProducto(null)}
        producto={activeVariantesProducto}
        canManage={canManage}
      />

      {/* Confirmar Desactivación de Producto */}
      <ConfirmDialog
        isOpen={Boolean(deletingProducto)}
        onClose={() => setDeletingProducto(null)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Producto"
        message={`¿Confirmas que deseas desactivar el producto "${deletingProducto?.producto_nombre}"? Esta acción ocultará el producto y sus variantes del catálogo.`}
        confirmLabel="Desactivar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
