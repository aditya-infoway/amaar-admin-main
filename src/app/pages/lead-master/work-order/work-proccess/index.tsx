import { useEffect, useMemo, useState } from "react";

import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, toasterrormsg } from "@/ApiHelper";

import WorkProcessStepper from "./WorkProcessStepper";
import { defaultProcessSteps } from "./dummyData";
import type { WorkOrderOption, WorkProcessStep } from "./types";

export default function WorkProccess() {
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderOption | null>(null);
  const [processMap] = useState<Record<string, WorkProcessStep[]>>({});
  const [loading, setLoading] = useState(false);

  /*
   * Fetch Work Orders for the dropdown
   */
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);

        const financialYearId = localStorage.getItem("financialYearId");

        const response = await Get(
          "workorder/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response?.data?.data || [];

          setWorkOrders(
            list.map((item: any) => ({
              id: Number(item.id),
              workOrderNo: item.workOrderNo || "",
              customerName: item.customerName || "",
              model: item.modelName || item.model || "",
              label: `${item.workOrderNo || "-"} | ${item.customerName || "-"} | ${item.modelName || item.model || "-"}`,
            })),
          );
        }
      } catch (error) {
        console.error("Work Order list error:", error);
        toasterrormsg("Unable to load work orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const currentSteps: WorkProcessStep[] = useMemo(() => {
    if (!selectedOrder) return [];
    return (
      processMap[selectedOrder.workOrderNo] ??
      defaultProcessSteps.map((step) => ({ ...step }))
    );
  }, [selectedOrder, processMap]);

  const handleSelectOrder = (value: any) => {
    const order: WorkOrderOption | null = Array.isArray(value)
      ? value[0] || null
      : value || null;

    setSelectedOrder(order);
  };

  return (
    <div className="p-6">
      <div className="mb-8 max-w-md">
        <Combobox
          data={workOrders}
          displayField="label"
          value={selectedOrder}
          onChange={handleSelectOrder}
          placeholder="ID | Name | Model"
          label="Select Work Order"
          searchFields={["workOrderNo", "customerName", "model"]}
          disabled={loading}
        />
      </div>

      {selectedOrder ? (
        <div className="dark:border-dark-500 dark:bg-dark-700 w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <WorkProcessStepper steps={currentSteps} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {loading
            ? "Loading work orders..."
            : "Please select a work order to view its process status."}
        </p>
      )}
    </div>
  );
}