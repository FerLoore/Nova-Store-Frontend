import { useQuery } from "@tanstack/react-query";
import { ventaService } from "../api/venta.service";

export function useVentas(options = {}) {
  const { estado, cliente, fecha, enabled = true } = options;

  const query = useQuery({
    queryKey: ["ventas", { estado, cliente, fecha }],
    queryFn: () => ventaService.getVentas({ estado, cliente, fecha }),
    enabled,
    refetchInterval: options.refetchInterval || false,
  });

  return {
    ...query,
    ventas: query.data ?? [],
  };
}
