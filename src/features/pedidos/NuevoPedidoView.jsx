import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useClientes } from "../../hooks/useClientes";
import { usePedidos } from "../../hooks/usePedidos";
import { pedidoService } from "../../api/pedido.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { LuSearch, LuLayers, LuPlus, LuMinus, LuTrash2, LuTriangleAlert, LuCircleCheck, LuRotateCcw } from "react-icons/lu";

export function NuevoPedidoView() {
  const navigate = useNavigate();
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { createPedido, isCreating } = usePedidos();

  // Estado del cliente seleccionado
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Estado del buscador de variantes
  const [varianteSearch, setVarianteSearch] = useState("");
  const [variantesResults, setVariantesResults] = useState([]);
  const [isSearchingVariantes, setIsSearchingVariantes] = useState(false);

  // Estado del carrito de pedidos
  // Cada item: { variante, cantidad, precio_unitario, subtotal }
  const [cartItems, setCartItems] = useState([]);

  // Estado del descuento (PED_DESCUENTO)
  const [descuentoInput, setDescuentoInput] = useState("0");

  // Filtrado de clientes para dropdown
  const filteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return clientes.slice(0, 8);
    const term = clienteSearch.toLowerCase();
    return clientes.filter((c) => {
      const nom = (c.cliente_nombre || "").toLowerCase();
      const nit = (c.cliente_dpi_nit || "").toLowerCase();
      const tel = (c.cliente_telefono || "").toLowerCase();
      return nom.includes(term) || nit.includes(term) || tel.includes(term);
    });
  }, [clientes, clienteSearch]);

  // Cargar catálogo completo de variantes
  const handleLoadAllVariantes = async () => {
    setIsSearchingVariantes(true);
    try {
      const results = await pedidoService.getVariantes("");
      const list = Array.isArray(results) ? results : [];
      setVariantesResults(list);
      if (list.length > 0) {
        toast.success(`Catálogo cargado: ${list.length} variante${list.length === 1 ? "" : "s"} disponible${list.length === 1 ? "" : "s"}`, {
          id: "catalogo-loaded",
        });
      } else {
        toast("No se encontraron variantes activas en el catálogo", {
          id: "catalogo-empty",
        });
      }
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      toast.error("No se pudo cargar el catálogo de variantes");
    } finally {
      setIsSearchingVariantes(false);
    }
  };

  // Buscar variantes al presionar Enter o escribir (o cargar todo si está vacío)
  const handleSearchVariantes = async (term) => {
    const q = term !== undefined ? term : varianteSearch;
    if (!q || !q.trim()) {
      return handleLoadAllVariantes();
    }
    setIsSearchingVariantes(true);
    try {
      const results = await pedidoService.getVariantes(q.trim());
      const list = Array.isArray(results) ? results : [];
      setVariantesResults(list);
      if (list.length === 0) {
        toast("No se encontraron variantes con ese SKU o nombre", {
          id: "no-variantes",
        });
      }
    } catch (err) {
      console.error("Error buscando variantes:", err);
      toast.error("No se pudieron buscar las variantes");
    } finally {
      setIsSearchingVariantes(false);
    }
  };

  // Agregar variante al carrito
  const handleAddToCart = (variante) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.variante.variante_id === variante.variante_id);
      const precio = Number(variante.variante_precio_venta || 0);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].cantidad + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          cantidad: newQty,
          subtotal: Math.round(newQty * precio * 100) / 100,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            variante,
            cantidad: 1,
            precio_unitario: precio,
            subtotal: precio,
          },
        ];
      }
    });

    toast.success(`"${variante.producto?.producto_nombre || "Variante"}" agregada al pedido`, {
      id: `add-${variante.variante_id}`,
      duration: 2000,
    });
  };

  // Actualizar cantidad en el carrito
  const handleUpdateQuantity = (varianteId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variante.variante_id === varianteId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              cantidad: newQty,
              subtotal: Math.round(newQty * item.precio_unitario * 100) / 100,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Eliminar item del carrito
  const handleRemoveFromCart = (varianteId) => {
    setCartItems((prev) => prev.filter((item) => item.variante.variante_id !== varianteId));
  };

  // Limpiar carrito
  const handleClearCart = () => {
    setCartItems([]);
    setDescuentoInput("0");
  };

  // Cálculos totales
  const subtotalBruto = useMemo(() => {
    const sum = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    return Math.round(sum * 100) / 100;
  }, [cartItems]);

  const descuentoNumerico = useMemo(() => {
    const val = parseFloat(descuentoInput);
    return isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
  }, [descuentoInput]);

  const totalFinal = useMemo(() => {
    return Math.max(0, Math.round((subtotalBruto - descuentoNumerico) * 100) / 100);
  }, [subtotalBruto, descuentoNumerico]);

  const requiresApproval = descuentoNumerico > 0;

  // Enviar pedido
  const handleSubmitPedido = async () => {
    if (!selectedCliente) {
      toast.error("Por favor selecciona un cliente para el pedido");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Debes agregar al menos una variante al pedido");
      return;
    }

    if (descuentoNumerico > subtotalBruto) {
      toast.error("El descuento no puede ser mayor que el subtotal del pedido");
      return;
    }

    const payload = {
      CLI_CLIENTE: selectedCliente.cliente_id,
      PED_DESCUENTO: descuentoNumerico,
      detalles: cartItems.map((item) => ({
        VAR_VARIANTE: item.variante.variante_id,
        DETPED_CANTIDAD: item.cantidad,
        DETPED_PRECIO_UNITARIO: item.precio_unitario,
      })),
    };

    try {
      const response = await createPedido(payload);
      const estado = response?.pedido?.pedido_estado;

      // Limpiar formulario
      setSelectedCliente(null);
      setCartItems([]);
      setDescuentoInput("0");
      setVarianteSearch("");
      setVariantesResults([]);

      if (estado === "ESPERANDO_APROBACION") {
        navigate("/pedidos/aprobaciones");
      }
    } catch (err) {
      console.error("Error al crear pedido:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0c0a08]">
            Nuevo Pedido
          </h1>
          <p className="text-sm text-[#5f5e5d] mt-1">
            Buscador de clientes y variantes con cálculo automático de totales y solicitud de aprobación por descuento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <Button variant="secondary" onClick={handleClearCart}>
              Vaciar Carrito
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Selección de Cliente y Buscador de Variantes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Selección de Cliente */}
          <div className="bg-paper border border-hairline rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-[#5f5e5d] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-volt"></span>
                1. Cliente del Pedido
              </span>
              {selectedCliente && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCliente(null);
                    setClienteSearch("");
                  }}
                  className="text-xs text-ink hover:underline cursor-pointer font-medium"
                >
                  Cambiar Cliente
                </button>
              )}
            </div>

            {selectedCliente ? (
              <div className="bg-[#f9f8f6] border border-hairline rounded-xl p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#0c0a08] text-base">
                    {selectedCliente.cliente_nombre}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#5f5e5d]">
                    <span>
                      <strong className="text-[#0c0a08]">DPI/NIT:</strong>{" "}
                      {selectedCliente.cliente_dpi_nit || "C/F"}
                    </span>
                    {selectedCliente.cliente_telefono && (
                      <span>
                        <strong className="text-[#0c0a08]">Tel:</strong>{" "}
                        {selectedCliente.cliente_telefono}
                      </span>
                    )}
                    {selectedCliente.cliente_correo && (
                      <span>
                        <strong className="text-[#0c0a08]">Correo:</strong>{" "}
                        {selectedCliente.cliente_correo}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Seleccionado
                </span>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar cliente por nombre, DPI, NIT o teléfono..."
                  value={clienteSearch}
                  onChange={(e) => {
                    setClienteSearch(e.target.value);
                    setIsClientDropdownOpen(true);
                  }}
                  onFocus={() => setIsClientDropdownOpen(true)}
                />

                {isClientDropdownOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-hairline rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {loadingClientes ? (
                      <div className="p-4 text-xs text-center text-[#5f5e5d]">
                        Cargando clientes...
                      </div>
                    ) : filteredClientes.length === 0 ? (
                      <div className="p-4 text-xs text-center text-[#5f5e5d]">
                        No se encontraron clientes activos.
                      </div>
                    ) : (
                      <ul className="divide-y divide-hairline">
                        {filteredClientes.map((c) => (
                          <li
                            key={c.cliente_id}
                            className="p-3 hover:bg-[#faf9f8] cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedCliente(c);
                              setIsClientDropdownOpen(false);
                              setClienteSearch("");
                            }}
                          >
                            <div className="font-medium text-xs text-[#0c0a08]">
                              {c.cliente_nombre}
                            </div>
                            <div className="text-[11px] text-[#5f5e5d] mt-0.5">
                              NIT/DPI: {c.cliente_dpi_nit || "C/F"} • Tel: {c.cliente_telefono || "S/N"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Buscador de Variantes */}
          <div className="bg-paper border border-hairline rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-semibold tracking-wider text-[#5f5e5d] uppercase flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-volt"></span>
              2. Catálogo de Variantes (SKU / Nombre)
            </span>

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Escribe el SKU o nombre del producto y presiona Enter o Buscar..."
                  value={varianteSearch}
                  onChange={(e) => setVarianteSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchVariantes();
                    }
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => handleSearchVariantes()}
                disabled={isSearchingVariantes}
              >
                {isSearchingVariantes ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            {isSearchingVariantes ? (
              <div className="py-8 text-center text-xs text-[#5f5e5d]">
                Buscando productos y variantes...
              </div>
            ) : variantesResults.length === 0 ? (
              <div className="py-8 text-center bg-[#faf9f8] border border-dashed border-hairline rounded-xl p-4">
                <p className="text-xs text-[#5f5e5d]">
                  {varianteSearch.trim()
                    ? "No se encontraron variantes coincidentes con la búsqueda."
                    : "Ingresa un SKU (ej: CAM-BLA-M) o nombre de producto para ver variantes disponibles."}
                </p>
                {!varianteSearch.trim() && (
                  <Button
                    variant="secondary"
                    className="mt-3 text-xs"
                    onClick={() => handleSearchVariantes(" ")}
                  >
                    Cargar Catálogo Completo
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {variantesResults.map((v) => (
                  <div
                    key={v.variante_id}
                    className="p-3 bg-white border border-hairline rounded-xl hover:border-gray-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-[#0c0a08] truncate">
                        {v.producto?.producto_nombre || "Producto"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[#0c0a08] text-[10px] font-mono font-medium">
                          {v.variante_sku}
                        </span>
                        <span className="text-[11px] text-[#5f5e5d]">
                          Talla: <strong>{v.variante_talla}</strong> • Color: <strong>{v.variante_color}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-xs text-ink">
                        {formatCurrency(v.variante_precio_venta)}
                      </span>
                      <Button
                        variant="compact"
                        onClick={() => handleAddToCart(v)}
                      >
                        + Agregar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Carrito y Resumen del Pedido */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-paper border border-hairline rounded-2xl p-5 shadow-xs sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-[#5f5e5d] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-volt"></span>
                3. Carrito del Pedido ({cartItems.length} {cartItems.length === 1 ? "artículo" : "artículos"})
              </span>
            </div>

            {/* Lista de Items en Carrito */}
            {cartItems.length === 0 ? (
              <EmptyState
                title="Carrito Vacío"
                description="Busca variantes en el catálogo y agrégalas para armar el pedido."
              />
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.variante.variante_id}
                    className="p-3 bg-white border border-hairline rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs text-[#0c0a08] truncate">
                        {item.variante.producto?.producto_nombre || "Producto"}
                      </div>
                      <div className="text-[10px] text-[#5f5e5d]">
                        SKU: <span className="font-mono">{item.variante.variante_sku}</span> ({item.variante.variante_talla} / {item.variante.variante_color})
                      </div>
                      <div className="text-xs font-semibold text-[#0c0a08] mt-1">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variante.variante_id, -1)}
                        className="w-6 h-6 rounded border border-hairline bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-[#0c0a08] cursor-pointer"
                        aria-label="Restar uno"
                      >
                        <LuMinus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variante.variante_id, 1)}
                        className="w-6 h-6 rounded border border-hairline bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-[#0c0a08] cursor-pointer"
                        aria-label="Sumar uno"
                      >
                        <LuPlus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.variante.variante_id)}
                        className="ml-1 p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Eliminar del pedido"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sección de Descuento (PED_DESCUENTO) */}
            <div className="pt-4 border-t border-hairline space-y-3">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-[#5f5e5d] uppercase mb-1.5">
                  Descuento del Pedido (PED_DESCUENTO)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8b8d98] font-bold">
                    Q
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotalBruto}
                    value={descuentoInput}
                    onChange={(e) => setDescuentoInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-white border border-hairline rounded-lg focus:outline-ink"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Botones de Presets de Descuento Rápido */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDescuentoInput("0")}
                  className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                    descuentoNumerico === 0
                      ? "bg-ink text-white"
                      : "bg-gray-100 text-[#5f5e5d] hover:bg-gray-200"
                  }`}
                >
                  Sin descuento (Q0)
                </button>
                <button
                  type="button"
                  onClick={() => setDescuentoInput("10")}
                  className="text-[10px] px-2 py-1 rounded bg-gray-100 text-[#5f5e5d] hover:bg-gray-200 font-medium"
                >
                  Q10
                </button>
                <button
                  type="button"
                  onClick={() => setDescuentoInput("25")}
                  className="text-[10px] px-2 py-1 rounded bg-gray-100 text-[#5f5e5d] hover:bg-gray-200 font-medium"
                >
                  Q25
                </button>
                <button
                  type="button"
                  onClick={() => setDescuentoInput("50")}
                  className="text-[10px] px-2 py-1 rounded bg-gray-100 text-[#5f5e5d] hover:bg-gray-200 font-medium"
                >
                  Q50
                </button>
                {subtotalBruto > 0 && (
                  <button
                    type="button"
                    onClick={() => setDescuentoInput((subtotalBruto * 0.1).toFixed(2))}
                    className="text-[10px] px-2 py-1 rounded bg-gray-100 text-[#5f5e5d] hover:bg-gray-200 font-medium"
                  >
                    10%
                  </button>
                )}
              </div>

              {/* Banner Dinámico de Estado según el Descuento */}
              {requiresApproval ? (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
                  <LuTriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Requiere Aprobación Gerencial</strong>
                    <span>
                      Al aplicar un descuento de {formatCurrency(descuentoNumerico)}, el pedido se guardará con estado{" "}
                      <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">
                        ESPERANDO_APROBACION
                      </strong>{" "}
                      hasta que sea aprobado por Gerente o Admin.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2 animate-fadeIn">
                  <LuCircleCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Aprobación Inmediata</strong>
                    <span>
                      Sin descuento aplicado. El pedido se guardará directamente como{" "}
                      <strong className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-[10px]">
                        APROBADO
                      </strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Resumen Final */}
              <div className="bg-[#fcfbf9] border border-hairline rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#5f5e5d]">
                  <span>Subtotal Bruto:</span>
                  <span className="font-medium text-[#0c0a08]">{formatCurrency(subtotalBruto)}</span>
                </div>
                {descuentoNumerico > 0 && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>Descuento aplicado:</span>
                    <span>-{formatCurrency(descuentoNumerico)}</span>
                  </div>
                )}
                <div className="border-t border-hairline pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-[#0c0a08] text-sm">Total del Pedido:</span>
                  <span className="text-xl font-extrabold text-ink">{formatCurrency(totalFinal)}</span>
                </div>
              </div>

              {/* Botón de Envío */}
              <Button
                variant="primary"
                className="w-full py-3 text-sm font-bold tracking-wide"
                disabled={isCreating || cartItems.length === 0 || !selectedCliente}
                onClick={handleSubmitPedido}
              >
                {isCreating ? "Registrando Pedido..." : requiresApproval ? "Enviar Pedido para Aprobación" : "Crear Pedido Aprobado"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
