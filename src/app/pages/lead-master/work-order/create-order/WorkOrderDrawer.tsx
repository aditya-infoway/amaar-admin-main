import { Fragment, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";

import { Get, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import type { WorkOrder } from "../shared/types";

interface WorkOrderDrawerProps {
  isOpen: boolean;
  close: () => void;
  workOrder: WorkOrder | null;
  onSave: () => void;
  readOnly?: boolean;
}

interface SalesOrderOption {
  id: number;
  soNo: string;

  customerName: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;

  model?: string;
   modelName?: string;
  qty?: number;

  totalAmount?: number;
  label: string;
}

export default function WorkOrderDrawer({
  isOpen,
  close,
  workOrder,
  onSave,
  readOnly = false,
}: WorkOrderDrawerProps) {
  const isEditing = Boolean(workOrder?.id);

  const [workOrderNo, setWorkOrderNo] = useState("");

  const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] =
    useState<SalesOrderOption | null>(null);

  const [loading, setLoading] = useState(false);

  /*
   * Fetch Sales Orders
   */
  useEffect(() => {
    if (!isOpen) return;

    const fetchSalesOrders = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");

        const response = await Get(
          "salesorder/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response?.data?.data || [];

          setSalesOrders(
            list.map((item: any) => ({
              id: Number(item.id),

              soNo: item.soNo || "",

              customerName: item.customerName || "",
              mobile: item.mobile || "",
              email: item.email || "",
              address: item.address || "",
              city: item.city || "",

              model: item.model || "",
              modelName: item.modelName || "",
              qty: Number(item.qty) || 1,

              totalAmount: Number(item.totalAmount) || 0,

              // IMPORTANT: Combobox display
              label: `${item.soNo || "-"} - ${item.customerName || "-"}`,
            })),
          );
        }
      } catch (error) {
        console.error("Sales Order list error:", error);
        toasterrormsg("Unable to load sales orders.");
      }
    };

    fetchSalesOrders();
  }, [isOpen]);

  /*
   * Generate Work Order Number
   */
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const fetchNextWorkOrderNo = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");

        if (!financialYearId) return;

        const response = await Get(
          "workorder/next-number",
          { financialYearId },
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          setWorkOrderNo(response?.data?.data?.workOrderNo || "");
        }
      } catch (error) {
        console.error("Work Order number generation error:", error);
      }
    };

    fetchNextWorkOrderNo();
  }, [isOpen, isEditing]);

  /*
   * Edit Prefill
   */
  useEffect(() => {
    if (!isOpen) return;

    if (workOrder?.id) {
      setWorkOrderNo(workOrder.workOrderNo || "");

      const salesOrder = salesOrders.find(
        (item) => String(item.id) === String(workOrder.salesOrderId),
      );

      setSelectedSalesOrder(salesOrder || null);
    } else {
      setWorkOrderNo("");
      setSelectedSalesOrder(null);
    }
  }, [isOpen, workOrder, salesOrders]);

  /*
   * Amount calculation
   *
   * Sales Order totalAmount is assumed to be
   * GST inclusive at 18%.
   */
  const amount = useMemo(() => {
    const grandTotal = Number(selectedSalesOrder?.totalAmount) || 0;

    const totalPrice = grandTotal / 1.18;

    const gst = grandTotal - totalPrice;

    return {
      totalPrice,
      gst,
      grandTotal,
    };
  }, [selectedSalesOrder]);

  /*
   * Submit
   */
  const handleSubmit = async () => {
    if (!selectedSalesOrder) {
      toasterrormsg("Please select a Sales Order.");
      return;
    }

    try {
      setLoading(true);

      const financialYearId = localStorage.getItem("financialYearId");

      if (!financialYearId) {
        toasterrormsg("Financial Year not found.");
        return;
      }

      const payload = {
        financialYearId,

        workOrderNo,

        salesOrderId: selectedSalesOrder.id,

        customerName: selectedSalesOrder.customerName,

        mobile: selectedSalesOrder.mobile,

        email: selectedSalesOrder.email || "",

        address: selectedSalesOrder.address || "",

        city: selectedSalesOrder.city || "",

        model: selectedSalesOrder.model || "",

        qty: selectedSalesOrder.qty || 1,

        totalPrice: amount.totalPrice,

        gst: amount.gst,

        grandTotal: amount.grandTotal,
      };

      const response =
        isEditing && workOrder?.id
          ? await Put(`workorder/${workOrder.id}`, payload, false)
          : await Post("workorder/create", payload, false);

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          response?.data?.message ||
            (isEditing
              ? "Work Order updated successfully."
              : "Work Order generated successfully."),
        );

        onSave();
        close();
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to generate Work Order.",
        );
      }
    } catch (error: any) {
      console.error("Work Order save error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl flex-col bg-white"
        >
          {/* Header */}
          <div className="bg-primary flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold text-white">
              {readOnly
                ? "View Work Order"
                : isEditing
                  ? "Edit Work Order"
                  : "Create Work Order"}
            </h3>

            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              {/* TOP */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Work Order ID"
                  value={workOrderNo || "Generating..."}
                  disabled
                  onChange={() => {}}
                />

                <div>
                  <Combobox
                    data={salesOrders}
                    displayField="label"
                    value={selectedSalesOrder}
                    onChange={(value: any) => {
                      setSelectedSalesOrder(
                        Array.isArray(value) ? value[0] || null : value || null,
                      );
                    }}
                    placeholder="Select Sales Order"
                    label="Select Sales Order"
                    searchFields={["soNo", "customerName"]}
                    disabled={readOnly || isEditing}
                  />
                </div>

                {/* <Input
                  label="Name"
                  value={
                    selectedSalesOrder?.customerName ||
                    ""
                  }
                  disabled
                  onChange={() => {}}
                /> */}
              </div>

              {/* SALES ORDER DETAILS */}
              <div className="dark:border-dark-500 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <SummaryItem
                    label="Name"
                    value={selectedSalesOrder?.customerName}
                  />

                  <SummaryItem
                    label="Number"
                    value={selectedSalesOrder?.mobile}
                    borderLeft
                  />

                  <SummaryItem label="City" value={selectedSalesOrder?.city} />

                  <SummaryItem
                    label="Email"
                    value={selectedSalesOrder?.email}
                    borderLeft
                  />

                  <SummaryItem
                    label="Address"
                    value={selectedSalesOrder?.address}
                  />

                  <SummaryItem
                    label="Model"
                      value={selectedSalesOrder?.modelName || selectedSalesOrder?.model}
                    borderLeft
                  />

                  <SummaryItem label="Qty" value={selectedSalesOrder?.qty} />

                  <SummaryItem
                    label="Total Price"
                    value={`₹ ${amount.totalPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`}
                    borderLeft
                  />

                  <SummaryItem
                    label="GST"
                    value={`₹ ${amount.gst.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`}
                  />

                  <SummaryItem
                    label="Grand Total"
                    value={`₹ ${amount.grandTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`}
                    borderLeft
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <Button type="button" onClick={close}>
                Cancel
              </Button>

              {!readOnly && (
                <Button
                  type="button"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || !selectedSalesOrder}
                >
                  {loading
                    ? "Generating..."
                    : isEditing
                      ? "Update"
                      : "Generate To Work Order"}
                </Button>
              )}
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

function SummaryItem({
  label,
  value,
  borderLeft = false,
}: {
  label: string;
  value?: string | number | null;
  borderLeft?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700",
        borderLeft ? "sm:border-l" : "",
      ].join(" ")}
    >
      <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase">
        {label}
      </span>

      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {value !== undefined && value !== null && value !== "" ? value : "-"}
      </span>
    </div>
  );
}
