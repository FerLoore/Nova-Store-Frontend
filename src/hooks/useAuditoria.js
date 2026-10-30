import { useQuery } from "@tanstack/react-query";
import { auditoriaService } from "../api/auditoria.service";

export function useAuditoria(options = {}) {
  const query = useQuery({
    queryKey: ["auditoria"],
    queryFn: auditoriaService.getAuditorias,
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval || false,
  });

  return {
    ...query,
    auditorias: query.data ?? [],
  };
}
