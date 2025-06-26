import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

export interface ComboSelectInputProps
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ComboSelectInput: React.FC<ComboSelectInputProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number>(0);

  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorWidth(anchorRef.current.offsetWidth);
    }
    // Añadimos 'open' como dependencia por si el ancho cambia al abrir/cerrar
  }, [open, anchorRef.current]);

  const filteredOptions = React.useMemo(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(value.trim().toLowerCase())
    );
    // Ordenamos de forma alfabética y numérica
    return filtered.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [options, value]);

  return (
    // onOpenChange se encargará de actualizar el estado 'open' para todo
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        {/* Este div actuará como el disparador principal */}
        <div
          ref={anchorRef}
          // Este onClick ahora se activará desde el input también
          onClick={() => {
            // Si está cerrado, lo abrimos y enfocamos el input
            if (!open) {
              setOpen(true);
              // Usamos un pequeño timeout para asegurar que el input sea enfocable
              // después de que el estado se actualice
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
          className={cn(
            "border-input flex h-9 w-full items-center justify-between rounded border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
        >
          <Input
            {...props}
            ref={inputRef}
            value={value}
            onChange={(e) => {
              // Abrimos el popover al empezar a escribir si estaba cerrado
              if (!open) setOpen(true);
              onChange(e.target.value);
            }}
            // ----- CAMBIO 1: Eliminado el onClick con stopPropagation -----
            // onClick={(e) => e.stopPropagation()} <-- LÍNEA ELIMINADA
            placeholder={placeholder}
            className="h-full flex-1 border-none bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0"
          />
          {/* El Popover.Trigger ahora gestiona el toggle (abrir/cerrar) por sí mismo */}
          <Popover.Trigger asChild>
            <button
              type="button"
              className="flex h-full cursor-pointer items-center justify-center pl-2 outline-none"
              aria-label="Abrir o cerrar opciones"
              // ----- CAMBIO 2: Eliminado el onClick manual -----
              // Dejamos que Radix controle el clic en este botón
              onClick={(e) => {
                  // detenemos la propagacion para que no active el onClick del div padre
                  e.stopPropagation();
              }}
            >
              {open ? (
                <ChevronUpIcon className="size-4 shrink-0 opacity-50" />
              ) : (
                <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
              )}
            </button>
          </Popover.Trigger>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4} // Un pequeño offset para que no se pegue
          style={{ width: anchorWidth }}
          // Evita que el input pierda el foco al hacer clic en una opción
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 relative z-50 rounded-md border shadow-md p-1",
            "max-h-[10rem] overflow-y-auto"
          )}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="cursor-pointer rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                // onMouseDown previene que el input pierda el foco antes de la selección
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(option.value);
                  setOpen(false); // Cerramos el popover al seleccionar
                  inputRef.current?.focus(); // Mantenemos el foco en el input
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="py-1.5 px-3 text-sm text-muted-foreground">
              No hay resultados.
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { ComboSelectInput };