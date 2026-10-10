import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { rolService } from "../api/rol.service";
import { getErrorMessage } from "../utils/errors";

export function useRoles(options = {}) {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: rolService.getRoles,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: rolService.createRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol creado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => rolService.updateRol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol actualizado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: rolService.deleteRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol desactivado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...rolesQuery,
    roles: rolesQuery.data ?? [],
    createRol: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRol: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRol: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
