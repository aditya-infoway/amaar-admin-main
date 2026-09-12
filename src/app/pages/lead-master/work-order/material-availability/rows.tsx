// Import Dependencies
import clsx from "clsx";



import { Column, Getter, Table, Row } from "@tanstack/react-table";


// Local Imports
import { Highlight } from "@/components/shared/Highlight";
import { Tag } from "@/components/ui";
import { ensureString } from "@/utils/ensureString";
import {
  type MaterialItem,
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
  const name = ensureString(getValue());

  return (
    <span className="dark:text-dark-100 font-medium text-gray-800">
      <Highlight query={[globalQuery, columnQuery]}>
        {name}
      </Highlight>
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
  const val = ensureString(getValue());

  return (
    <p className="text-xs-plus w-40 truncate">
      <Highlight query={[globalQuery, columnQuery]}>
        {val}
      </Highlight>
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
}: {
  getValue: Getter<any>;
  row: Row<MaterialItem>;
  column?: Column<MaterialItem>;
  table?: Table<MaterialItem>;
}) {
  const qty = Number(row.original.purchaseRequired ?? getValue() ?? 0);

  return (
    <span
      className={
        qty > 0
          ? "font-medium text-warning-600 dark:text-warning-400"
          : "text-gray-500 dark:text-dark-300"
      }
    >
      {qty}
    </span>
  );
}

  
