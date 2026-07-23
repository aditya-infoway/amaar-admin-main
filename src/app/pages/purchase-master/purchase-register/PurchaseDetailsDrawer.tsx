import { useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

const INR = (n: any) =>
  "₹ " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FMT3 = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

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
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-right">{value || "—"}</span>
    </div>
  );
}

export function PurchaseDetailsDrawer({ open, purchaseId, onClose }: PurchaseDetailsDrawerProps) {
  const [data, setData] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const handleVerifyItem = async (item: PurchaseDetailItem) => {
    if (item.verified) return;
    setVerifyingId(item.purchaseDetailsId);
    try {
      const res = await Put("purchase/item/verify", { purchaseDetailsId: item.purchaseDetailsId }, false);
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Item verified successfully.");
        setData((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((it) =>
                  it.purchaseDetailsId === item.purchaseDetailsId ? { ...it, verified: true } : it,
                ),
              }
            : prev,
        );
      } else {
        toasterrormsg(res.data?.message || "Failed to verify item.");
      }
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Something went wrong while verifying item.");
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
          toasterrormsg(res.data?.message || "Failed to load purchase details.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to load purchase details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, purchaseId]);

  const totalQty = (data?.items || []).reduce((s, i) => s + Number(i.qty || 0), 0);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div
        className={
          "fixed top-0 right-0 h-full lg:w-[70%] bg-white dark:bg-gray-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary text-white flex-shrink-0">
          <h3 className="font-bold text-base">
            Purchase Bill Details{data?.purchaseBillNo ? ` — ${data.purchaseBillNo}` : ""}
          </h3>
          <Button variant="flat" onClick={onClose} className="!text-white hover:!bg-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
          ) : !data ? (
            <p className="text-sm text-gray-400 text-center py-10">No details found.</p>
          ) : (
            <>
              {/* Bill Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Bill Information
                  </h4>
                  <InfoRow label="Bill No." value={data.billNo} />
                  <InfoRow label="Purchase Bill No" value={data.purchaseBillNo} />
                  <InfoRow label="Purchase Date" value={data.purchaseDate} />
                  <InfoRow label="Terms" value={data.terms} />
                  <InfoRow label="Location" value={data.branchName || "Main Branch"} />
                  <InfoRow label="Status" value={data.billStatus} />
                  {data.narration && <InfoRow label="Narration" value={data.narration} />}
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Party Information
                  </h4>
                  <InfoRow label="Supplier Name" value={data.supplierName} />
                  <InfoRow label="Mobile" value={data.supplierMobile} />
                  <InfoRow label="Address" value={data.supplierAddress} />
                </div>
              </div>

              {/* Items table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Item Details ({data.items?.length || 0})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        {["#", "Verify", "Item Code", "Item Name", "HSN Code", "UOM", "Qty", "Rate (₹)", "Disc (%)", "Taxable (₹)", "GST %", "GST Amt (₹)", "Total (₹)"].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data.items || []).map((item, idx) => (
                        <tr key={item.purchaseDetailsId} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2 text-sm text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2 text-center">
                            {item.verified ? (
                              <Badge color="success" className="rounded-full">
                                Success
                              </Badge>
                            ) : (
                              <Button
                                color="primary"
                                variant="outlined"
                                className="!px-2 !py-1 text-xs"
                                disabled={verifyingId === item.purchaseDetailsId}
                                onClick={() => handleVerifyItem(item)}
                              >
                                {verifyingId === item.purchaseDetailsId ? "..." : "Verify"}
                              </Button>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-primary">{item.itemCode}</td>
                          <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-100 font-medium whitespace-nowrap">{item.itemName}</td>
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{item.hsnCode}</td>
                          <td className="px-3 py-2 text-sm">
                            <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">{item.uom}</span>
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-gray-800 dark:text-gray-100">{FMT3(item.qty)}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{INR(item.rate).replace("₹ ", "")}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-600 dark:text-gray-300">{Number(item.discount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-gray-800 dark:text-gray-100">{INR(item.taxable).replace("₹ ", "")}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">{item.gstPct}%</span>
                          </td>
                          <td className="px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{INR(item.gstAmt).replace("₹ ", "")}</td>
                          <td className="px-3 py-2 text-sm text-right font-extrabold text-gray-900 dark:text-white">{INR(item.total).replace("₹ ", "")}</td>
                        </tr>
                      ))}
                      {(!data.items || data.items.length === 0) && (
                        <tr>
                          <td colSpan={13} className="px-3 py-8 text-center text-sm text-gray-400">
                            No items found for this bill.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5 border-t-2 border-primary/20">
                        <td className="px-3 py-2.5 text-sm font-extrabold text-primary" colSpan={6}>Total</td>
                        <td className="px-3 py-2.5 text-sm text-right font-extrabold text-primary">{FMT3(totalQty)}</td>
                        <td colSpan={2} />
                        <td className="px-3 py-2.5 text-sm text-right font-extrabold text-primary">{INR(data.taxableValue).replace("₹ ", "")}</td>
                        <td />
                        <td className="px-3 py-2.5 text-sm text-right font-extrabold text-primary">{INR(data.gstAmount).replace("₹ ", "")}</td>
                        <td className="px-3 py-2.5 text-sm text-right font-extrabold text-primary">
                          {INR(Number(data.taxableValue) + Number(data.gstAmount)).replace("₹ ", "")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Charges + Tax + Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Charges & Discounts
                  </h4>
                  <InfoRow label="Transport Charges" value={INR(data.transportCharge)} />
                  <InfoRow label="Loading / Unloading" value={INR(data.loadingCharge)} />
                  <InfoRow label="Other Charges" value={INR(data.otherCharge)} />
                  <InfoRow label="Discount Amount" value={INR(data.discountAmount)} />
                  <InfoRow label="Round Off" value={INR(data.roundAmount)} />
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Tax Summary
                  </h4>
                  {Number(data.cgstAmount) > 0 || Number(data.sgstAmount) > 0 ? (
                    <>
                      <InfoRow label="CGST" value={INR(data.cgstAmount)} />
                      <InfoRow label="SGST" value={INR(data.sgstAmount)} />
                    </>
                  ) : (
                    <InfoRow label="IGST" value={INR(data.igstAmount)} />
                  )}
                  <InfoRow label="Total GST" value={INR(data.gstAmount)} />
                </div>

                <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4 flex flex-col justify-center">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Grand Total
                  </span>
                  <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
                    {INR(data.grandTotal)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}