import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button, Input, Table, TBody, Td, Th, THead, Tr } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";

import type { WorkOrder } from "../shared/types";

interface Props {
  isOpen: boolean;
  close: () => void;
  workOrder: WorkOrder | null;
}

export default function WorkOrderItemsDrawer({
  isOpen,
  close,
  workOrder,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // drawer band/open hone par search reset
    setSearch("");

    if (!isOpen || !workOrder?.id) {
      setItems([]);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const res = await Get(
          `workorder/model-items/${workOrder.id}`,
          {},
          false,
        );

        if (res?.data?.success || res?.data?.status === 200) {
          const payload = res.data.data;
          setItems(Array.isArray(payload) ? payload : payload?.items || []);
        } else {
          setItems([]);
          toasterrormsg(res?.data?.message || "Failed to load items.");
        }
      } catch (error: any) {
        setItems([]);
        toasterrormsg(
          error?.response?.data?.message || "Failed to load items.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, workOrder?.id]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) =>
      [
        it.itemCode,
        it.itemName || it.item,
        it.hsnCode || it.hsn,
        it.itemLocation,
        it.itemCategory,
      ]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q)),
    );
  }, [items, search]);

  const totalQty = filteredItems.reduce(
    (sum, it) => sum + (Number(it.qty) || 0),
    0,
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[90] bg-black/40" onClick={close} />
      )}

      <div
        className={
          "dark:bg-dark-700 fixed top-0 right-0 z-[100] flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[70%] " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* Header */}
        <div className="bg-primary-500 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-bold">
              Item View
              {workOrder?.workOrderNo ? ` - ${workOrder.workOrderNo}` : ""}
            </h3>
            {(workOrder?.modelName || workOrder?.model) && (
              <p className="mt-0.5 text-xs text-white/80">
                Model: {workOrder?.modelName || workOrder?.model}
              </p>
            )}
          </div>
          <Button
            variant="flat"
            onClick={close}
            className="!text-white hover:!bg-white/20"
          >
            <XMarkIcon className="size-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="dark:border-dark-500 flex-shrink-0 border-b border-gray-100 px-4 py-3 sm:px-5">
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search by item code, name, HSN, location, category..."
            prefix={<MagnifyingGlassIcon className="size-4.5" />}
          />
        </div>

        {/* Body: ye area drawer ki bachi hui height leta hai, table iske andar scroll hota hai */}
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
          <div className="dark:border-dark-500 min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200">
       <Table hoverable className="w-full min-w-[800px] table-fixed text-left">
  <THead className="sticky top-0 z-10">
    <Tr>
      <Th className="w-14 text-center">SR No</Th>
      <Th className="w-24">Item Code</Th>
      <Th className="w-auto">Item Name</Th>
      <Th className="w-24">HSN Code</Th>
      <Th className="w-32">Item Location</Th>
      <Th className="w-36">Item Category</Th>
      <Th className="w-16 text-right">Qty</Th>
    </Tr>
  </THead>
  <TBody>
    {loading ? (
      <Tr>
        <Td colSpan={7} className="py-8 text-center text-sm text-gray-400">
          Loading items...
        </Td>
      </Tr>
    ) : filteredItems.length === 0 ? (
      <Tr>
        <Td colSpan={7} className="py-8 text-center text-sm text-gray-400">
          {items.length === 0
            ? "No items found for this model."
            : "No matching items."}
        </Td>
      </Tr>
    ) : (
      filteredItems.map((it, index) => (
        <Tr key={it.id ?? index}>
          <Td className="text-center align-top text-gray-400">{index + 1}</Td>
          <Td className="align-top break-words">{it.itemCode || "—"}</Td>
          <Td className="align-top break-words whitespace-normal">
            {it.itemName || it.item || "—"}
          </Td>
          <Td className="align-top break-words">{it.hsnCode || it.hsn || "—"}</Td>
          <Td className="align-top break-words whitespace-normal">
            {it.itemLocation || "—"}
          </Td>
          <Td className="align-top break-words whitespace-normal">
            {it.itemCategory || "—"}
          </Td>
          <Td className="align-top text-right font-semibold">
            {Number(it.qty) || 0}
          </Td>
        </Tr>
      ))
    )}
  </TBody>
</Table>
          </div>

          {/* Total Qty: scroll ke bahar, hamesha dikhta rahega */}
          {!loading && filteredItems.length > 0 && (
            <div className="border-primary/20 bg-primary/5 text-primary mt-3 flex flex-shrink-0 items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-bold">
              <span>Total Qty</span>
              <span>{totalQty}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dark:border-dark-500 dark:bg-dark-800 flex flex-shrink-0 justify-end border-t border-gray-100 bg-gray-50 px-5 py-4">
          <Button variant="outlined" color="secondary" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}