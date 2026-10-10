import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const EMPTY_ARRAY = [];
import toast from "react-hot-toast";
import { permisoService } from "../api/permiso.service";
import { getErrorMessage } from "../utils/errors";

export function usePermisos(selectedRolId = null) {
  const queryClient = useQueryClient();

  const permisosQuery = useQuery({
    queryKey: ["permisos"],
    queryFn: permisoService.getPermisos,
  });

  const rolPermisosQuery = useQuery({
    queryKey: ["permisos", "rol", selectedRolId],
    queryFn: () => permisoService.getPermisosByRol(selectedRolId),
    enabled: Boolean(selectedRolId),
  });

  const updatePermisosMutation = useMutation({
    mutationFn: ({ rolId, permiso_ids }) =>
      permisoService.setPermisosRol(rolId, { permiso_ids }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permisos", "rol", variables.rolId] });
      // Invalidate current user profile or permissions if necessary
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Permisos del rol actualizados");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    permisos: permisosQuery.data ?? EMPTY_ARRAY,
    isLoadingPermisos: permisosQuery.isLoading,
    rolPermisos: rolPermisosQuery.data ?? EMPTY_ARRAY,
    isLoadingRolPermisos: rolPermisosQuery.isLoading,
    updateRolPermisos: updatePermisosMutation.mutateAsync,
    isUpdatingRolPermisos: updatePermisosMutation.isPending,
  };
}
