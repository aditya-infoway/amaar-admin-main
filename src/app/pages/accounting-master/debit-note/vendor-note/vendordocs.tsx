// src/app/pages/debit-note/VendorDocs.tsx — Page 2: GRR list or QC list of one vendor

import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { EyeIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Get, toasterrormsg } from "@/ApiHelper";
import { fmtDate, DocType, DocRow } from "./data"; // drop docsByVendor, vendors

const th =
  "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold";
const td = "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5";

export default function DebitNoteVendorDocsPage() {
  const navigate = useNavigate();
  const { vendorId = "", type = "grr" } = useParams<{
    vendorId: string;
    type: DocType;
  }>();

  const docType: DocType = type === "qc" ? "qc" : "grr";
  const label = docType.toUpperCase(); // GRR | QC

  const [searchParams] = useSearchParams();
  const status =
    searchParams.get("status") === "complete" ? "complete" : "pending";

  const [vendor, setVendor] = useState({ vendorName: "", number: "" });
  const [rows, setRows] = useState<DocRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          `debit-note/vendor/${vendorId}/${docType}`,
          { status, financialYearId },
          false,
        );
        if (res.data?.success) {
          setVendor({
            vendorName: res.data.data.vendorName,
            number: res.data.data.number,
          });
          setRows(res.data.data.rows || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load list.");
        }
      } catch (err: any) {
        toasterrormsg(err?.response?.data?.message || "Failed to load list.");
      }
    };
    load();
  }, [vendorId, docType, status]);

  // View opens the existing view page of that GRR / QC
  const handleView = (id: string) =>
    navigate(`/purchase-master/purchase-${docType}/view/${id}`);

  // Action opens the debit note form
  const handleAction = (id: string) =>
    navigate(
      `/accounting-master/debit-note/vendor-note/create/${docType}/${id}`,
    );

  return (
    <Page title={`Debit Note ${label}`}>
      <div className="transition-content w-full px-6 py-4 pb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="dark:text-dark-50 text-xl font-semibold text-gray-800">
              {label} list
            </h2>
            <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500">
              {vendor.vendorName} {vendor.number && `(${vendor.number})`}
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() =>
              navigate("/accounting-master/debit-note/vendor-note")
            }
          >
            Back
          </Button>
        </div>

        <div className="dark:border-dark-500 dark:bg-dark-700 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-700">
              <tr>
                <th className={th}>{label} No</th>
                <th className={th}>{label} Date</th>
                <th className={th}>PO No</th>
                <th className={th}>Bill No</th>
                <th className={`${th} w-24 text-center`}>View</th>
                <th className="w-28 px-4 py-2.5 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="dark:text-dark-100 text-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No {label} found for this vendor.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="dark:border-dark-500 border-t border-gray-200"
                  >
                    <td className={td}>{r.docNo}</td>
                    <td className={td}>{fmtDate(r.docDate)}</td>
                    <td className={td}>{r.poNo}</td>
                    <td className={td}>{r.billNo}</td>
                    <td className={`${td} text-center`}>
                      <button
                        type="button"
                        onClick={() => handleView(r.id)}
                        className="text-primary-600 dark:text-primary-400 cursor-pointer hover:opacity-80"
                        title={`View ${label}`}
                      >
                        <EyeIcon className="size-5" />
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Button
                        type="button"
                        color="primary"
                        className="h-8 cursor-pointer px-3 text-xs"
                        onClick={() => handleAction(r.id)}
                      >
                        <ArrowDownIcon className="size-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
