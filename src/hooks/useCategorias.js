import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoriaService } from "../api/categoria.service";
import { getErrorMessage } from "../utils/errors";

export function useCategorias(options = {}) {
  const queryClient = useQueryClient();

  const categoriasQuery = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriaService.getCategorias,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: categoriaService.createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoría creada exitosamente");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return {
    ...categoriasQuery,
    categorias: categoriasQuery.data ?? [],
    createCategoria: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
