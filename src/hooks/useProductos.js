import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productoService } from "../api/producto.service";
import { getErrorMessage } from "../utils/errors";

export function useProductos(options = {}) {
  const queryClient = useQueryClient();

  const productosQuery = useQuery({
    queryKey: ["productos"],
    queryFn: productoService.getProductos,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: productoService.createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Producto creado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productoService.updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Producto actualizado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productoService.deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Producto desactivado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const addVarianteMutation = useMutation({
    mutationFn: ({ productoId, data }) => productoService.addVariante(productoId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      if (vars?.productoId) {
        queryClient.invalidateQueries({ queryKey: ["variantes", vars.productoId] });
      }
      toast.success("Variante agregada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateVarianteMutation = useMutation({
    mutationFn: ({ productoId, varianteId, data }) =>
      productoService.updateVariante(productoId, varianteId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      const pId = vars?.productoId;
      if (pId) {
        queryClient.invalidateQueries({ queryKey: ["variantes", pId] });
      }
      toast.success("Variante actualizada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteVarianteMutation = useMutation({
    mutationFn: ({ productoId, varianteId }) =>
      productoService.deleteVariante(productoId, varianteId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      const pId = vars?.productoId;
      if (pId) {
        queryClient.invalidateQueries({ queryKey: ["variantes", pId] });
      }
      toast.success("Variante desactivada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...productosQuery,
    productos: productosQuery.data ?? [],
    createProducto: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProducto: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProducto: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    addVariante: addVarianteMutation.mutateAsync,
    isAddingVariante: addVarianteMutation.isPending,
    updateVariante: updateVarianteMutation.mutateAsync,
    isUpdatingVariante: updateVarianteMutation.isPending,
    deleteVariante: deleteVarianteMutation.mutateAsync,
    isDeletingVariante: deleteVarianteMutation.isPending,
  };
}

/**
 * Hook para gestionar las variantes específicas de un producto filtrando por PRODU_PRODUCTO
 */
export function useProductoVariantes(productoId) {
  const queryClient = useQueryClient();

  const variantesQuery = useQuery({
    queryKey: ["variantes", productoId],
    queryFn: () => productoService.getVariantesByProducto(productoId),
    enabled: Boolean(productoId),
  });

  const addMutation = useMutation({
    mutationFn: (data) => productoService.addVariante(productoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variantes", productoId] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Variante agregada exitosamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ varianteId, data }) =>
      productoService.updateVariante(productoId, varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variantes", productoId] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Variante actualizada exitosamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (varianteId) =>
      productoService.deleteVariante(productoId, varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variantes", productoId] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Variante desactivada exitosamente");
    },
  });

  return {
    variantes: variantesQuery.data ?? [],
    isLoading: variantesQuery.isLoading,
    isError: variantesQuery.isError,
    refetch: variantesQuery.refetch,
    addVariante: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateVariante: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteVariante: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
