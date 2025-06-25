import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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
  const [anchorWidth, setAnchorWidth] = React.useState<number>(0);

  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorWidth(anchorRef.current.offsetWidth);
    }
  }, [anchorRef.current]);

  // Filtramos las opciones según lo que se escribe en el Input.
  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(value.trim().toLowerCase())
    );
  }, [options, value]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            "border-input flex h-9 w-full items-center justify-between rounded border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}
        >
          <Input
            {...props}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="h-full flex-1 border-none bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0"
          />
          <Popover.Trigger asChild>
            <button
              type="button"
              className="flex h-full cursor-pointer items-center justify-center pl-2 outline-none"
              aria-label="Abrir opciones"
              onClick={() => setOpen((prev) => !prev)}
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
          sideOffset={0}
          style={{ width: anchorWidth }}
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out relative z-50 rounded-md border shadow-md p-0",
            "max-h-[7.5rem] overflow-y-auto"
          )}
        >
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="cursor-pointer rounded-sm py-1.5 px-3 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
          {/* Opcional: Popover.Arrow se puede ajustar o eliminar si genera separación */}
          {/* <Popover.Arrow className="fill-popover m-0" /> */}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { ComboSelectInput };