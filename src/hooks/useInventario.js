import { useQuery } from "@tanstack/react-query";
import { inventarioService } from "../api/inventario.service";

export function useInventario(options = {}) {
  const generalQuery = useQuery({
    queryKey: ["inventario-general"],
    queryFn: inventarioService.getInventarioGeneral,
    enabled: options.enabled ?? true,
    refetchInterval: 15000, // Refresco periódico
  });

  const alertasQuery = useQuery({
    queryKey: ["inventario-alertas"],
    queryFn: inventarioService.getAlertasInventario,
    enabled: options.enabled ?? true,
    refetchInterval: 15000,
  });

  return {
    inventario: generalQuery.data ?? [],
    isLoadingGeneral: generalQuery.isLoading,
    isErrorGeneral: generalQuery.isError,
    refetchGeneral: generalQuery.refetch,

    alertas: alertasQuery.data ?? [],
    isLoadingAlertas: alertasQuery.isLoading,
    isErrorAlertas: alertasQuery.isError,
    refetchAlertas: alertasQuery.refetch,

    isLoading: generalQuery.isLoading || alertasQuery.isLoading,
    isError: generalQuery.isError || alertasQuery.isError,
  };
}
