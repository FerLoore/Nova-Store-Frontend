import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usuarioService } from "../api/usuario.service";
import { getErrorMessage } from "../utils/errors";

export function useUsuarios(options = {}) {
  const queryClient = useQueryClient();

  const usuariosQuery = useQuery({
    queryKey: ["usuarios"],
    queryFn: usuarioService.getUsuarios,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: usuarioService.createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario creado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usuarioService.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usuarioService.deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario desactivado exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...usuariosQuery,
    usuarios: usuariosQuery.data ?? [],
    createUsuario: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUsuario: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteUsuario: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
