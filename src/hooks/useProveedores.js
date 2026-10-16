import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { proveedorService } from "../api/proveedor.service";
import { getErrorMessage } from "../utils/errors";

export function useProveedores(options = {}) {
  const queryClient = useQueryClient();

  const proveedoresQuery = useQuery({
    queryKey: ["proveedores"],
    queryFn: proveedorService.getProveedores,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: proveedorService.createProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
      toast.success("Proveedor registrado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => proveedorService.updateProveedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
      toast.success("Proveedor actualizado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: proveedorService.deleteProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
      toast.success("Proveedor eliminado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...proveedoresQuery,
    proveedores: proveedoresQuery.data ?? [],
    createProveedor: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProveedor: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProveedor: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
