import { useQuery } from "@tanstack/react-query";
import { reportesService } from "../api/reportes.service";

export function useReportes() {
  const ventasQuery = useQuery({
    queryKey: ["reportes", "ventas"],
    queryFn: reportesService.getVentas,
  });

  const topProductosQuery = useQuery({
    queryKey: ["reportes", "top-productos"],
    queryFn: reportesService.getTopProductos,
  });

  return {
    ventasPorDia: ventasQuery.data ?? [],
    loadingVentas: ventasQuery.isLoading,
    errorVentas: ventasQuery.isError,
    refetchVentas: ventasQuery.refetch,

    topProductos: topProductosQuery.data ?? [],
    loadingTop: topProductosQuery.isLoading,
    errorTop: topProductosQuery.isError,
    refetchTop: topProductosQuery.refetch,

    isLoading: ventasQuery.isLoading || topProductosQuery.isLoading,
    refetchAll: () => {
      ventasQuery.refetch();
      topProductosQuery.refetch();
    },
  };
}
