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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Variante agregada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateVarianteMutation = useMutation({
    mutationFn: ({ varianteId, data }) => productoService.updateVariante(varianteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Variante actualizada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteVarianteMutation = useMutation({
    mutationFn: (varianteId) => productoService.deleteVariante(varianteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
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
