import { useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

const INR = (n: any) =>
  "₹ " +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FMT3 = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

interface PurchaseDetailsDrawerProps {
  open: boolean;
  purchaseId: string | null;
  onClose: () => void;
}

interface PurchaseDetailItem {
  purchaseDetailsId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  uom: string;
  qty: number;
  rate: number;
  discount: number;
  taxable: number;
  gstPct: number;
  gstAmt: number;
  total: number;
  verified: boolean;
}

interface PurchaseDetail {
  purchaseId: number;
  purchaseDate: string;
  purchaseBillNo: string;
  billNo: string;
  terms: string;
  narration: string;
  supplierName: string;
  supplierMobile: string;
  supplierAddress: string;
  branchName: string;
  transportCharge: number;
  loadingCharge: number;
  otherCharge: number;
  discountAmount: number;
  roundAmount: number;
  taxableValue: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  billStatus: string;
  items: PurchaseDetailItem[];
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
      <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="min-w-0 text-right text-sm font-medium wrap-break-word text-gray-800 dark:text-gray-100">
        {value || "—"}
      </span>
    </div>
  );
}

export function PurchaseDetailsDrawer({
  open,
  purchaseId,
  onClose,
}: PurchaseDetailsDrawerProps) {
  const [data, setData] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const handleVerifyItem = async (item: PurchaseDetailItem) => {
    if (item.verified) return;
    setVerifyingId(item.purchaseDetailsId);
    try {
      const res = await Put(
        "purchase/item/verify",
        { purchaseDetailsId: item.purchaseDetailsId },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Item verified successfully.");
        setData((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((it) =>
                  it.purchaseDetailsId === item.purchaseDetailsId
                    ? { ...it, verified: true }
                    : it,
                ),
              }
            : prev,
        );
      } else {
        toasterrormsg(res.data?.message || "Failed to verify item.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message ||
          "Something went wrong while verifying item.",
      );
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    if (!open || !purchaseId) return;
    (async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await Get(`purchase/${purchaseId}`, {}, false);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          toasterrormsg(
            res.data?.message || "Failed to load purchase details.",
          );
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load purchase details.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open, purchaseId]);

  const totalQty = (data?.items || []).reduce(
    (s, i) => s + Number(i.qty || 0),
    0,
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "fixed top-0 right-0 z-50 flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[70%] dark:bg-gray-800 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* Header */}
        <div className="bg-primary-600 flex shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="min-w-0 truncate text-base font-bold">
            Purchase Bill Details
            {data?.purchaseBillNo ? ` — ${data.purchaseBillNo}` : ""}
          </h3>
          <Button
            variant="flat"
            onClick={onClose}
            className="text-white! hover:bg-white/20!"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto p-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Loading...
            </p>
          ) : !data ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No details found.
            </p>
          ) : (
            <>
              {/* Bill Info */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Bill Information
                  </h4>
                  <InfoRow label="Bill No." value={data.billNo} />
                  <InfoRow
                    label="Purchase Bill No"
                    value={data.purchaseBillNo}
                  />
                  <InfoRow label="Purchase Date" value={data.purchaseDate} />
                  <InfoRow label="Terms" value={data.terms} />
                  <InfoRow
                    label="Location"
                    value={data.branchName || "Main Branch"}
                  />
                  <InfoRow label="Status" value={data.billStatus} />
                  {data.narration && (
                    <InfoRow label="Narration" value={data.narration} />
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Party Information
                  </h4>
                  <InfoRow label="Supplier Name" value={data.supplierName} />
                  <InfoRow label="Mobile" value={data.supplierMobile} />
                  <InfoRow label="Address" value={data.supplierAddress} />
                </div>
              </div>

              {/* Items table */}
              <div>
                <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Details ({data.items?.length || 0})
                </h4>
                <div className="min-w-0 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full min-w-275">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        {[
                          "#",
                          "Verify",
                          "Item Code",
                          "Item Name",
                          "HSN Code",
                          "UOM",
                          "Qty",
                          "Rate (₹)",
                          "Disc (%)",
                          "Taxable (₹)",
                          "GST %",
                          "GST Amt (₹)",
                          "Total (₹)",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase dark:text-gray-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data.items || []).map((item, idx) => (
                        <tr
                          key={item.purchaseDetailsId}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="px-3 py-2 text-sm text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.verified ? (
                              <Badge color="success" className="rounded-full">
                                Success
                              </Badge>
                            ) : (
                              <Button
                                color="primary"
                                variant="outlined"
                                className="px-2! py-1! text-xs"
                                disabled={
                                  verifyingId === item.purchaseDetailsId
                                }
                                onClick={() => handleVerifyItem(item)}
                              >
                                {verifyingId === item.purchaseDetailsId
                                  ? "..."
                                  : "Verify"}
                              </Button>
                            )}
                          </td>
                          <td className="text-primary px-3 py-2 text-sm font-bold">
                            {item.itemCode}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-gray-100">
                            {item.itemName}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {item.hsnCode}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-700 dark:text-gray-200">
                              {item.uom}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                            {FMT3(item.qty)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                            {INR(item.rate).replace("₹ ", "")}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                            {Number(item.discount || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                            {INR(item.taxable).replace("₹ ", "")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                              {item.gstPct}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                            {INR(item.gstAmt).replace("₹ ", "")}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-extrabold text-gray-900 dark:text-white">
                            {INR(item.total).replace("₹ ", "")}
                          </td>
                        </tr>
                      ))}
                      {(!data.items || data.items.length === 0) && (
                        <tr>
                          <td
                            colSpan={13}
                            className="px-3 py-8 text-center text-sm text-gray-400"
                          >
                            No items found for this bill.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5 border-primary/20 border-t-2">
                        <td
                          className="text-primary px-3 py-2.5 text-sm font-extrabold"
                          colSpan={6}
                        >
                          Total
                        </td>
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {FMT3(totalQty)}
                        </td>
                        <td colSpan={2} />
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {INR(data.taxableValue).replace("₹ ", "")}
                        </td>
                        <td />
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {INR(data.gstAmount).replace("₹ ", "")}
                        </td>
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {INR(
                            Number(data.taxableValue) + Number(data.gstAmount),
                          ).replace("₹ ", "")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Charges + Tax + Summary */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Charges & Discounts
                  </h4>
                  <InfoRow
                    label="Transport Charges"
                    value={INR(data.transportCharge)}
                  />
                  <InfoRow
                    label="Loading / Unloading"
                    value={INR(data.loadingCharge)}
                  />
                  <InfoRow
                    label="Other Charges"
                    value={INR(data.otherCharge)}
                  />
                  <InfoRow
                    label="Discount Amount"
                    value={INR(data.discountAmount)}
                  />
                  <InfoRow label="Round Off" value={INR(data.roundAmount)} />
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Tax Summary
                  </h4>
                  {Number(data.cgstAmount) > 0 ||
                  Number(data.sgstAmount) > 0 ? (
                    <>
                      <InfoRow label="CGST" value={INR(data.cgstAmount)} />
                      <InfoRow label="SGST" value={INR(data.sgstAmount)} />
                    </>
                  ) : (
                    <InfoRow label="IGST" value={INR(data.igstAmount)} />
                  )}
                  <InfoRow label="Total GST" value={INR(data.gstAmount)} />
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                  <span className="text-sm font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                    Grand Total
                  </span>
                  <p className="mt-1 text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                    {INR(data.grandTotal)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
