import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { Enquiry } from "./data";

const RowActions = createRowActions<Enquiry>("enquiry");

export function createColumns(
  modelOptions: { id: string; label: string }[],
): ColumnDef<Enquiry>[] {
  const modelLabel = (modelId: string) =>
    modelOptions.find((item) => item.id === modelId)?.label || "—";

  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    // ===== display column me "Lead Id" label rakha, data leadCode se aa raha hai =====
    { id: "leadCode", accessorKey: "leadCode", header: "Lead Id", cell: TextCell },
    { id: "name", accessorKey: "name", header: "Name", cell: TextCell },
    { id: "number", accessorKey: "number", header: "Number", cell: TextCell },
    { id: "email", accessorKey: "email", header: "Email", cell: TextCell },
    { id: "address", accessorKey: "address", header: "Address", cell: TextCell },
    { id: "city", accessorKey: "city", header: "City", cell: TextCell },
    {
      id: "model",
      accessorKey: "model",
      header: "Select Model",
      cell: (info) => modelLabel(info.getValue<string>()),
    },
    { id: "remark", accessorKey: "remark", header: "Remark", cell: TextCell },
    { id: "nextFollowupDate", accessorKey: "nextFollowupDate", header: "Next Followup Date", cell: TextCell },
    { id: "actions", header: "Action", cell: RowActions, enableSorting: false },
  ];
}

export function createExportColumns(
  modelOptions: { id: string; label: string }[],
): ExportColumn<Enquiry>[] {
  const modelLabel = (modelId: string) =>
    modelOptions.find((item) => item.id === modelId)?.label || "—";

  return [
    { key: "leadCode", header: "Lead Id" },
    { key: "name", header: "Name" },
    { key: "number", header: "Number" },
    { key: "email", header: "Email" },
    { key: "address", header: "Address" },
    { key: "city", header: "City" },
    { key: "model", header: "Select Model", format: (value: unknown) => modelLabel(value as string) },
    { key: "remark", header: "Remark" },
    { key: "nextFollowupDate", header: "Next Followup Date" },
  ];
}