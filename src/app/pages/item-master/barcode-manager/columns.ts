// Import Dependencies
import { createElement } from "react";
import { ColumnDef } from "@tanstack/react-table";

// Local Imports
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { Badge, Button, Input } from "@/components/ui";
import { BarcodePreview } from "./BarcodePreview";
import { BarcodeItem } from "./data";

// ----------------------------------------------------------------------

interface PendingColumnsProps {
  manualDraft: Record<string, string>;
  onManualChange: (id: string, value: string) => void;
  onManualSave: (id: string) => void;
  savingId: string | null;
  onAutoGenerate: (id: string) => void;
  generatingId: string | null;
}

export function createPendingColumns({
  manualDraft,
  onManualChange,
  onManualSave,
  savingId,
  onAutoGenerate,
  generatingId,
}: PendingColumnsProps): ColumnDef<BarcodeItem>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "itemName",
      accessorKey: "itemName",
      header: "Item Name",
      cell: ({ getValue }) =>
        createElement(
          "span",
          { className: "dark:text-dark-100 font-medium text-gray-800" },
          getValue<string>(),
        ),
    },
    {
      id: "mrp",
      accessorKey: "mrp",
      header: "MRP",
      cell: ({ getValue }) => `₹${getValue<string>()}`,
    },
    {
      id: "stock",
      accessorKey: "stock",
      header: "Stock",
      cell: ({ getValue }) => {
        const stock = getValue<number>();
        return createElement(
          Badge,
          { color: stock > 0 ? "success" : "error" },
          stock > 0 ? `✓ ${stock}` : "Out",
        );
      },
    },
    {
      id: "manualBarcode",
      header: "Manual Barcode",
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.id;
        return createElement(
          "div",
          { className: "flex gap-1.5" },
          createElement(Input, {
            value: manualDraft[id] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onManualChange(id, e.target.value),
            placeholder: "Manual...",
            className: "w-32",
          }),
          createElement(
            Button,
            {
              onClick: () => onManualSave(id),
              disabled: savingId === id || !manualDraft[id],
              className: "px-2 text-xs",
            },
            savingId === id ? "..." : "Save",
          ),
        );
      },
    },
    {
      id: "generatedBarcode",
      header: "Generated Barcode",
      enableSorting: false,
      cell: () =>
        createElement(
          "span",
          { className: "text-xs italic text-orange-500" },
          "Not generated",
        ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.id;
        return createElement(
          Button,
          {
            color: "primary",
            onClick: () => onAutoGenerate(id),
            disabled: generatingId === id,
            className: "text-xs",
          },
          generatingId === id ? "..." : "Auto",
        );
      },
    },
  ];
}

interface GeneratedColumnsProps {
  copies: Record<string, number>;
  onCopiesChange: (id: string, value: number) => void;
  onPrintOne: (id: string) => void;
  manualDraft: Record<string, string>;
  onManualChange: (id: string, value: string) => void;
  onManualSave: (id: string) => void;
  savingId: string | null;
}

export function createGeneratedColumns({
  copies,
  onCopiesChange,
  onPrintOne,
  manualDraft,
  onManualChange,
  onManualSave,
  savingId,
}: GeneratedColumnsProps): ColumnDef<BarcodeItem>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "srNo",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      id: "itemName",
      accessorKey: "itemName",
      header: "Item Name",
      cell: ({ getValue }) =>
        createElement(
          "span",
          { className: "dark:text-dark-100 font-medium text-gray-800" },
          getValue<string>(),
        ),
    },
    {
      id: "categoryName",
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ getValue }) =>
        createElement(Badge, { color: "info" }, getValue<string>() || "—"),
    },
    {
      id: "mrp",
      accessorKey: "mrp",
      header: "MRP",
      cell: ({ getValue }) => `₹${getValue<string>()}`,
    },
    {
      id: "salesPrice",
      accessorKey: "salesPrice",
      header: "S.Price",
      cell: ({ getValue }) => `₹${getValue<string>()}`,
    },
    {
      id: "stock",
      accessorKey: "stock",
      header: "Stock",
      cell: ({ getValue }) => {
        const stock = getValue<number>();
        return createElement(
          Badge,
          { color: stock > 0 ? "success" : "error" },
          stock > 0 ? `✓ ${stock}` : "Out",
        );
      },
    },
    {
      id: "barcode",
      accessorKey: "barcode",
      header: "Barcode",
      cell: ({ getValue }) =>
        createElement("span", { className: "font-mono text-xs" }, getValue<string>()),
    },
    {
      id: "copies",
      header: "Copies",
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const value = copies[id] ?? 0;
        return createElement(
          "div",
          { className: "flex items-center gap-1.5" },
          createElement(
            Button,
            {
              isIcon: true,
              className: "size-6",
              onClick: () => onCopiesChange(id, Math.max(0, value - 1)),
            },
            "-",
          ),
          createElement(Input, {
            value: String(value),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onCopiesChange(id, Number(e.target.value) || 0),
            className: "w-14 text-center",
          }),
          createElement(
            Button,
            {
              isIcon: true,
              className: "size-6",
              onClick: () => onCopiesChange(id, value + 1),
            },
            "+",
          ),
        );
      },
    },
    {
      id: "preview",
      header: "Preview",
      enableSorting: false,
      cell: ({ row }) =>
        createElement(BarcodePreview, {
          value: row.original.barcode,
          height: 30,
          width: 1,
          fontSize: 8,
        }),
    },
    {
      id: "print",
      header: "Print",
      enableSorting: false,
      cell: ({ row }) =>
        createElement(
          Button,
          {
            variant: "outlined",
            className: "text-xs",
            onClick: () => onPrintOne(row.original.id),
          },
          "Print",
        ),
    },
    {
      id: "update",
      header: "Update",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const children = [
          createElement(Input, {
            key: "input",
            value: manualDraft[item.id] ?? item.barcode,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onManualChange(item.id, e.target.value),
            disabled: item.barcodeType === "generate",
            className: "w-32 font-mono text-xs",
          }),
        ];

        if (item.barcodeType === "manual") {
          children.push(
            createElement(
              Button,
              {
                key: "save",
                onClick: () => onManualSave(item.id),
                disabled: savingId === item.id,
                className: "px-2 text-xs",
              },
              savingId === item.id ? "..." : "Save",
            ),
          );
        }

        return createElement("div", { className: "flex items-center gap-1.5" }, ...children);
      },
    },
  ];
}