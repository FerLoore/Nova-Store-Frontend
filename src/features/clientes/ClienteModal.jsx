import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { PhoneInput } from "../../components/ui/PhoneInput";
import { Button } from "../../components/ui/Button";
import { getErrorMessage } from "../../utils/errors";
import { personNameSchema, nitSchema, phoneSchema } from "../../utils/validators";

const clienteSchema = z.object({
  cliente_nombre: personNameSchema("El nombre del cliente"),
  cliente_dpi_nit: nitSchema,
  cliente_telefono: phoneSchema,
  cliente_correo: z
    .string()
    .trim()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Correo electrónico no válido"
    )
    .optional()
    .or(z.literal("")),
  cliente_direccion: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
});

export function ClienteModal({ isOpen, onClose, cliente, onSave }) {
  const isEditing = Boolean(cliente);
  const [apiError, setApiError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      cliente_nombre: "",
      cliente_dpi_nit: "",
      cliente_telefono: "",
      cliente_correo: "",
      cliente_direccion: "",
    },
  });

  useEffect(() => {
    if (cliente) {
      reset({
        cliente_nombre: cliente.cliente_nombre || "",
        cliente_dpi_nit: cliente.cliente_dpi_nit || "",
        cliente_telefono: cliente.cliente_telefono || "",
        cliente_correo: cliente.cliente_correo || "",
        cliente_direccion: cliente.cliente_direccion || "",
      });
    } else {
      reset({
        cliente_nombre: "",
        cliente_dpi_nit: "",
        cliente_telefono: "",
        cliente_correo: "",
        cliente_direccion: "",
      });
    }
    setApiError("");
  }, [cliente, isOpen, reset]);

  const onSubmit = async (values) => {
    setApiError("");
    try {
      const payload = {
        cliente_nombre: values.cliente_nombre,
        cliente_dpi_nit: values.cliente_dpi_nit || null,
        cliente_telefono: values.cliente_telefono || null,
        cliente_correo: values.cliente_correo || null,
        cliente_direccion: values.cliente_direccion || null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div style={{ padding: "10px 14px", border: "1px solid #b42318", borderRadius: 10, fontSize: 13, color: "#b42318", lineHeight: 1.5 }}>
            {apiError}
          </div>
        )}

        <Input
          label="Nombre Completo *"
          placeholder="Ej. Ana Lucía Morales"
          error={errors.cliente_nombre?.message}
          restrictType="letters"
          {...register("cliente_nombre")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="NIT"
            placeholder="1234567-8"
            error={errors.cliente_dpi_nit?.message}
            restrictType="nit"
            maxLength={10}
            {...register("cliente_dpi_nit")}
          />

          <Controller
            name="cliente_telefono"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="Teléfono"
                placeholder="5555 5555"
                error={errors.cliente_telefono?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="cliente@correo.com"
          error={errors.cliente_correo?.message}
          {...register("cliente_correo")}
        />

        <Input
          label="Dirección"
          placeholder="Zona 10, Ciudad de Guatemala"
          error={errors.cliente_direccion?.message}
          {...register("cliente_direccion")}
        />

        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
