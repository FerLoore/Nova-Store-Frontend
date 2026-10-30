import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { pedidoService } from "../api/pedido.service";
import { getErrorMessage } from "../utils/errors";

export function usePedidos(options = {}) {
  const queryClient = useQueryClient();
  const { estado, cliente, cliente_id, fecha, enabled = true } = options;

  const pedidosQuery = useQuery({
    queryKey: ["pedidos", { estado, cliente, cliente_id, fecha }],
    queryFn: () => pedidoService.getPedidos({ estado, cliente: cliente || cliente_id, fecha }),
    enabled,
    refetchInterval: options.refetchInterval || false,
  });

  const createMutation = useMutation({
    mutationFn: pedidoService.createPedido,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["auditoria"] });
      const estado = data?.pedido?.pedido_estado;
      if (estado === "ESPERANDO_APROBACION") {
        toast.success("Pedido enviado a revisión gerencial (Esperando Aprobación)", {
          duration: 5000,
        });
      } else {
        toast.success("¡Pedido creado y aprobado exitosamente!", {
          duration: 4000,
        });
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const aprobarMutation = useMutation({
    mutationFn: (id) => pedidoService.aprobarPedido(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(`Pedido #${id} aprobado exitosamente`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const facturarMutation = useMutation({
    mutationFn: ({ idPedido, pagoMetodo }) =>
      pedidoService.facturarPedido(idPedido, pagoMetodo),
    onSuccess: (data, { idPedido }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: ["reportes"] });
      toast.success(
        `Pedido #${idPedido} facturado exitosamente como Venta #${data?.venta_id ?? ""}`,
        { duration: 5000 }
      );
    },
    onError: (err) => {
      if (err?.response?.status !== 400) {
        toast.error(getErrorMessage(err));
      }
    },
  });

  return {
    ...pedidosQuery,
    pedidos: pedidosQuery.data ?? [],
    createPedido: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    aprobarPedido: aprobarMutation.mutateAsync,
    isApproving: aprobarMutation.isPending,
    facturarPedido: facturarMutation.mutateAsync,
    isFacturando: facturarMutation.isPending,
  };
}
