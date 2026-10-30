import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { compraService } from "../api/compra.service";
import { getErrorMessage } from "../utils/errors";

export function useCompras(options = {}) {
  const queryClient = useQueryClient();

  const comprasQuery = useQuery({
    queryKey: ["compras"],
    queryFn: compraService.getCompras,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: compraService.createCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("Orden de compra creada exitosamente (Estado: PENDIENTE)");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const recibirMutation = useMutation({
    mutationFn: ({ id, almacenId }) => compraService.recibirCompra(id, almacenId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["inventario"] });
      queryClient.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(data?.message || "Compra recibida. Entradas de inventario registradas.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (id) => compraService.cancelarCompra(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      toast.success(data?.message || "Compra cancelada.");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...comprasQuery,
    compras: comprasQuery.data ?? [],
    createCompra: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    recibirCompra: recibirMutation.mutateAsync,
    isRecibiendo: recibirMutation.isPending,
    cancelarCompra: cancelarMutation.mutateAsync,
    isCancelando: cancelarMutation.isPending,
  };
}
