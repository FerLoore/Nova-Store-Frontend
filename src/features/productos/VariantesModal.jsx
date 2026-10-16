import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { VariantesManager } from "./VariantesManager";

export function VariantesModal({
  isOpen,
  onClose,
  producto,
  canManage = true,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Variantes — ${producto?.producto_nombre || ""}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <VariantesManager
          producto={producto}
          canManage={canManage}
          onClose={onClose}
        />

        <div className="flex justify-end pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
