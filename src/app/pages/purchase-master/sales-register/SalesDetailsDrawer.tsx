import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";

const INR = (n: any) =>
  "₹ " +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FMT2 = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FMT3 = (n: any) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

interface SalesDetailsDrawerProps {
  open: boolean;
  salesId: string | null;
  onClose: () => void;
}

interface SalesDetailItem {
  salesDetailsId: number;
  itemId: number;
  itemDescription: string; // Item Description / Model
  hsnCode: string;
  qty: number;
  basicPrice: number;
  taxPct: number;
  taxableAmount: number;
  discount: number;
  netAmount: number;
}

interface SalesDetail {
  salesId: number;
  salesDate: string;
  salesInvoiceNo: string;
  salesOrderNo: string;
  terms: string;
  narration: string;
  partyName: string;
  partyMobile: string;
  partyAddress: string;
  branchName: string;
  subTotal: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  grandTotal: number;
  status: string;
  items: SalesDetailItem[];
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-right text-sm font-medium text-gray-800 dark:text-gray-100">
        {value || "—"}
      </span>
    </div>
  );
}

export function SalesDetailsDrawer({
  open,
  salesId,
  onClose,
}: SalesDetailsDrawerProps) {
  const [data, setData] = useState<SalesDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !salesId) return;
    (async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await Get(`sales/${salesId}`, {}, false);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          toasterrormsg(res.data?.message || "Failed to load sales details.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load sales details.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open, salesId]);

  const totalQty = (data?.items || []).reduce(
    (s, i) => s + Number(i.qty || 0),
    0,
  );
  const totalNet = (data?.items || []).reduce(
    (s, i) => s + Number(i.netAmount || 0),
    0,
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={
          "fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-[70%] dark:bg-gray-800 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* Header */}
        <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
          <h3 className="text-base font-bold">
            Sales Details
            {data?.salesInvoiceNo ? ` — ${data.salesInvoiceNo}` : ""}
          </h3>
          <Button
            variant="flat"
            onClick={onClose}
            className="!text-white hover:!bg-white/20"
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
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
          ) : !data ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No details found.
            </p>
          ) : (
            <>
              {/* Sales Info + Party Info */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Sales Information
                  </h4>
                  <InfoRow label="Sales Invoice No." value={data.salesInvoiceNo} />
                  <InfoRow label="Sales Order No." value={data.salesOrderNo} />
                  <InfoRow label="Sales Date" value={data.salesDate} />
                  <InfoRow label="Terms" value={data.terms} />
                  <InfoRow
                    label="Location"
                    value={data.branchName || "Main Branch"}
                  />
                  <InfoRow label="Status" value={data.status} />
                  {data.narration && (
                    <InfoRow label="Narration" value={data.narration} />
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Party Information
                  </h4>
                  <InfoRow label="Party Name" value={data.partyName} />
                  <InfoRow label="Mobile" value={data.partyMobile} />
                  <InfoRow label="Address" value={data.partyAddress} />
                </div>
              </div>

              {/* Items table */}
              <div>
                <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Item Details ({data.items?.length || 0})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        {[
                          "#",
                          "Item Description / Model",
                          "HSN Code",
                          "Qty",
                          "Basic Price (₹)",
                          "Tax %",
                          "Taxable Amount (₹)",
                          "Discount (₹)",
                          "Net Amount (₹)",
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
                          key={item.salesDetailsId}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="px-3 py-2 text-sm text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-gray-100">
                            {item.itemDescription}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {item.hsnCode}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                            {FMT3(item.qty)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-700 dark:text-gray-200">
                            {FMT2(item.basicPrice)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                              {item.taxPct}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                            {FMT2(item.taxableAmount)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm text-gray-600 dark:text-gray-300">
                            {FMT2(item.discount)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-extrabold text-gray-900 dark:text-white">
                            {FMT2(item.netAmount)}
                          </td>
                        </tr>
                      ))}
                      {(!data.items || data.items.length === 0) && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-3 py-8 text-center text-sm text-gray-400"
                          >
                            No items found for this sale.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5 border-primary/20 border-t-2">
                        <td
                          className="text-primary px-3 py-2.5 text-sm font-extrabold"
                          colSpan={3}
                        >
                          Total
                        </td>
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {FMT3(totalQty)}
                        </td>
                        <td colSpan={2} />
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {FMT2(data.taxableAmount)}
                        </td>
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {FMT2(data.discountAmount)}
                        </td>
                        <td className="text-primary px-3 py-2.5 text-right text-sm font-extrabold">
                          {FMT2(totalNet)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Summary + Grand Total */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Summary
                  </h4>
                  <InfoRow label="Sub Total" value={INR(data.subTotal)} />
                  <InfoRow label="Taxable Amt" value={INR(data.taxableAmount)} />
                  {Number(data.cgstAmount) > 0 || Number(data.sgstAmount) > 0 ? (
                    <>
                      <InfoRow label="CGST" value={INR(data.cgstAmount)} />
                      <InfoRow label="SGST" value={INR(data.sgstAmount)} />
                    </>
                  ) : (
                    <InfoRow label="IGST" value={INR(data.igstAmount)} />
                  )}
                  <InfoRow label="Discount" value={INR(data.discountAmount)} />
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
        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}