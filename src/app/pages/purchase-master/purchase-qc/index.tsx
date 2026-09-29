import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

type Option = { id: string; label: string };

type GrrItem = {
  grrItemId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  inQty: number; // qty received in GRR (was grrQty)
};

type QcRow = GrrItem & {
  verifyQty: number;
  rQty: number; // inQty - verifyQty
};
const EMPTY: Option = { id: "", label: "" };

export default function QcPage() {
  const navigate = useNavigate();
  // ---- GRR / item selection ----
  const [grrOptions, setGrrOptions] = useState<Option[]>([]);
  const [grrItems, setGrrItems] = useState<GrrItem[]>([]);
  const [selectedGrr, setSelectedGrr] = useState<Option>(EMPTY);
  const [selectedItem, setSelectedItem] = useState<Option>(EMPTY);
  const [reloadKey, setReloadKey] = useState(0);

  // ---- Entry row ----
  const [verifyQty, setVerifyQty] = useState("");

  // ---- Added rows ----
  const [rows, setRows] = useState<QcRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const currentItem = useMemo(
    () => grrItems.find((i) => String(i.grrItemId) === selectedItem.id) || null,
    [grrItems, selectedItem],
  );

  const rQty = useMemo(() => {
    if (!currentItem || verifyQty === "") return "";
    return String(currentItem.inQty - Number(verifyQty));
  }, [currentItem, verifyQty]);

  const itemOptions: Option[] = useMemo(
    () =>
      grrItems
        .filter((i) => !rows.some((r) => r.grrItemId === i.grrItemId))
        .map((i) => ({ id: String(i.grrItemId), label: i.itemName })),
    [grrItems, rows],
  );

  // ---- Load items when GRR changes ----
  const handleGrrChange = async (grr: Option) => {
    setSelectedGrr(grr);
    setSelectedItem(EMPTY);
    setVerifyQty("");
    setRows([]);
    setGrrItems([]);
    if (!grr.id) return;

    try {
      const res = await Get(`purchase-qc/grr-items/${grr.id}`, {}, false);
      if (res.data?.success) {
        setGrrItems(res.data.data?.items || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load GRR items.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Failed to load GRR items.",
      );
    }
  };

  const handleAdd = () => {
    if (!currentItem) return toasterrormsg("Please select an item.");
    if (verifyQty === "" || Number(verifyQty) < 0)
      return toasterrormsg("Please enter a valid Verify Qty.");
    if (Number(verifyQty) > currentItem.inQty)
      return toasterrormsg(
        `Verify Qty cannot be more than GRR In Qty (${currentItem.inQty}).`,
      );

    setRows((prev) => [
      ...prev,
      {
        ...currentItem,
        verifyQty: Number(verifyQty),
        rQty: currentItem.inQty - Number(verifyQty),
      },
    ]);
    setSelectedItem(EMPTY);
    setVerifyQty("");
  };

  const handleRemove = (grrItemId: number) =>
    setRows((prev) => prev.filter((r) => r.grrItemId !== grrItemId));
  const handleCancel = () => {
    setSelectedGrr(EMPTY);
    setSelectedItem(EMPTY);
    setGrrItems([]);
    setVerifyQty("");
    setRows([]);
  };

  const handleSubmit = async () => {
    if (!selectedGrr.id) return toasterrormsg("Please select a GRR.");
    if (rows.length === 0)
      return toasterrormsg("Please add at least one item.");

    try {
      setSubmitting(true);
      const res = await Post(
        "purchase-qc/create",
        {
          financialYearId: Number(localStorage.getItem("financialYearId")),
          grrId: Number(selectedGrr.id),
          items: rows.map((r) => ({
            grrItemId: r.grrItemId,
            verifyQty: r.verifyQty,
          })),
        },
        false,
      );
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "QC saved successfully.");
        handleCancel();
        setReloadKey((k) => k + 1);
      } else {
        toasterrormsg(res.data?.message || "Failed to submit QC.");
      }
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Failed to submit QC.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadGrr = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "purchase-qc/grr-list",
          { financialYearId },
          false,
        );
        if (res.data?.success) {
          setGrrOptions(res.data.data || []);
        } else {
          toasterrormsg(res.data?.message || "Failed to load GRR list.");
        }
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to load GRR list.",
        );
      }
    };
    loadGrr();
  }, [reloadKey]);

  return (
    <Page title="QC">
      <div className="transition-content w-full px-6 py-4 pb-5">
        <h2 className="dark:text-dark-50 mb-4 text-xl font-semibold text-gray-800">
          Purchase QC
        </h2>

        <div className="dark:border-dark-500 dark:bg-dark-700 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          {/* ---- Select GRR / Select Item ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Listbox
              data={grrOptions}
              value={selectedGrr}
              onChange={handleGrrChange}
              label="Select GRR"
              placeholder="Select GRR"
              displayField="label"
            />
            <Listbox
              data={itemOptions}
              value={selectedItem}
              onChange={(item) => {
                setSelectedItem(item);
                setVerifyQty("");
              }}
              label="Select Item"
              placeholder={selectedGrr.id ? "Select item" : "Select GRR first"}
              displayField="label"
              disabled={!selectedGrr.id}
            />
          </div>

          <hr className="dark:border-dark-400 my-5 border-dashed border-gray-300" />

          {/* ---- Entry row ---- */}
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <Input
                label="Item Code"
                value={currentItem?.itemCode || ""}
                readOnly
                placeholder="Item code"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Input
                label="Item Name"
                value={currentItem?.itemName || ""}
                readOnly
                placeholder="Item name"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Input
                label="Verify Qty (Manual)"
                type="number"
                min={0}
                value={verifyQty}
                onChange={(e) => setVerifyQty(e.target.value)}
                placeholder="Enter verify qty"
                disabled={!currentItem}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Input label="R.Qty" value={rQty} readOnly placeholder="Auto" />
            </div>
            <Button
              type="button"
              color="success"
              className="h-9 w-9 shrink-0 p-0 text-lg"
              onClick={handleAdd}
              title="Verify item"
            >
              ✓
            </Button>
          </div>

          {/* ---- Added items table ---- */}
          <div className="dark:border-dark-500 mt-6 h-[520px] overflow-auto rounded-lg border border-gray-200">
            <table className="h-full w-full min-w-[600px] text-left text-sm">
              <thead className="dark:bg-dark-600 dark:text-dark-100 sticky top-0 z-10 bg-gray-100 text-gray-700">
                <tr>
                  <th className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold">
                    Item Code
                  </th>
                  <th className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold">
                    Item Name
                  </th>
                  <th className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold">
                    Verify Qty
                  </th>
                  <th className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5 font-semibold">
                    R.Qty
                  </th>
                  <th className="w-16 px-4 py-2.5 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="dark:text-dark-100 text-gray-800">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="dark:text-dark-300 px-4 py-10 text-center text-gray-500"
                    >
                      No items added. Select an item, enter Verify Qty and click
                      ✓.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.grrItemId}
                      className="dark:border-dark-500 border-t border-gray-200"
                    >
                      <td className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5">
                        {r.itemCode}
                      </td>
                      <td className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5">
                        {r.itemName}
                      </td>
                      <td className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5">
                        {r.verifyQty}
                      </td>
                      <td className="dark:border-dark-500 border-r border-gray-200 px-4 py-2.5">
                        {r.rQty}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(r.grrItemId)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ---- Cancel / Submit ---- */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
