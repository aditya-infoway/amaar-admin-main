// src/app/pages/debit-note/index.tsx  — Page 1: vendor summary list
import { useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { DocType } from "./data";
import { useEffect, useState } from "react";
import { Get, toasterrormsg } from "@/ApiHelper";

const th =
  "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold";
const td = "dark:border-dark-500 border-r border-gray-200 px-4 py-2.5";

export default function DebitNoteListPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<
    {
      vendorId: string;
      vendorName: string;
      number: number;
      pending: { grr: number; qc: number };
      complete: { grr: number; qc: number };
    }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get("debit-note/vendors", { financialYearId }, false);
        if (res.data?.success) setVendors(res.data.data || []);
        else toasterrormsg(res.data?.message || "Failed to load vendors.");
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load vendors.",
        );
      }
    };
    load();
  }, []);

  const open = (
    vendorId: string,
    type: DocType,
    status: "pending" | "complete",
  ) =>
    navigate(
      `/accounting-master/debit-note/vendor-note/${vendorId}/${type}?status=${status}`,
    );

  // number that opens the next page; plain "0" when nothing to open
  const Count = ({ value, onClick }: { value: number; onClick: () => void }) =>
    value > 0 ? (
      <button
        type="button"
        onClick={onClick}
        className="text-primary-600 dark:text-primary-400 font-semibold underline underline-offset-2 hover:opacity-80"
      >
        {value}
      </button>
    ) : (
      <span className="dark:text-dark-300 text-gray-400">0</span>
    );

  return (
    <Page title="Debit Note">
      <div className="transition-content w-full px-6 py-4 pb-5">
        <h2 className="dark:text-dark-50 mb-4 text-xl font-semibold text-gray-800">
          Debit Note
        </h2>

        <div className="dark:border-dark-500 dark:bg-dark-700 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-700">
              <tr>
                <th rowSpan={2} className={th}>
                  Vendor Name
                </th>
                <th rowSpan={2} className={th}>
                  Number
                </th>
                <th colSpan={2} className={`${th} text-center`}>
                  Pending
                </th>
                <th
                  colSpan={2}
                  className="px-4 py-2.5 text-center font-semibold"
                >
                  Complete
                </th>
              </tr>
              <tr className="dark:border-dark-500 border-t border-gray-200">
                <th className={`${th} text-center`}>GRR</th>
                <th className={`${th} text-center`}>QC</th>
                <th className={`${th} text-center`}>GRR</th>
                <th className="px-4 py-2.5 text-center font-semibold">QC</th>
              </tr>
            </thead>
            <tbody className="dark:text-dark-100 text-gray-800">
              {vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No vendors found.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr
                    key={v.vendorId}
                    className="dark:border-dark-500 border-t border-gray-200"
                  >
                    <td className={td}>{v.vendorName}</td>
                    <td className={td}>{v.number}</td>
                    <td className={`${td} text-center`}>
                      <Count
                        value={v.pending.grr}
                        onClick={() => open(v.vendorId, "grr", "pending")}
                      />
                    </td>
                    <td className={`${td} text-center`}>
                      <Count
                        value={v.pending.qc}
                        onClick={() => open(v.vendorId, "qc", "pending")}
                      />
                    </td>
                    <td className={`${td} text-center`}>
                      <span
                        className={
                          v.complete.grr > 0
                            ? "dark:text-dark-100 text-gray-800"
                            : "dark:text-dark-300 text-gray-400"
                        }
                      >
                        {v.complete.grr}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={
                          v.complete.qc > 0
                            ? "dark:text-dark-100 text-gray-800"
                            : "dark:text-dark-300 text-gray-400"
                        }
                      >
                        {v.complete.qc}
                      </span>
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
