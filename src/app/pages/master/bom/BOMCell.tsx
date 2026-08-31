// src/pages/master/bom/BOMCell.tsx
import { useState } from "react";
import { CellContext } from "@tanstack/react-table";
import { BOMItem } from "./types";

function FieldInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase text-gray-400">{label}</span>
      <input
        {...props}
        className="h-8 w-full rounded-md border border-gray-300 px-2 text-sm focus:border-primary-500 focus:outline-none"
      />
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase text-gray-400">{label}</span>
      <div className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700">
        {value}
      </div>
    </div>
  );
}

export function BOMCell({ row, table }: CellContext<BOMItem, unknown>) {
  const item = row.original;
  const meta = table.options.meta;

  const [mainParent, setMainParentInput] = useState(item.mainParent || item.itemCode);
  const [parentCode, setParentCode] = useState("");
  const [childCode, setChildCode] = useState("");
  const [serial, setSerial] = useState("");
  const [qty, setQty] = useState("");

  const resetFields = () => {
    setParentCode("");
    setChildCode("");
    setSerial("");
    setQty("");
  };

  const handleFirstAdd = () => {
    if (!mainParent.trim() || !parentCode.trim() || !childCode.trim()) return;
    meta?.createBOMWithFirstComponent?.(item, mainParent.trim(), {
      id: crypto.randomUUID(),
      parentCode: parentCode.trim(),
      childCode: childCode.trim(),
      childSerial: serial.trim(),
      qty: qty.trim() || "1",
    });
    resetFields();
  };

  const handleAdd = () => {
    if (!parentCode.trim() || !childCode.trim()) return;
    meta?.addBOMComponent?.(item, {
      id: crypto.randomUUID(),
      parentCode: parentCode.trim(),
      childCode: childCode.trim(),
      childSerial: serial.trim(),
      qty: qty.trim() || "1",
    });
    resetFields();
  };

  // 5-field grid with main parent
  const fiveFieldGridWithMainParent = (
    <div className="grid grid-cols-5 gap-2">
      <FieldInput
        label="Main Parent"
        placeholder="Item code"
        value={mainParent}
        onChange={(e) => setMainParentInput(e.target.value)}
      />
      <FieldInput label="Parent" placeholder="001" value={parentCode} onChange={(e) => setParentCode(e.target.value)} />
      <FieldInput label="Child" placeholder="002" value={childCode} onChange={(e) => setChildCode(e.target.value)} />
      <FieldInput label="Serial" placeholder="1" value={serial} onChange={(e) => setSerial(e.target.value)} />
      <FieldInput label="Qty" type="number" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} />
    </div>
  );

  // 4-field grid without main parent (read-only)
  const fourFieldGridWithoutMainParent = (
    <>
      <div className="grid grid-cols-4 gap-2">
        <FieldInput label="Parent" placeholder="001" value={parentCode} onChange={(e) => setParentCode(e.target.value)} />
        <FieldInput label="Child" placeholder="002" value={childCode} onChange={(e) => setChildCode(e.target.value)} />
        <FieldInput label="Serial" placeholder="1" value={serial} onChange={(e) => setSerial(e.target.value)} />
        <FieldInput label="Qty" type="number" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} />
      </div>
    </>
  );

  // When no BOM exists yet (mainParent is empty)
  if (!item.mainParent) {
    return (
      <div className="min-w-[580px] space-y-2 py-2">
        {fiveFieldGridWithMainParent}
        <button
          type="button"
          className="h-8 w-full rounded-md bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
          onClick={handleFirstAdd}
        >
          Create BOM
        </button>
      </div>
    );
  }

  // When BOM already exists (mainParent is set)
  return (
    <div className="min-w-[480px] space-y-2 py-2">
      <div className="grid grid-cols-5 gap-2">
        <ReadOnlyField label="Main Parent" value={item.mainParent} />
        <FieldInput label="Parent" placeholder="001" value={parentCode} onChange={(e) => setParentCode(e.target.value)} />
        <FieldInput label="Child" placeholder="002" value={childCode} onChange={(e) => setChildCode(e.target.value)} />
        <FieldInput label="Serial" placeholder="1" value={serial} onChange={(e) => setSerial(e.target.value)} />
        <FieldInput label="Qty" type="number" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} />
      </div>
      <button
        type="button"
        className="h-8 w-full rounded-md border border-primary-600 text-sm font-medium text-primary-600 hover:bg-primary-50"
        onClick={handleAdd}
      >
        Add Component
      </button>
    </div>
  );
}