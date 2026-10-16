import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ventaService } from "../api/venta.service";
import { getErrorMessage } from "../utils/errors";

export function useVentas(options = {}) {
  const queryClient = useQueryClient();

  const ventasQuery = useQuery({
    queryKey: ["ventas"],
    queryFn: ventaService.getVentas,
    enabled: options.enabled ?? true,
  });

  const createMutation = useMutation({
    mutationFn: ventaService.createVenta,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: ["inventario-general"] });
      queryClient.invalidateQueries({ queryKey: ["inventario-alertas"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success(data?.message || "Venta registrada exitosamente");
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      toast.error(msg);
    },
  });

  return {
    ...ventasQuery,
    ventas: ventasQuery.data ?? [],
    createVenta: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
