import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { marcaService } from "../api/marca.service";
import { getErrorMessage } from "../utils/errors";

export function useMarcas(options = {}) {
  const queryClient = useQueryClient();

  const marcasQuery = useQuery({
    queryKey: ["marcas"],
    queryFn: marcaService.getMarcas,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: marcaService.createMarca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcas"] });
      toast.success("Marca creada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => marcaService.updateMarca(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcas"] });
      toast.success("Marca actualizada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: marcaService.deleteMarca,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcas"] });
      toast.success("Marca desactivada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...marcasQuery,
    marcas: marcasQuery.data ?? [],
    createMarca: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateMarca: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteMarca: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
