import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { clienteService } from "../api/cliente.service";
import { getErrorMessage } from "../utils/errors";

export function useClientes(options = {}) {
  const queryClient = useQueryClient();

  const clientesQuery = useQuery({
    queryKey: ["clientes"],
    queryFn: clienteService.getClientes,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: clienteService.createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente creado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => clienteService.updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente actualizado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clienteService.deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente desactivado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...clientesQuery,
    clientes: clientesQuery.data ?? [],
    createCliente: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCliente: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCliente: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
