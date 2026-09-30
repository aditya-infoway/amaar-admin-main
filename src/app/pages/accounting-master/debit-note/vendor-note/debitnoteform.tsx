// src/app/pages/accounting-master/debit-note/vendor-note/DebitNoteForm.tsx — Page 3
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { fmtDate, DocType } from "./data";

type Option = { id: string; label: string };

type SourceItem = {
  itemId: number;
  itemName: string;
  itemCode: string;
  hsnCode: string;
  rate: number;
  qty: number;
  gstPct: number;
  gstAmount: number;
  net: number;
};

type Source = {
  docNo: string;
  docDate: string;
  poNo: string;
  vendorName: string;
  items: SourceItem[];
  total: number;
};

const PAYMENT_TYPES: Option[] = [
  { id: "credit", label: "Credit" },
  { id: "bank", label: "Bank" },
  { id: "cash", label: "Cash" },
];
const EMPTY: Option = { id: "", label: "" };

const th =
  "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold";
const td = "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5";

export default function DebitNoteFormPage() {
  const navigate = useNavigate();
  const { type = "grr", id = "" } = useParams<{ type: DocType; id: string }>();
  const docType: DocType = type === "qc" ? "qc" : "grr";
  const label = docType.toUpperCase();

  const financialYearId = localStorage.getItem("financialYearId");

  const [debitNoteNo, setDebitNoteNo] = useState("");
  const [src, setSrc] = useState<Source | null>(null);
  const [paymentType, setPaymentType] = useState<Option>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  useEffect(() => {
    const load = async () => {
      try {
        const [noRes, srcRes] = await Promise.all([
          Get("debit-note/next-debit-note-no", { financialYearId }, false),
          Get(`debit-note/source/${docType}/${id}`, {}, false),
        ]);
        if (noRes.data?.success)
          setDebitNoteNo(noRes.data.data?.debitNoteNo || "");
        if (srcRes.data?.success) setSrc(srcRes.data.data);
        else toasterrormsg(srcRes.data?.message || "Failed to load document.");
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load document.",
        );
      }
    };
    load();
  }, [docType, id, financialYearId]);

  const handleSubmit = async () => {
    if (!paymentType.id) return toasterrormsg("Please select a payment type.");
    try {
      setSubmitting(true);
      const companyId = localStorage.getItem("companyId");
      const roleName = localStorage.getItem("roleName");
      const res = await Post(
        "debit-note/create",
        {
          financialYearId: Number(financialYearId),
          type: docType,
          sourceId: id,
          debitNoteDate: today,
          paymentType: paymentType.id,
          createdBy: companyId ? Number(companyId) : undefined,
          createdType: roleName || "Super Admin",
        },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Debit note saved successfully.");
        navigate("/accounting-master/debit-note/vendor-note");
      } else {
        toasterrormsg(res.data?.message || "Failed to save debit note.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Failed to save debit note.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const items = src?.items ?? [];

  return (
    <Page title="Debit Note">
      <div className="transition-content w-full px-6 py-4 pb-5">
        <h2 className="dark:text-dark-50 mb-4 text-xl font-semibold text-gray-800">
          Debit Note
        </h2>

        <div className="dark:border-dark-500 dark:bg-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Debit Note No"
              value={debitNoteNo}
              readOnly
              placeholder="Auto"
            />
            <Input label="Debit Note Date" value={fmtDate(today)} readOnly />
            <Input label={`${label} No`} value={src?.docNo || ""} readOnly />
            <Input
              label={`${label} Date`}
              value={fmtDate(src?.docDate || "")}
              readOnly
            />
            <Input label="Vendor Name" value={src?.vendorName || ""} readOnly />
            <Input label="PO No" value={src?.poNo || ""} readOnly />
          </div>

          <div className="dark:border-dark-500 mt-6 overflow-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-700">
                <tr>
                  <th className={th}>Item Name</th>
                  <th className={th}>Item Code</th>
                  <th className={th}>HSN</th>
                  <th className={`${th} text-right`}>Rate</th>
                  <th className={`${th} text-right`}>Qty</th>
                  <th className={`${th} text-right`}>GST</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Net</th>
                </tr>
              </thead>
              <tbody className="dark:text-dark-100 text-gray-800">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No items to debit.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr
                      key={r.itemId}
                      className="dark:border-dark-500 border-t border-gray-200"
                    >
                      <td className={td}>{r.itemName}</td>
                      <td className={td}>{r.itemCode}</td>
                      <td className={td}>{r.hsnCode}</td>
                      <td className={`${td} text-right`}>
                        {r.rate.toFixed(2)}
                      </td>
                      <td className={`${td} text-right`}>{r.qty}</td>
                      <td className={`${td} text-right`}>
                        {r.gstAmount.toFixed(2)} ({r.gstPct}%)
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {r.net.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr className="dark:border-dark-500 dark:bg-dark-600 border-t-2 border-gray-200 bg-gray-50 font-semibold">
                    <td colSpan={6} className="px-4 py-2.5 text-right">
                      Total
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {(src?.total ?? 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-6 max-w-xs">
            <Listbox
              data={PAYMENT_TYPES}
              value={paymentType}
              onChange={setPaymentType}
              label="Payment Type"
              placeholder="Select payment type"
              displayField="label"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handleSubmit}
              disabled={!paymentType.id || items.length === 0 || submitting}
            >
              {submitting ? "Saving..." : "Save Debit Note"}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
