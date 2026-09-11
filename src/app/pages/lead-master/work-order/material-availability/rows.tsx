// Import Dependencies
import clsx from "clsx";
import { toast } from "sonner";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Column, Getter, Table, Row } from "@tanstack/react-table";
import invariant from "tiny-invariant";

// Local Imports
import { Highlight } from "@/components/shared/Highlight";
import { Tag } from "@/components/ui";
import { ensureString } from "@/utils/ensureString";
import {
  type MaterialItem,
  type PoStatus,
  poStatusOptions,
} from "./data";

// ----------------------------------------------------------------------

export function NameCell({
  getValue,
  column,
  table,
}: {
  getValue: Getter<any>;
  column: Column<MaterialItem>;
  table: Table<MaterialItem>;
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const name = getValue();

  return (
    <span className="dark:text-dark-100 font-medium text-gray-800">
      <Highlight query={[globalQuery, columnQuery]}>{name}</Highlight>
    </span>
  );
}

export function LocationCell({
  getValue,
  column,
  table,
}: {
  getValue: Getter<any>;
  column: Column<MaterialItem>;
  table: Table<MaterialItem>;
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const val = getValue();

  return (
    <p className="text-xs-plus w-40 truncate">
      <Highlight query={[globalQuery, columnQuery]}>{val}</Highlight>
    </p>
  );
}

export function CategoryCell({ getValue }: { getValue: Getter<any> }) {
  return (
    <Tag component="span" className="rounded-full">
      {getValue()}
    </Tag>
  );
}

export function UnitCell({ getValue }: { getValue: Getter<any> }) {
  return (
    <span className="dark:text-dark-200 text-xs-plus text-gray-500">
      {getValue()}
    </span>
  );
  
}

// Available stock: red/warning tint when below required, green when enough
export function AvailableStockCell({
  getValue,
  row,
}: {
  getValue: Getter<any>;
  row: Row<MaterialItem>;
}) {
  const available = getValue();
  const required = row.original.required_stock;
  const short = available < required;

  return (
    <p
      className={clsx(
        "text-sm-plus font-medium",
        short ? "text-error" : "text-success",
      )}
    >
      {available}
    </p>
  );
}

export function RequiredStockCell({ getValue }: { getValue: Getter<any> }) {
  return (
    <p className="dark:text-dark-100 text-sm-plus font-medium text-gray-800">
      {getValue()}
    </p>
  );
}

// Purchase order: editable status listbox, same interaction pattern as
// order_status in the original Orders table.
export function PurchaseOrderCell({
  getValue,
  row,
  column,
  table,
}: {
  getValue: Getter<any>;
  row: Row<MaterialItem>;
  column: Column<MaterialItem>;
  table: Table<MaterialItem>;
}) {
  const poNumber = getValue();
  const status = row.original.po_status;
  const option = poStatusOptions.find((item) => item.value === status);
  invariant(option, "PO status option not found");

  const handleChangeStatus = (nextStatus: PoStatus) => {
    table.options.meta?.updateData?.(row.index, column.id, nextStatus);
    toast.success(`PO status updated to ${
      poStatusOptions.find((item) => item.value === nextStatus)?.label
    }`);
  };

  return (
    <div className="flex flex-col gap-1">
      {poNumber && (
        <span className="text-primary-600 dark:text-primary-400 text-xs-plus font-medium">
          {poNumber}
        </span>
      )}

      <Listbox onChange={handleChangeStatus} value={status}>
        <ListboxButton
          as={Tag}
          component="button"
          color={option.color}
          className="cursor-pointer gap-1.5"
        >
          {option.icon && <option.icon className="h-4 w-4" />}
          <span>{option.label}</span>
        </ListboxButton>
        <Transition
          as={ListboxOptions}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
          anchor={{ to: "bottom start", gap: "8px" }}
          className="text-xs-plus shadow-soft dark:border-dark-500 dark:bg-dark-750 z-100 max-h-60 w-44 overflow-auto rounded-lg border border-gray-300 bg-white py-1 capitalize outline-hidden focus-visible:outline-hidden dark:shadow-none"
        >
          {poStatusOptions.map((item) => (
            <ListboxOption
              key={item.value}
              value={item.value}
              className={({ focus }) =>
                clsx(
                  "dark:text-dark-100 relative flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-gray-800 outline-hidden transition-colors select-none",
                  focus && "dark:bg-dark-600 bg-gray-100",
                )
              }
            >
              {({ selected }) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="size-4.5 stroke-1" />}
                    <span className="block truncate">{item.label}</span>
                  </div>
                  {selected && (
                    <CheckIcon className="-mr-1 size-4.5 stroke-1" />
                  )}
                </div>
              )}
            </ListboxOption>
          ))}
        </Transition>
      </Listbox>
    </div>
  );
}