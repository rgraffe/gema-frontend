import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type ComboboxValue = string | number;

type ComboboxItemBase = {
  label: string;
  value: ComboboxValue;
};

interface ComboboxProps<T extends ComboboxItemBase> {
  data: T[];
  value: ComboboxValue | null;
  onValueChange: (value: ComboboxValue | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Combobox<T extends ComboboxItemBase>({
  data,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  triggerClassName = "",
  contentClassName = "",
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", triggerClassName)}
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", contentClassName)}>
        <Command
          filter={(value, search, keywords) => {
            const searchLower = search.toLocaleLowerCase();
            return value.toLocaleLowerCase().includes(searchLower) ||
              keywords?.some((keyword) =>
                keyword.toLocaleLowerCase().includes(searchLower)
              )
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={String(item.value)}
                  keywords={[item.label.toLocaleLowerCase()]}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
