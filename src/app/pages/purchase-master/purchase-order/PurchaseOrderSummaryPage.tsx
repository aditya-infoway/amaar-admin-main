import { Fragment, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Post, toasterrormsg } from "@/ApiHelper";
import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  Badge,
  Button,
  Checkbox,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import { Page } from "@/components/shared/Page";

type SummaryItem = {
  itemCode: string;
  itemName: string;
  uom: string;
  qty: number;
  rate: number;
  total: number;
};

type SummaryOrder = {
  purchaseOrderId: number;
  poNumber: string;
  serialNo?: number;
  grandTotal: number;
  supplierId: number;
  supplierName: string;
  supplierNumber?: string;
  supplierEmail?: string;
  supplierCity?: string;
  items: SummaryItem[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function PurchaseOrderSummaryPage() {
  const location = useLocation();

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [drawerOrder, setDrawerOrder] = useState<SummaryOrder | any | null>(
    null,
  );

  const toggleSelect = (id: number) =>
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const draft = (location.state as any)?.draft;
  const [orders, setOrders] = useState<SummaryOrder[]>(
    (location.state as any)?.orders || [],
  );
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate(); // add useNavigate to react-router import

const previewGroups = useMemo(() => {
  if (!draft || orders.length > 0) return [];

  const orderOfAppearance: number[] = [];
  const map = new Map<number, any>();

  for (const it of draft.items) {
    const sid = Number(it.supplierId);
    if (!map.has(sid)) {
      orderOfAppearance.push(sid);
      map.set(sid, {
        supplierId: sid,
        supplierName: it.supplierName,
        serialNo: it.serialNo ?? null,
        supplierNumber: it.supplierNumber || "",
        supplierEmail: it.supplierEmail || "",
        supplierCity: it.supplierCity || "",
        items: [] as any[],
        grandTotal: 0,
      });
    }
    const g = map.get(sid)!;
    const taxable = it.qty * it.rate * (1 - (it.discount || 0) / 100);
    const total = taxable + (taxable * (it.gstPct || 0)) / 100;
    g.items.push({
      itemCode: it.itemCode,
      itemName: it.itemName,
      uom: it.uom,
      qty: it.qty,
      rate: it.rate,
      total,
    });
    g.grandTotal += total;
  }

  // Fallback: assign sequential serials if any are still missing
  let fallback = draft.serialNo ?? 1;
  const used = new Set<number>();
  for (const sid of orderOfAppearance) {
    const g = map.get(sid)!;
    if (g.serialNo == null) {
      while (used.has(fallback)) fallback++;
      g.serialNo = fallback;
      used.add(fallback);
      fallback++;
    } else {
      used.add(g.serialNo);
    }
  }

  return orderOfAppearance.map((sid) => map.get(sid)!);
}, [draft, orders]);

  const handleGeneratePO = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const res = await Post("purchase-order/create", draft, false);
      if (res.data?.success) {
        navigate("/purchase-master/purchase-order");
      } else {
        toasterrormsg(res.data?.message || "Failed to generate PO.");
      }
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // TODO: wire up real "send PO by email" endpoint later
  const handleSendEmail = () => {
    if (selectedCount === 0)
      return toasterrormsg("Select at least one supplier to email.");
    toasterrormsg("Email sending isn't wired up yet — coming soon.");
  };

  if (orders.length === 0 && !draft) {
    return (
      <Page title="Purchase Orders Created">
        <div className="dark:bg-dark-900 min-h-screen bg-gray-50 px-3 py-5 sm:px-4 lg:px-5">
          <div className="dark:bg-dark-700 dark:border-dark-500 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              No purchase order data to show — this page only works right after
              saving a PO.
            </p>
            <Link
              to="/purchase-master/purchase-order"
              className="mt-4 inline-block"
            >
              <Button variant="outlined" className="gap-2">
                <ChevronLeftIcon className="size-4" /> Back to Purchase Orders
              </Button>
            </Link>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Purchase Orders Created">
      <div className="dark:bg-dark-900 min-h-screen bg-gray-50 px-3 py-5 sm:px-4 lg:px-5">
        <div className="mx-auto w-full max-w-none">
          <div className="dark:border-dark-500 mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="dark:text-dark-50 text-xl font-extrabold text-gray-800 sm:text-2xl">
                Purchase Orders Created
              </h1>
              <p className="text-sm text-gray-500">
                {orders.length} PO{orders.length > 1 ? "s" : ""} generated — one
                per supplier
              </p>
            </div>
            <Link to="/purchase-master/purchase-order">
              <Button variant="outlined" className="gap-2">
                <ChevronLeftIcon className="size-4" /> Back to Purchase Orders
              </Button>
            </Link>
          </div>

          <div className="dark:border-dark-500 dark:bg-dark-700 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table hoverable className="w-full min-w-[900px] text-left">
              <THead>
                <Tr>
                  <Th className="w-10" />
                  <Th>Vendor Name</Th>
                  <Th>Vendor Number</Th>
                  <Th>Email</Th>
                  <Th>City</Th>
                  <Th className="w-14 text-center">Serial No</Th>
                  <Th>PO No</Th>
                  <Th className="text-right">Amount</Th>
                  <Th className="w-16 text-center">Action</Th>
                </Tr>
              </THead>
              <TBody>
                {(orders.length > 0 ? orders : previewGroups).map((order) => (
                  <Fragment key={order.purchaseOrderId ?? order.supplierId}>
                    <Tr>
                      <Td>
                        <Checkbox
                          checked={
                            !!selected[
                              order.purchaseOrderId ?? order.supplierId
                            ]
                          }
                          onChange={() =>
                            toggleSelect(
                              order.purchaseOrderId ?? order.supplierId,
                            )
                          }
                        />
                      </Td>
                      <Td className="font-medium">{order.supplierName}</Td>
                      <Td>{order.supplierNumber || "—"}</Td>
                      <Td>{order.supplierEmail || "—"}</Td>
                      <Td>{order.supplierCity || "—"}</Td>
                      <Td className="text-center font-medium">
                        {order.serialNo ?? "—"}
                      </Td>
                      <Td>
                        {order.poNumber ? (
                          <Badge
                            variant="outlined"
                            color="primary"
                            className="rounded-full"
                          >
                            {order.poNumber}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </Td>
                      <Td className="text-right font-semibold">
                        {money(order.grandTotal)}
                      </Td>
                      <Td className="text-center">
                        <button
                          type="button"
                          onClick={() => setDrawerOrder(order)}
                          className="dark:hover:bg-dark-600 inline-flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                          aria-label="Show items"
                        >
                          <ChevronDownIcon className="size-4.5 -rotate-90" />
                        </button>
                      </Td>
                    </Tr>
                  </Fragment>
                ))}
              </TBody>
            </Table>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            {orders.length === 0 && draft && (
              <Button
                color="primary"
                disabled={saving}
                onClick={handleGeneratePO}
              >
                {saving ? "Generating..." : "Generate PO"}
              </Button>
            )}
            {orders.length > 0 && (
              <Button color="primary" onClick={handleSendEmail}>
                Send PO by Email {selectedCount > 0 ? `(${selectedCount})` : ""}
              </Button>
            )}
          </div>
        </div>
      </div>

      {drawerOrder && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDrawerOrder(null)}
          />
          <div className="dark:bg-dark-700 fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl lg:w-[50%]">
            <div className="bg-primary flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
              <h3 className="text-base font-bold">
                {drawerOrder.supplierName} — Inward Entries
              </h3>
              <button
                onClick={() => setDrawerOrder(null)}
                className="text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="dark:border-dark-500 border-b border-gray-200">
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Item Code
                    </th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Item Name
                    </th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">
                      Rate
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {drawerOrder.items.map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      className="dark:border-dark-600 border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2">{item.itemCode}</td>
                      <td className="px-3 py-2">{item.itemName}</td>
                      <td className="px-3 py-2">{item.uom}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-right">
                        {money(item.rate)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {money(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
