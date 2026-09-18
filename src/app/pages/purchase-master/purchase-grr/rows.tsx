// src/app/pages/grr/rows.tsx
import { Getter, Row } from "@tanstack/react-table";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Input, Button } from "@/components/ui";
import { GrrItem } from "./data";

export function InQtyCell({
  getValue,
  row,
  table,
}: {
  getValue: Getter<any>;
  row: Row<GrrItem>;
  table: any;
}) {
  const value = getValue();
  const verified = row.original.verified;

  return (
    <Input
      type="number"
      min={0}
      className="w-full text-right"
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        const newValue = raw === "" ? null : Number(raw);
        table.options.meta?.updateData(row.index, "inQty", newValue);
        table.options.meta?.updateData(row.index, "verified", false);
      }}
      disabled={verified}
    />
  );
}

export function ActionCell({
  row,
  table,
}: {
  row: Row<GrrItem>;
  table: any;
}) {
  const verified = row.original.verified;

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
        <CheckIcon className="size-4" />
        Verified
      </span>
    );
  }

  return (
    <Button
      variant="soft"
      color="success"
      className="size-8 rounded-full p-0"
      onClick={() => table.options.meta?.updateData(row.index, "verified", true)}
      title="Verify this item"
    >
      <CheckIcon className="size-4.5" />
    </Button>
  );
}