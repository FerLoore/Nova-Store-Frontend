import { useQuery } from "@tanstack/react-query";
import { auditoriaService } from "../api/auditoria.service";

export function useAuditoria(options = {}) {
  const query = useQuery({
    queryKey: ["auditoria"],
    queryFn: auditoriaService.getAuditorias,
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval || false,
  });

  const rawData = query.data;
  const auditoriasList = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.auditorias)
    ? rawData.auditorias
    : [];

  return {
    ...query,
    auditorias: auditoriasList,
  };
}
