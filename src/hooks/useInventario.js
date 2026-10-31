import { useQuery } from "@tanstack/react-query";
import { inventarioService } from "../api/inventario.service";

export function useInventario(options = {}) {
  const enabled = options.enabled ?? true;

  const generalQuery = useQuery({
    queryKey: ["inventario-general"],
    queryFn: inventarioService.getInventarioGeneral,
    enabled,
    refetchInterval: 15000,
  });

  const alertasQuery = useQuery({
    queryKey: ["inventario-alertas"],
    queryFn: inventarioService.getAlertasInventario,
    enabled,
    refetchInterval: 15000,
  });

  const kardexQuery = useQuery({
    queryKey: ["inventario-kardex"],
    queryFn: () => inventarioService.getKardex(),
    enabled,
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

    kardex: kardexQuery.data?.data ?? [],
    isLoadingKardex: kardexQuery.isLoading,
    isErrorKardex: kardexQuery.isError,
    refetchKardex: kardexQuery.refetch,

    isLoading: generalQuery.isLoading || alertasQuery.isLoading,
    isError: generalQuery.isError || alertasQuery.isError,
  };
}
