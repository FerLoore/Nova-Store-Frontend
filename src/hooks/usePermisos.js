/**
 * usePermisos — hook legado conservado para compatibilidad.
 * El nuevo hook es usePermiso (singular) en src/hooks/usePermiso.js
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { permisoService } from "../api/permiso.service";
import { getErrorMessage } from "../utils/errors";

const EMPTY_ARRAY = [];

export function usePermisos(selectedRolId = null) {
  const queryClient = useQueryClient();

  // Catálogo legado (para compatibilidad con cualquier componente que aún lo use)
  const permisosQuery = useQuery({
    queryKey: ["permisos"],
    queryFn: permisoService.getPermisos,
  });

  // Permisos atómicos del rol (legado)
  const rolPermisosQuery = useQuery({
    queryKey: ["permisos", "rol", selectedRolId],
    queryFn: () => permisoService.getPermisosByRol(selectedRolId),
    enabled: Boolean(selectedRolId),
  });

  // Permisos por módulo del rol (nuevo)
  const modulosQuery = useQuery({
    queryKey: ["permisos-modulo", selectedRolId],
    queryFn: () => permisoService.getPermisosModulo(selectedRolId),
    enabled: Boolean(selectedRolId),
  });

  const updatePermisosMutation = useMutation({
    mutationFn: ({ rolId, permiso_ids }) =>
      permisoService.setPermisosRol(rolId, { permiso_ids }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permisos", "rol", variables.rolId] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Permisos del rol actualizados");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateModulosMutation = useMutation({
    mutationFn: ({ rolId, modulos }) =>
      permisoService.setPermisosModulo(rolId, modulos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permisos-modulo", variables.rolId] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Permisos de módulo actualizados");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    // Legado
    permisos: permisosQuery.data ?? EMPTY_ARRAY,
    isLoadingPermisos: permisosQuery.isLoading,
    rolPermisos: rolPermisosQuery.data ?? EMPTY_ARRAY,
    isLoadingRolPermisos: rolPermisosQuery.isLoading,
    updateRolPermisos: updatePermisosMutation.mutateAsync,
    isUpdatingRolPermisos: updatePermisosMutation.isPending,
    // Nuevos (módulos)
    modulosPermisos: modulosQuery.data ?? null,
    isLoadingModulos: modulosQuery.isLoading,
    updateModulosPermisos: updateModulosMutation.mutateAsync,
    isUpdatingModulos: updateModulosMutation.isPending,
  };
}
