import { File } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

export default function VerManualDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="space-y-3">
          <p className="text-center">
            Antes de empezar, te recomendamos leer la guía de ubicaciones
            técnicas frecuentes
          </p>
          <div className="flex flex-col px-16 gap-2">
            <Button
              className="bg-gema-green hover:bg-green-700"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/guia-ubicaciones-tecnicas.pdf";
                link.download = "guia-ubicaciones-tecnicas.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                localStorage.setItem("haCargadoUbicaciones", "true");
                onOpenChange(true);
              }}
            >
              <File /> Ver guía
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem("haCargadoUbicaciones", "true");
                onOpenChange(true);
              }}
            >
              Continuar sin leer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
